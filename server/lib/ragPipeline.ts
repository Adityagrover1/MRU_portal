import { openai } from './openai.js';
import { supabasePublic, createUserSupabase } from './supabaseAdmin.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------

async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// ---------------------------------------------------------------------------
// Vector similarity search
// ---------------------------------------------------------------------------

interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

async function searchDocuments(queryEmbedding: number[], topK = 5): Promise<DocumentChunk[]> {
  const { data, error } = await supabasePublic.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.35,
    match_count: topK,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return (data as DocumentChunk[]) ?? [];
}

// ---------------------------------------------------------------------------
// Fetch user's drug logs (using their JWT so RLS is enforced)
// ---------------------------------------------------------------------------

interface DrugLog {
  id: string;
  administration_date: string;
  dose_amount: number;
  dose_unit: string;
  animal_count: number;
  drugs: { name: string };
  animal_types: { name: string };
  animals: { tag_id: string; name: string | null } | null;
}

const logsCache = new Map<string, { logs: DrugLog[]; ts: number }>();
const LOGS_TTL_MS = 60_000;

async function fetchUserDrugLogs(userJwt: string): Promise<DrugLog[]> {
  const cached = logsCache.get(userJwt);
  if (cached && Date.now() - cached.ts < LOGS_TTL_MS) return cached.logs;

  const supabase = createUserSupabase(userJwt);

  const { data, error } = await supabase
    .from('drug_usage_logs')
    .select(`
      id,
      administration_date,
      dose_amount,
      dose_unit,
      animal_count,
      drugs (name),
      animal_types (name),
      animals (tag_id, name)
    `)
    .order('administration_date', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Drug logs fetch error:', error);
    return [];
  }

  const logs = (data as unknown as DrugLog[]) ?? [];
  logsCache.set(userJwt, { logs, ts: Date.now() });
  return logs;
}

// ---------------------------------------------------------------------------
// Live MRL status calculation (mirrors the frontend logic)
// ---------------------------------------------------------------------------
// Exponential first-order decay: residue reaches exactly 100% of MRL
// at the end of the withdrawal period.

const WITHDRAWAL_PERIODS: Record<string, Record<string, number>> = {
  Amoxicillin:      { Cattle: 7,  Pig: 7,  Poultry: 3,  Sheep: 7,  Goat: 7  },
  Oxytetracycline:  { Cattle: 28, Pig: 28, Poultry: 10, Sheep: 28, Goat: 28 },
  'Penicillin G':   { Cattle: 5,  Pig: 5,  Poultry: 2,  Sheep: 5,  Goat: 5  },
  Sulfadiazine:     { Cattle: 14, Pig: 14, Poultry: 5,  Sheep: 14, Goat: 14 },
  Chlortetracycline:{ Cattle: 28, Pig: 28, Poultry: 10, Sheep: 28, Goat: 28 },
  Gentamicin:       { Cattle: 14, Pig: 14, Poultry: 7,  Sheep: 14, Goat: 14 },
  Enrofloxacin:     { Cattle: 28, Pig: 14, Poultry: 10, Sheep: 28, Goat: 28 },
  Metronidazole:    { Cattle: 7,  Pig: 7,  Poultry: 5,  Sheep: 7,  Goat: 7  },
  Ampicillin:       { Cattle: 7,  Pig: 7,  Poultry: 3,  Sheep: 7,  Goat: 7  },
  Streptomycin:     { Cattle: 30, Pig: 30, Poultry: 14, Sheep: 30, Goat: 30 },
  Tetracycline:     { Cattle: 28, Pig: 28, Poultry: 10, Sheep: 28, Goat: 28 },
  Erythromycin:     { Cattle: 14, Pig: 7,  Poultry: 7,  Sheep: 14, Goat: 14 },
  Neomycin:         { Cattle: 30, Pig: 30, Poultry: 14, Sheep: 30, Goat: 30 },
};

function getLiveStatus(log: DrugLog): string {
  const drugName = log.drugs.name;
  const animalType = log.animal_types.name;
  const withdrawalPeriod = WITHDRAWAL_PERIODS[drugName]?.[animalType] ?? 7;

  const adminDate = new Date(log.administration_date).getTime();
  const now = Date.now();
  const daysElapsed = Math.floor((now - adminDate) / 86400000);

  if (daysElapsed >= withdrawalPeriod) {
    return `SAFE (withdrawal complete — ${daysElapsed} days ago)`;
  }
  const daysLeft = withdrawalPeriod - daysElapsed;
  return `ACTIVE RESIDUES — ${daysLeft} day(s) remaining until safe (withdrawal: ${withdrawalPeriod} days)`;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

// Formatted withdrawal period table for inclusion in the system prompt
const WITHDRAWAL_TABLE = Object.entries(WITHDRAWAL_PERIODS)
  .map(([drug, periods]) =>
    `  ${drug}: Cattle ${periods.Cattle}d, Pig ${periods.Pig}d, Poultry ${periods.Poultry}d, Sheep ${periods.Sheep}d, Goat ${periods.Goat}d`
  )
  .join('\n');

function buildSystemPrompt(chunks: DocumentChunk[], logs: DrugLog[]): string {
  const regulatoryContext = chunks.length > 0
    ? chunks.map(c => c.content).join('\n\n')
    : 'No additional regulatory data matched for this query.';

  let personalContext = 'No drug administration records found for this user.';
  if (logs.length > 0) {
    personalContext = logs.map(log => {
      const animalLabel = log.animals
        ? `${log.animal_types.name} (Tag: ${log.animals.tag_id}${log.animals.name ? ` / ${log.animals.name}` : ''})`
        : `${log.animal_types.name} (${log.animal_count} animal${log.animal_count > 1 ? 's' : ''})`;
      const date = new Date(log.administration_date).toLocaleDateString('en-IN');
      const status = getLiveStatus(log);
      return `- ${log.drugs.name} administered to ${animalLabel} on ${date} at ${log.dose_amount}${log.dose_unit} | Status: ${status}`;
    }).join('\n');
  }

  return `You are a veterinary drug compliance assistant for Indian farmers, specialising in FSSAI antibiotic residue regulations.

Your role is to help farmers understand:
- Maximum Residue Limits (MRLs) for veterinary drugs under FSSAI
- Withdrawal periods before an animal can be slaughtered or its milk/eggs sold
- Whether specific animals in the farmer's records currently have active drug residues

Rules:
- ONLY answer questions about veterinary drugs, FSSAI regulations, MRLs, withdrawal periods, animal health, and the farmer's own drug records. For anything outside this scope, respond with exactly: "I can only help with FSSAI drug compliance and farm animal health questions."
- Answer directly and confidently from the data provided below — never say you lack FSSAI data
- Base regulatory answers on the FSSAI Withdrawal Periods table and the FSSAI Regulatory Context below
- Base personal-data answers on the farmer's drug records below
- Keep every response to 2–3 sentences maximum; be direct and practical
- If a substance is prohibited, clearly state it is BANNED under FSSAI
- Use plain English; avoid overly technical jargon

=== FSSAI Withdrawal Periods (days) ===
${WITHDRAWAL_TABLE}

=== FSSAI Regulatory Context ===
${regulatoryContext}

=== Farmer's Drug Administration Records ===
${personalContext}`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function generateReplyStream(
  message: string,
  conversationHistory: ChatMessage[],
  userJwt: string,
  onChunk: (text: string) => void,
): Promise<void> {
  // Start drug logs fetch immediately — doesn't need the embedding
  const logsPromise = fetchUserDrugLogs(userJwt);

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(message);
  } catch (err) {
    throw new Error(`Embedding failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const [chunks, logs] = await Promise.all([
    searchDocuments(queryEmbedding),
    logsPromise,
  ]);

  const systemPrompt = buildSystemPrompt(chunks, logs);

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  let hasContent = false;
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-5-nano-2025-08-07',
      messages,
      max_completion_tokens: 4000,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) {
        hasContent = true;
        onChunk(text);
      }
    }
  } catch (err) {
    throw new Error(`Chat completion failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!hasContent) throw new Error('Model returned empty content');
}

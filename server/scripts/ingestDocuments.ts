/**
 * Document ingestion script for the RAG compliance chatbot.
 *
 * Chunks FSSAI regulatory knowledge from two sources:
 *   1. public/documents/FSSAI_MRL_Database.json  (seafood, honey, heavy metals, prohibited)
 *   2. src/lib/calculations/mrlCalculator.ts      (FSSAI_STANDARDS_MRLS — meat/livestock)
 *
 * Then embeds each chunk with text-embedding-3-small and upserts into document_chunks.
 *
 * Run with:  npm run ingest
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { FSSAI_STANDARDS_MRLS } from '../../src/lib/calculations/mrlCalculator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const supabaseUrl  = process.env.VITE_SUPABASE_URL!;
const supabaseKey  = process.env.VITE_SUPABASE_ANON_KEY!;
const openaiKey    = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('Missing env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai   = new OpenAI({ apiKey: openaiKey });

// ---------------------------------------------------------------------------
// Chunk builders
// ---------------------------------------------------------------------------

interface Chunk {
  content: string;
  metadata: Record<string, unknown>;
}

/** Builds chunks from FSSAI_MRL_Database.json */
function chunksFromJsonDatabase(): Chunk[] {
  const raw = readFileSync(resolve(ROOT, 'public/documents/FSSAI_MRL_Database.json'), 'utf-8');
  const db  = JSON.parse(raw);
  const chunks: Chunk[] = [];

  // Seafood products
  for (const entry of db.antibiotics?.seafood_products ?? []) {
    chunks.push({
      content: [
        `Drug: ${entry.drug_name} (Seafood / Fishery Products)`,
        `FSSAI MRL Limit: ${entry.mrl} ${entry.unit}`,
        `Food Category: ${entry.food_category}`,
        `Tissues: ${(entry.tissues ?? ['whole']).join(', ')}`,
        `Source: FSSAI Compendium ${db.metadata?.version ?? 'VI'}, ${db.metadata?.date ?? '2022'}`,
      ].join('\n'),
      metadata: { source: 'fssai_json', section: 'seafood', drug: entry.drug_name },
    });
  }

  // Honey
  for (const entry of db.antibiotics?.honey ?? []) {
    chunks.push({
      content: [
        `Drug: ${entry.drug_name} (Honey)`,
        `FSSAI MRL Limit: ${entry.mrl} ${entry.unit}`,
        `Food Category: ${entry.food_category}`,
        entry.notes ? `Notes: ${entry.notes}` : '',
        `Source: FSSAI Compendium ${db.metadata?.version ?? 'VI'}, ${db.metadata?.date ?? '2022'}`,
      ].filter(Boolean).join('\n'),
      metadata: { source: 'fssai_json', section: 'honey', drug: entry.drug_name },
    });
  }

  // Meat and animal products (if present in JSON)
  for (const entry of db.antibiotics?.meat_and_animal ?? []) {
    const lines = [
      `Drug: ${entry.drug_name} (Meat/Animal Products)`,
      `Food Category: ${entry.food_category ?? 'Meat and Animal Products'}`,
    ];
    if (entry.tissues) {
      for (const [tissue, limit] of Object.entries<{ mrl: number; unit: string }>(entry.tissues)) {
        lines.push(`  ${tissue}: ${limit.mrl} ${limit.unit}`);
      }
    }
    lines.push(`Source: FSSAI Compendium ${db.metadata?.version ?? 'VI'}, ${db.metadata?.date ?? '2022'}`);
    chunks.push({
      content: lines.join('\n'),
      metadata: { source: 'fssai_json', section: 'meat', drug: entry.drug_name },
    });
  }

  // Prohibited substances
  for (const entry of db.prohibited_substances ?? []) {
    chunks.push({
      content: [
        `Substance: ${entry.name ?? entry.drug_name} — PROHIBITED under FSSAI regulations.`,
        `This substance is BANNED for use in food-producing animals in India.`,
        entry.emrl != null ? `Effective MRL (eMRL): ${entry.emrl} mg/kg (effectively zero tolerance)` : '',
        entry.notes ? `Notes: ${entry.notes}` : '',
        `Source: FSSAI Compendium ${db.metadata?.version ?? 'VI'}, ${db.metadata?.date ?? '2022'}`,
      ].filter(Boolean).join('\n'),
      metadata: { source: 'fssai_json', section: 'prohibited', substance: entry.name ?? entry.drug_name },
    });
  }

  // Heavy metals
  for (const [metal, categories] of Object.entries<Record<string, { mrl: number; unit: string }>>(db.heavy_metals ?? {})) {
    for (const [category, limit] of Object.entries(categories)) {
      chunks.push({
        content: [
          `Heavy Metal: ${metal} — Food Category: ${category}`,
          `FSSAI Maximum Level: ${limit.mrl} ${limit.unit}`,
          `Source: FSSAI Compendium ${db.metadata?.version ?? 'VI'}, ${db.metadata?.date ?? '2022'}`,
        ].join('\n'),
        metadata: { source: 'fssai_json', section: 'heavy_metals', metal, category },
      });
    }
  }

  return chunks;
}

/** Builds per-drug-animal chunks from the TypeScript FSSAI_STANDARDS_MRLS object */
function chunksFromMrlCalculator(): Chunk[] {
  const chunks: Chunk[] = [];

  for (const [drugKey, drugData] of Object.entries(FSSAI_STANDARDS_MRLS)) {
    for (const [animalType, animalData] of Object.entries(drugData.animalTypes)) {
      const tissueLines = Object.entries(animalData.tissues).map(
        ([tissue, limit]) => `  ${tissue}: ${limit.limitValue} ${limit.unit}`,
      );
      const withdrawalNote = animalData.withdrawalPeriod != null
        ? `Withdrawal Period (FSSAI): ${animalData.withdrawalPeriod} days`
        : 'Withdrawal Period: not specified by FSSAI (default 7 days applies)';

      chunks.push({
        content: [
          `Drug: ${drugData.drugName} | Animal: ${animalType}`,
          `FSSAI Maximum Residue Limits (mg/kg) by tissue:`,
          ...tissueLines,
          withdrawalNote,
          `Source: FSSAI Compendium VI, 2022 (FSSAI_STANDARDS_MRLS)`,
        ].join('\n'),
        metadata: { source: 'mrl_calculator', drug: drugKey, animal: animalType },
      });
    }
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Embedding helper (batches requests to respect rate limits)
// ---------------------------------------------------------------------------

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return response.data.map(d => d.embedding);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Building document chunks...');
  const jsonChunks = chunksFromJsonDatabase();
  const mrlChunks  = chunksFromMrlCalculator();
  const allChunks  = [...jsonChunks, ...mrlChunks];

  console.log(`Total chunks to embed: ${allChunks.length}`);
  console.log(`  From FSSAI JSON database : ${jsonChunks.length}`);
  console.log(`  From MRL calculator data : ${mrlChunks.length}`);

  // Clear existing rows (idempotent re-runs)
  console.log('\nClearing existing document_chunks...');
  const { error: deleteError } = await supabase.from('document_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Failed to clear table:', deleteError);
    process.exit(1);
  }

  // Embed in batches of 20 to stay within OpenAI rate limits
  const BATCH_SIZE = 20;
  let inserted = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts  = batch.map(c => c.content);

    console.log(`Embedding chunks ${i + 1}–${Math.min(i + BATCH_SIZE, allChunks.length)}...`);
    const embeddings = await embedBatch(texts);

    const rows = batch.map((chunk, idx) => ({
      content:   chunk.content,
      metadata:  chunk.metadata,
      embedding: embeddings[idx],
    }));

    const { error: insertError } = await supabase.from('document_chunks').insert(rows);
    if (insertError) {
      console.error(`Insert error at batch ${i}:`, insertError);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${allChunks.length}`);
  }

  console.log(`\nIngestion complete. ${allChunks.length} chunks stored in document_chunks.`);
}

main().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});

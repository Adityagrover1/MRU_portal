import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { calculateTimeAwareMRLStatus } from '../src/lib/calculations/mrlCalculator';

const app = express();
const PORT = 3001;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables for server runtime.');
}

const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type AuthenticatedRequest = express.Request & {
  accessToken?: string;
  userId?: string;
};

const createUserScopedClient = (accessToken: string) => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const getUserClient = (req: AuthenticatedRequest) => {
  if (!req.accessToken) {
    throw new Error('Missing access token');
  }
  return createUserScopedClient(req.accessToken);
};

const requireAuth: express.RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabaseAuthClient.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid session token' });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    authReq.accessToken = token;
    authReq.userId = data.user.id;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const validateDrugUsagePayload = (payload: Record<string, unknown>) => {
  const requiredStringFields = ['drug_id', 'animal_type_id', 'dose_unit', 'administration_date'];
  for (const field of requiredStringFields) {
    if (!payload[field] || typeof payload[field] !== 'string') {
      return `Missing or invalid field: ${field}`;
    }
  }

  const doseAmount = Number(payload.dose_amount);
  const animalCount = Number(payload.animal_count);

  if (!Number.isFinite(doseAmount) || doseAmount <= 0) {
    return 'dose_amount must be a positive number';
  }

  if (!Number.isInteger(animalCount) || animalCount <= 0) {
    return 'animal_count must be a positive integer';
  }

  return null;
};

type LogWithRelations = {
  id: string;
  drug_id: string;
  animal_type_id: string;
  animal_id: string | null;
  dose_amount: number;
  dose_unit: string;
  animal_count: number;
  administration_date: string;
  notes: string;
  mrl_status: string;
  created_at: string;
  drugs: { name: string };
  animal_types: { name: string };
  animals?: { tag_id: string; name: string } | null;
};

const enrichLogWithLiveMRL = (log: LogWithRelations) => {
  const liveMrl = calculateTimeAwareMRLStatus(
    log.drugs?.name,
    log.animal_types?.name,
    log.dose_amount,
    log.dose_unit,
    log.administration_date,
    new Date(),
    'FSSAI'
  );

  return {
    ...log,
    live_mrl: liveMrl,
  };
};

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/reference-data', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const supabase = getUserClient(authReq);

    const [drugsResult, animalTypesResult, animalsResult] = await Promise.all([
      supabase.from('drugs').select('id, name').order('name'),
      supabase.from('animal_types').select('id, name').order('name'),
      supabase.from('animals').select('id, animal_type_id, tag_id, name').eq('user_id', authReq.userId).order('tag_id'),
    ]);

    if (drugsResult.error || animalTypesResult.error || animalsResult.error) {
      res.status(500).json({ error: 'Failed to load reference data' });
      return;
    }

    res.json({
      drugs: drugsResult.data || [],
      animalTypes: animalTypesResult.data || [],
      animals: animalsResult.data || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/animal-types', requireAuth, async (req, res) => {
  try {
    const supabase = getUserClient(req as AuthenticatedRequest);
    const { data, error } = await supabase.from('animal_types').select('id, name').order('name');

    if (error) {
      res.status(500).json({ error: 'Failed to load animal types' });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/animals', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const supabase = getUserClient(authReq);
    const { data, error } = await supabase
      .from('animals')
      .select('id, animal_type_id, tag_id, name, created_at, animal_types(name)')
      .eq('user_id', authReq.userId)
      .order('tag_id');

    if (error) {
      res.status(500).json({ error: error.message || 'Failed to load animals' });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/animals', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const supabase = getUserClient(authReq);
    const { animal_type_id, tag_id, name } = req.body;

    if (!animal_type_id || !tag_id) {
      res.status(400).json({ error: 'animal_type_id and tag_id are required' });
      return;
    }

    const { data, error } = await supabase
      .from('animals')
      .insert([
        {
          user_id: authReq.userId,
          animal_type_id,
          tag_id: String(tag_id).trim(),
          name: String(name || '').trim(),
        },
      ])
      .select('id, animal_type_id, tag_id, name, created_at, animal_types(name)')
      .single();

    if (error) {
      res.status(400).json({ error: error.message, code: error.code });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/animals/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getUserClient(req as AuthenticatedRequest);
    const { id } = req.params;
    const { animal_type_id, tag_id, name } = req.body;

    if (!animal_type_id || !tag_id) {
      res.status(400).json({ error: 'animal_type_id and tag_id are required' });
      return;
    }

    const { data, error } = await supabase
      .from('animals')
      .update({
        animal_type_id,
        tag_id: String(tag_id).trim(),
        name: String(name || '').trim(),
      })
      .eq('id', id)
      .select('id, animal_type_id, tag_id, name, created_at, animal_types(name)')
      .single();

    if (error) {
      res.status(400).json({ error: error.message, code: error.code });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/animals/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getUserClient(req as AuthenticatedRequest);
    const { id } = req.params;
    const { error } = await supabase.from('animals').delete().eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message, code: error.code });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/drug-usage-logs', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const supabase = getUserClient(authReq);

    const { data, error } = await supabase
      .from('drug_usage_logs')
      .select('*, drugs(name), animal_types(name), animals(tag_id, name)')
      .eq('user_id', authReq.userId)
      .order('administration_date', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message || 'Failed to load logs' });
      return;
    }

    const enrichedLogs = (data || []).map(enrichLogWithLiveMRL);
    res.json(enrichedLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/drug-usage-logs', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const supabase = getUserClient(authReq);
    const payload = req.body as Record<string, unknown>;

    const validationError = validateDrugUsagePayload(payload);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const drugId = String(payload.drug_id);
    const animalTypeId = String(payload.animal_type_id);

    const [drugResult, animalTypeResult] = await Promise.all([
      supabase.from('drugs').select('name').eq('id', drugId).single(),
      supabase.from('animal_types').select('name').eq('id', animalTypeId).single(),
    ]);

    if (drugResult.error || animalTypeResult.error || !drugResult.data || !animalTypeResult.data) {
      res.status(400).json({ error: 'Invalid drug or animal type selection' });
      return;
    }

    const liveMrl = calculateTimeAwareMRLStatus(
      drugResult.data.name,
      animalTypeResult.data.name,
      Number(payload.dose_amount),
      String(payload.dose_unit),
      String(payload.administration_date),
      new Date(),
      'FSSAI'
    );

    const insertPayload = {
      user_id: authReq.userId,
      drug_id: drugId,
      animal_type_id: animalTypeId,
      animal_id: payload.animal_id ? String(payload.animal_id) : null,
      dose_amount: Number(payload.dose_amount),
      dose_unit: String(payload.dose_unit),
      animal_count: Number(payload.animal_count),
      administration_date: String(payload.administration_date),
      notes: String(payload.notes || ''),
      mrl_status: liveMrl.status,
    };

    const { data, error } = await supabase
      .from('drug_usage_logs')
      .insert([insertPayload])
      .select('*, drugs(name), animal_types(name), animals(tag_id, name)')
      .single();

    if (error) {
      res.status(400).json({ error: error.message, code: error.code });
      return;
    }

    res.status(201).json(enrichLogWithLiveMRL(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/drug-usage-logs/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getUserClient(req as AuthenticatedRequest);
    const { id } = req.params;
    const payload = req.body as Record<string, unknown>;

    const validationError = validateDrugUsagePayload(payload);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const drugId = String(payload.drug_id);
    const animalTypeId = String(payload.animal_type_id);

    const [drugResult, animalTypeResult] = await Promise.all([
      supabase.from('drugs').select('name').eq('id', drugId).single(),
      supabase.from('animal_types').select('name').eq('id', animalTypeId).single(),
    ]);

    if (drugResult.error || animalTypeResult.error || !drugResult.data || !animalTypeResult.data) {
      res.status(400).json({ error: 'Invalid drug or animal type selection' });
      return;
    }

    const liveMrl = calculateTimeAwareMRLStatus(
      drugResult.data.name,
      animalTypeResult.data.name,
      Number(payload.dose_amount),
      String(payload.dose_unit),
      String(payload.administration_date),
      new Date(),
      'FSSAI'
    );

    const updatePayload = {
      drug_id: drugId,
      animal_type_id: animalTypeId,
      animal_id: payload.animal_id ? String(payload.animal_id) : null,
      dose_amount: Number(payload.dose_amount),
      dose_unit: String(payload.dose_unit),
      animal_count: Number(payload.animal_count),
      administration_date: String(payload.administration_date),
      notes: String(payload.notes || ''),
      mrl_status: liveMrl.status,
    };

    const { data, error } = await supabase
      .from('drug_usage_logs')
      .update(updatePayload)
      .eq('id', id)
      .select('*, drugs(name), animal_types(name), animals(tag_id, name)')
      .single();

    if (error) {
      res.status(400).json({ error: error.message, code: error.code });
      return;
    }

    res.json(enrichLogWithLiveMRL(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/drug-usage-logs/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getUserClient(req as AuthenticatedRequest);
    const { id } = req.params;
    const { error } = await supabase.from('drug_usage_logs').delete().eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message, code: error.code });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

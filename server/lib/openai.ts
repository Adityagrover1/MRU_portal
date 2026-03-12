import OpenAI from 'openai';

const key = process.env.OPENAI_API_KEY;
if (!key) {
  throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

export const openai = new OpenAI({ apiKey: key });

import { Router, Request, Response } from 'express';
import { generateReplyStream, ChatMessage } from '../lib/ragPipeline.js';

const router = Router();

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    return;
  }
  const userJwt = authHeader.slice(7);

  const { message, conversationHistory } = req.body as {
    message?: string;
    conversationHistory?: ChatMessage[];
  };

  if (!message || typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await generateReplyStream(
      message.trim(),
      Array.isArray(conversationHistory) ? conversationHistory : [],
      userJwt,
      (chunk) => res.write(`data: ${JSON.stringify({ chunk })}\n\n`),
    );
    res.write('data: [DONE]\n\n');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Chat error:', msg);
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
  }

  res.end();
});

export default router;

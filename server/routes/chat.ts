import { Router, Request, Response } from 'express';
import { generateReply, ChatMessage } from '../lib/ragPipeline.js';

const router = Router();

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  // Extract JWT from Authorization header
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

  try {
    const reply = await generateReply(
      message.trim(),
      Array.isArray(conversationHistory) ? conversationHistory : [],
      userJwt,
    );
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to generate response. Please try again.' });
  }
});

export default router;

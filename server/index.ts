import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = 3001;

// Only allow requests from the Vite dev server
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`RAG server running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize DB file
import { initializeDB } from './models/db.js';
initializeDB();

// Router imports
import authRouter from './routes/auth.js';
import docRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';
import workflowRouter from './routes/workflows.js';
import analyticsRouter from './routes/analytics.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import businessRouter from './routes/business.js';
import { aiService } from './services/aiService.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow Vite dev client access
  credentials: true
}));
app.use(express.json());

// Serve uploads folder static assets
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Mountings
app.use('/api/auth', authRouter);
app.use('/api/documents', docRouter);
app.use('/api/chat', chatRouter);
app.use('/api/workflows', workflowRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/business', businessRouter);

// GET /api/search - Natural Language Smart Search
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const results = await aiService.smartSearch(String(q));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: 'fallback-json-active' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`CloudPilot AI API Server Running:`);
    console.log(`-> Local: http://localhost:${PORT}`);
    console.log(`-> Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`========================================`);
  });
}

export default app;

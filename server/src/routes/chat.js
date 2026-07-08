import express from 'express';
import { db } from '../models/db.js';
import { aiService } from '../services/aiService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/chat/sessions - Get current user sessions
router.get('/sessions', authenticateToken, (req, res) => {
  const sessions = db.find('chat_sessions', s => s.user_id === req.user.id);
  res.json(sessions);
});

// POST /api/chat/sessions - Create new session
router.post('/sessions', authenticateToken, (req, res) => {
  const { title } = req.body;
  const newSession = db.insert('chat_sessions', {
    user_id: req.user.id,
    title: title || 'New Conversation'
  });
  res.status(201).json(newSession);
});

// GET /api/chat/sessions/:id/messages - Get messages in session
router.get('/sessions/:id/messages', authenticateToken, (req, res) => {
  const messages = db.find('chat_messages', m => m.session_id === req.params.id);
  res.json(messages);
});

// POST /api/chat/sessions/:id/message - Send message & trigger RAG
router.post('/sessions/:id/message', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const sessionId = req.params.id;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Check if session belongs to user
    const session = db.findOne('chat_sessions', s => s.id === sessionId && s.user_id === req.user.id);
    if (!session) {
      return res.status(404).json({ error: 'Conversation session not found.' });
    }

    // 1. Insert user message
    const userMessage = db.insert('chat_messages', {
      session_id: sessionId,
      sender: 'user',
      content,
      source_documents: []
    });

    // 2. Generate response via AI Service (RAG enabled)
    const assistantMessage = await aiService.generateChatResponse(req.user.id, content, sessionId);

    // Update session timestamp
    db.update('chat_sessions', s => s.id === sessionId, { updated_at: new Date().toISOString() });

    res.json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chat/sessions/:id - Delete session
router.delete('/sessions/:id', authenticateToken, (req, res) => {
  const session = db.findOne('chat_sessions', s => s.id === req.params.id && s.user_id === req.user.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  db.delete('chat_sessions', s => s.id === req.params.id);
  db.delete('chat_messages', m => m.session_id === req.params.id);
  res.json({ message: 'Session deleted successfully' });
});

export default router;

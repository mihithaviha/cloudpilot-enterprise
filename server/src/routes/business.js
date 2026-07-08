import express from 'express';
import { db } from '../models/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// Tasks API Endpoints
// ==========================================

// GET /api/business/tasks
router.get('/tasks', authenticateToken, (req, res) => {
  const tasks = db.get('tasks');
  res.json(tasks);
});

// POST /api/business/tasks
router.post('/tasks', authenticateToken, (req, res) => {
  const { title, description, assignee_id, priority, status, due_date } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const newTask = db.insert('tasks', {
    creator_id: req.user.id,
    assignee_id: assignee_id || req.user.id,
    title,
    description: description || '',
    priority: priority || 'medium',
    status: status || 'todo',
    due_date: due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  res.status(201).json(newTask);
});

// PUT /api/business/tasks/:id
router.put('/tasks/:id', authenticateToken, (req, res) => {
  const { title, description, assignee_id, priority, status, due_date } = req.body;
  
  const updated = db.update('tasks', t => t.id === req.params.id, {
    title,
    description,
    assignee_id,
    priority,
    status,
    due_date
  });

  if (updated === 0) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  res.json(db.findOne('tasks', t => t.id === req.params.id));
});

// DELETE /api/business/tasks/:id
router.delete('/tasks/:id', authenticateToken, (req, res) => {
  const deleted = db.delete('tasks', t => t.id === req.params.id);
  if (deleted === 0) {
    return res.status(404).json({ error: 'Task not found.' });
  }
  res.json({ message: 'Task deleted successfully.' });
});

// ==========================================
// Leaves API Endpoints
// ==========================================

// GET /api/business/leaves
router.get('/leaves', authenticateToken, (req, res) => {
  const leaves = db.get('leaves');
  res.json(leaves);
});

// POST /api/business/leaves
router.post('/leaves', authenticateToken, (req, res) => {
  const { start_date, end_date, reason, type } = req.body;
  if (!start_date || !end_date || !reason || !type) {
    return res.status(400).json({ error: 'Start date, end date, reason, and type are required.' });
  }

  const newLeave = db.insert('leaves', {
    user_id: req.user.id,
    full_name: req.user.fullName,
    start_date,
    end_date,
    reason,
    type,
    status: 'pending'
  });

  // Automatically trigger HR notification
  db.insert('notifications', {
    user_id: 'u2', // HR User Sarah Connor/John Doe
    title: 'New Leave Request',
    message: `${req.user.fullName} requested ${type} from ${start_date} to ${end_date}.`,
    type: 'workflow',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json(newLeave);
});

// PUT /api/business/leaves/:id (Approve/Reject)
router.put('/leaves/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const updated = db.update('leaves', l => l.id === req.params.id, { status });
  if (updated === 0) {
    return res.status(404).json({ error: 'Leave request not found.' });
  }

  const leave = db.findOne('leaves', l => l.id === req.params.id);

  // Notify employee
  db.insert('notifications', {
    user_id: leave.user_id,
    title: `Leave Request ${status.toUpperCase()}`,
    message: `Your request for ${leave.type} has been ${status}.`,
    type: status === 'approved' ? 'success' : 'danger',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.json(leave);
});

// ==========================================
// Expenses API Endpoints
// ==========================================

// GET /api/business/expenses
router.get('/expenses', authenticateToken, (req, res) => {
  const expenses = db.get('expenses');
  res.json(expenses);
});

// POST /api/business/expenses
router.post('/expenses', authenticateToken, (req, res) => {
  const { merchant, amount, category, date } = req.body;
  if (!merchant || !amount || !category || !date) {
    return res.status(400).json({ error: 'Merchant, amount, category, and date are required.' });
  }

  const newExpense = db.insert('expenses', {
    user_id: req.user.id,
    merchant,
    amount: parseFloat(amount),
    category,
    date,
    status: 'pending',
    receipt_url: ''
  });

  res.status(201).json(newExpense);
});

// ==========================================
// Sales Leads API Endpoints
// ==========================================

// GET /api/business/leads
router.get('/leads', authenticateToken, (req, res) => {
  const leads = db.get('leads');
  res.json(leads);
});

// POST /api/business/leads
router.post('/leads', authenticateToken, (req, res) => {
  const { company_name, contact_person, email, phone, status, value, conversion_chance } = req.body;
  if (!company_name || !contact_person) {
    return res.status(400).json({ error: 'Company name and contact person are required.' });
  }

  const newLead = db.insert('leads', {
    company_name,
    contact_person,
    email: email || '',
    phone: phone || '',
    status: status || 'New',
    value: parseFloat(value) || 0,
    conversion_chance: parseInt(conversion_chance) || 10
  });

  res.status(201).json(newLead);
});

// PUT /api/business/leads/:id
router.put('/leads/:id', authenticateToken, (req, res) => {
  const { company_name, contact_person, email, phone, status, value, conversion_chance } = req.body;
  
  const updated = db.update('leads', l => l.id === req.params.id, {
    company_name,
    contact_person,
    email,
    phone,
    status,
    value: parseFloat(value),
    conversion_chance: parseInt(conversion_chance)
  });

  if (updated === 0) {
    return res.status(404).json({ error: 'Lead not found.' });
  }

  res.json(db.findOne('leads', l => l.id === req.params.id));
});

export default router;

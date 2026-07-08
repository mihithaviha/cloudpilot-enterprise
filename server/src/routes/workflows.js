import express from 'express';
import { db } from '../models/db.js';
import { workflowService } from '../services/workflowService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/workflows - Get workflows list
router.get('/', authenticateToken, (req, res) => {
  const workflows = db.get('workflows');
  res.json(workflows);
});

// POST /api/workflows - Create new template
router.post('/', authenticateToken, (req, res) => {
  const { name, description, trigger_type, steps } = req.body;
  if (!name || !trigger_type || !steps) {
    return res.status(400).json({ error: 'Name, trigger type, and steps configuration are required.' });
  }

  const newWorkflow = db.insert('workflows', {
    user_id: req.user.id,
    name,
    description: description || '',
    trigger_type,
    steps,
    is_active: true
  });
  res.status(201).json(newWorkflow);
});

// PUT /api/workflows/:id - Update workflow config
router.put('/:id', authenticateToken, (req, res) => {
  const { name, description, steps, is_active } = req.body;
  
  const updated = db.update('workflows', w => w.id === req.params.id, {
    name,
    description,
    steps,
    is_active
  });

  if (updated === 0) {
    return res.status(404).json({ error: 'Workflow not found.' });
  }

  res.json(db.findOne('workflows', w => w.id === req.params.id));
});

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', authenticateToken, (req, res) => {
  const deleted = db.delete('workflows', w => w.id === req.params.id);
  if (deleted === 0) {
    return res.status(404).json({ error: 'Workflow not found.' });
  }
  res.json({ message: 'Workflow deleted successfully.' });
});

// POST /api/workflows/:id/execute - Run automation
router.post('/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { initialData } = req.body;
    const dataWithUser = {
      ...initialData,
      userId: req.user.id,
      email: req.user.email,
      employeeName: req.user.fullName
    };

    const logRecord = await workflowService.executeWorkflow(req.params.id, dataWithUser);
    res.json(logRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workflows/logs - Get history executions logs
router.get('/logs', authenticateToken, (req, res) => {
  const logs = db.get('workflow_logs');
  // Sort logs by created_at descending
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(logs);
});

// GET /api/workflows/approvals - Get pending approvals
router.get('/approvals', authenticateToken, (req, res) => {
  // Return approvals where status is pending and match user role if needed
  const approvalsList = db.find('approvals', a => a.status === 'pending');
  
  // Enriched with details of logs
  const enriched = approvalsList.map(a => {
    const log = db.findOne('workflow_logs', l => l.id === a.workflow_log_id);
    const flow = log ? db.findOne('workflows', w => w.id === log.workflow_id) : null;
    return {
      ...a,
      workflow_name: flow ? flow.name : 'Unknown Workflow',
      workflow_log: log
    };
  });
  
  res.json(enriched);
});

// POST /api/workflows/approvals/:id/resolve - Resolve approval step
router.post('/approvals/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { status, comments } = req.body; // 'approved' or 'rejected'
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedLog = await workflowService.resolveApproval(req.params.id, status, comments, req.user.id);
    
    // Notify trigger user
    db.insert('notifications', {
      user_id: req.user.id,
      title: `Workflow Action Complete`,
      message: `Your approval step was marked as ${status}.`,
      type: status === 'approved' ? 'success' : 'danger',
      is_read: false,
      created_at: new Date().toISOString()
    });

    res.json({ message: `Workflow step resolved as ${status}`, log: updatedLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

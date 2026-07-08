import express from 'express';
import { db } from '../models/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics - Get charts, metrics, and insights
router.get('/', authenticateToken, (req, res) => {
  const analyticsData = db.get('analytics');
  const invoices = db.get('invoices');
  const workflows = db.get('workflows');
  const workflowLogs = db.get('workflow_logs');
  
  // Dynamically compute general statistics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const paidInvoiced = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0);
  const unpaidInvoiced = invoices.filter(i => i.status === 'unpaid').reduce((sum, inv) => sum + Number(inv.amount), 0);
  
  const totalWorkflows = workflows.length;
  const runningExecutions = workflowLogs.filter(l => l.status === 'running' || l.status === 'pending_approval').length;
  const failedExecutions = workflowLogs.filter(l => l.status === 'failed').length;
  
  // Calculate a Business Health Score (mock formula based on paid/unpaid and failed flows)
  const healthReduction = (failedExecutions * 5) + (unpaidInvoiced > 10000 ? 5 : 0);
  const businessHealthScore = Math.max(70, Math.min(100, 98 - healthReduction));

  // Generate automated AI Recommendations
  const recommendations = [
    {
      id: 'rec1',
      title: 'Automate Collection Reminder',
      description: 'You have $23,900 in unpaid and overdue invoices. We suggest triggering our Invoice Reminder workflow.',
      impact: 'High Impact',
      category: 'Finance'
    },
    {
      id: 'rec2',
      title: 'Standardize Sick Leave Approval',
      description: 'Manager approval steps are averaging 14 hours of delay. Recommend shifting sick leave validation to AI Auto-Approve.',
      impact: 'Medium Impact',
      category: 'Workflows'
    },
    {
      id: 'rec3',
      title: 'Upload Product Spec to RAG',
      description: 'Employees queried "CloudPilot Architecture" 12 times today. Indexing the system design spec will speed up answers.',
      impact: 'High Impact',
      category: 'AI Knowledge'
    }
  ];

  res.json({
    charts: analyticsData,
    metrics: {
      totalRevenue: totalInvoiced,
      revenueCollected: paidInvoiced,
      outstandingReceivables: unpaidInvoiced,
      activeAutomationsCount: totalWorkflows,
      runningExecutionsCount: runningExecutions,
      failedExecutionsCount: failedExecutions,
      businessHealthScore
    },
    recommendations
  });
});

export default router;

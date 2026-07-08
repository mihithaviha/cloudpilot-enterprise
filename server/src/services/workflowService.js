import { db } from '../models/db.js';

export const workflowService = {
  // Triggers workflow execution and processes synchronous steps
  executeWorkflow: async (workflowId, initialData = {}) => {
    const workflow = db.findOne('workflows', w => w.id === workflowId);
    if (!workflow) throw new Error('Workflow not found');

    // Create execution log
    const logId = 'wl-' + Math.random().toString(36).substr(2, 9);
    const executionRecord = {
      id: logId,
      workflow_id: workflowId,
      status: 'running',
      current_step: 0,
      steps_log: [],
      created_at: new Date().toISOString()
    };
    
    db.insert('workflow_logs', executionRecord);

    const steps = workflow.steps;
    let currentStepIndex = 0;
    let flowStatus = 'completed'; // Default status if runs to end

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      currentStepIndex = i + 1;
      
      // Update execution status
      db.update('workflow_logs', l => l.id === logId, { current_step: currentStepIndex });

      // Run individual step behavior
      let stepResult = { step: step.title, status: 'success', detail: '' };

      try {
        switch (step.type) {
          case 'check_balance': {
            const minDays = step.config?.minDays || 1;
            // Simulated check
            stepResult.detail = `Balance check succeeded. Available: 22 days. Required: ${initialData.days || 3} days.`;
            break;
          }
          case 'manager_approval': {
            // This step pauses execution and requests human intervention!
            flowStatus = 'pending_approval';
            stepResult.status = 'pending';
            stepResult.detail = 'Pending approval from department head.';
            
            // Create a pending approval
            const approvalId = 'app-' + Math.random().toString(36).substr(2, 9);
            db.insert('approvals', {
              id: approvalId,
              workflow_log_id: logId,
              approver_id: 'u3', // manager
              role_required: 'Manager',
              status: 'pending',
              comments: '',
              created_at: new Date().toISOString()
            });

            // Create notification for manager
            db.insert('notifications', {
              user_id: 'u3', // Manager user id
              title: `Workflow Action Required: ${workflow.name}`,
              message: `Approval requested for leave request: ${initialData.employeeName || 'Jane Foster'}.`,
              type: 'workflow',
              is_read: false,
              created_at: new Date().toISOString()
            });
            break;
          }
          case 'finance_approval': {
            // Pauses execution for finance check
            flowStatus = 'pending_approval';
            stepResult.status = 'pending';
            stepResult.detail = 'Pending validation by Finance team.';
            
            const approvalId = 'app-' + Math.random().toString(36).substr(2, 9);
            db.insert('approvals', {
              id: approvalId,
              workflow_log_id: logId,
              approver_id: 'u4', // finance
              role_required: 'Finance',
              status: 'pending',
              comments: '',
              created_at: new Date().toISOString()
            });
            
            db.insert('notifications', {
              user_id: 'u4',
              title: 'Workflow Action Required: Invoice Audit',
              message: `Invoice approval requested for client: ${initialData.clientName || 'Stripe Inc.'}.`,
              type: 'workflow',
              is_read: false,
              created_at: new Date().toISOString()
            });
            break;
          }
          case 'hr_notify': {
            stepResult.detail = `HR database updated. Slack alert dispatched to channels: #hr-portal.`;
            break;
          }
          case 'calendar_update': {
            stepResult.detail = `Synced with Google Calendar API. Event created for user: ${initialData.employeeName || 'Jane Foster'}.`;
            break;
          }
          case 'send_email': {
            stepResult.detail = `Automated email dispatched via SendGrid to: ${initialData.email || 'employee@cloudpilot.ai'}.`;
            break;
          }
          case 'ai_validate': {
            stepResult.detail = `AI parsed invoice text. Match Confidence: 94%. Client: ${initialData.clientName || 'Stripe Inc.'}.`;
            break;
          }
          case 'check_budget': {
            stepResult.detail = `Budget check matched department allocation codes. Balance sufficient.`;
            break;
          }
          case 'send_payment': {
            stepResult.detail = `ACH transfer queued via Stripe API. Transaction Reference: tx_stripe_${Math.floor(Math.random()*900000+100000)}.`;
            break;
          }
          default:
            stepResult.detail = `Step executed successfully.`;
        }
      } catch (err) {
        stepResult.status = 'failed';
        stepResult.detail = err.message;
        flowStatus = 'failed';
      }

      // Add to logs array
      const currentLog = db.findOne('workflow_logs', l => l.id === logId);
      currentLog.steps_log.push(stepResult);
      db.update('workflow_logs', l => l.id === logId, {
        steps_log: currentLog.steps_log,
        status: flowStatus
      });

      // Stop loop if workflow paused for approval or failed
      if (flowStatus === 'pending_approval' || flowStatus === 'failed') {
        break;
      }
    }

    // Add Audit Log
    db.insert('audit_logs', {
      user_id: initialData.userId || 'u1',
      action: 'WORKFLOW_TRIGGER',
      target_type: 'workflow',
      target_id: workflowId,
      details: { workflowName: workflow.name, finalStatus: flowStatus },
      ip_address: '127.0.0.1'
    });

    return db.findOne('workflow_logs', l => l.id === logId);
  },

  // Resumes workflow after manager approves or rejects
  resolveApproval: async (approvalId, status, comments, userId) => {
    const approval = db.findOne('approvals', a => a.id === approvalId);
    if (!approval) throw new Error('Approval request not found');

    db.update('approvals', a => a.id === approvalId, {
      status,
      comments,
      approver_id: userId
    });

    const logId = approval.workflow_log_id;
    const log = db.findOne('workflow_logs', l => l.id === logId);
    if (!log) throw new Error('Workflow log not found');

    const workflow = db.findOne('workflows', w => w.id === log.workflow_id);
    if (!workflow) throw new Error('Workflow definition not found');

    // Update the pending step in steps_log
    const stepsLog = log.steps_log.map(item => {
      if (item.status === 'pending') {
        return {
          ...item,
          status: status === 'approved' ? 'success' : 'failed',
          detail: status === 'approved' ? `Approved: ${comments || 'No comment provided'}` : `Rejected: ${comments || 'No comment provided'}`
        };
      }
      return item;
    });

    if (status === 'rejected') {
      db.update('workflow_logs', l => l.id === logId, {
        status: 'failed',
        steps_log: stepsLog
      });
      return db.findOne('workflow_logs', l => l.id === logId);
    }

    // Resume execution for remaining steps
    db.update('workflow_logs', l => l.id === logId, {
      status: 'running',
      steps_log: stepsLog
    });

    let currentStepIndex = log.current_step; // 1-indexed count of where we stopped
    let flowStatus = 'completed';

    for (let i = currentStepIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      currentStepIndex = i + 1;
      
      db.update('workflow_logs', l => l.id === logId, { current_step: currentStepIndex });

      let stepResult = { step: step.title, status: 'success', detail: '' };

      try {
        if (step.type === 'hr_notify') {
          stepResult.detail = `HR database updated. Slack alert dispatched to #hr-portal.`;
        } else if (step.type === 'calendar_update') {
          stepResult.detail = `Synced with Google Calendar API. Event created.`;
        } else if (step.type === 'send_email') {
          stepResult.detail = `Automated confirmation email dispatched via SendGrid.`;
        } else if (step.type === 'send_payment') {
          stepResult.detail = `ACH transfer queued. Transaction Reference: tx_stripe_${Math.floor(Math.random()*900000+100000)}.`;
        } else {
          stepResult.detail = `Step executed successfully.`;
        }
      } catch (err) {
        stepResult.status = 'failed';
        stepResult.detail = err.message;
        flowStatus = 'failed';
      }

      stepsLog.push(stepResult);
      db.update('workflow_logs', l => l.id === logId, {
        steps_log: stepsLog,
        status: flowStatus
      });

      if (flowStatus === 'failed') {
        break;
      }
    }

    return db.findOne('workflow_logs', l => l.id === logId);
  }
};

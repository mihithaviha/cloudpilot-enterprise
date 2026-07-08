import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Generate default mock data helper
const getSeedData = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  const users = [
    { id: 'u1', email: 'admin@cloudpilot.ai', password: hashedPassword, full_name: 'Sarah Connor', role: 'Admin', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', organization_name: 'CloudPilot Corp', created_at: new Date().toISOString() },
    { id: 'u2', email: 'hr@cloudpilot.ai', password: hashedPassword, full_name: 'John Doe', role: 'HR', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', organization_name: 'CloudPilot Corp', created_at: new Date().toISOString() },
    { id: 'u3', email: 'manager@cloudpilot.ai', password: hashedPassword, full_name: 'Alice Smith', role: 'Manager', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', organization_name: 'CloudPilot Corp', created_at: new Date().toISOString() },
    { id: 'u4', email: 'finance@cloudpilot.ai', password: hashedPassword, full_name: 'Bob Miller', role: 'Finance', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', organization_name: 'CloudPilot Corp', created_at: new Date().toISOString() },
    { id: 'u5', email: 'employee@cloudpilot.ai', password: hashedPassword, full_name: 'Jane Foster', role: 'Employee', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', organization_name: 'CloudPilot Corp', created_at: new Date().toISOString() }
  ];

  const documents = [
    {
      id: 'd1',
      user_id: 'u1',
      name: 'HR Leave Policy 2026.txt',
      file_path: 'uploads/HR_Leave_Policy_2026.txt',
      file_type: 'TXT',
      file_size: 1420,
      content: `CLOUDPILOT CORP LEAVE POLICY 2026
Standard leave entitlement for full-time employees is 25 days per calendar year.
Leave request workflow process:
1. Employee submits leave request.
2. AI checking leave balance.
3. Manager approval required.
4. HR notification.
5. Calendar update.
6. Confirmation email.
Sick leave: Employees get up to 10 days of fully paid medical leave per year, requiring a doctor's certificate for periods exceeding 3 consecutive days.
Maternity leave is 16 weeks fully paid. Paternity leave is 4 weeks fully paid.
Carry-over: Up to 5 unused leave days can be carried over to the next financial year, but must be utilized within the first quarter (by March 31st).`,
      status: 'processed',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'd2',
      user_id: 'u2',
      name: 'Sales Quarterly Targets.csv',
      file_path: 'uploads/Sales_Quarterly_Targets.csv',
      file_type: 'CSV',
      file_size: 450,
      content: `Month,Target Revenue,Achieved Revenue,New Customers,Category
January 2026,120000,125000,45,Enterprise
February 2026,130000,115000,38,Enterprise
March 2026,150000,165000,55,Enterprise
April 2026,160000,178000,60,Growth
May 2026,180000,195000,72,Growth
June 2026,200000,210000,80,Enterprise`,
      status: 'processed',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'd3',
      user_id: 'u3',
      name: 'Project CloudPilot Spec.txt',
      file_path: 'uploads/Project_CloudPilot_Spec.txt',
      file_type: 'TXT',
      file_size: 890,
      content: `PROJECT CLOUDPILOT SPECIFICATION v1.0
Goal: Build a high-performance, secure virtual AI workspace integration tool.
Core architecture:
- Frontend built with Vite, React, TypeScript, and Tailwind CSS.
- Backend server powered by Node.js, Express, and JWT security middleware.
- RAG features built using standard text keyword matching, cosine similarity, or Supabase pgvector extensions.
- Automated workflows enabled through a Node-based state runner simulating integrations with Slack, Gmail, and Google Calendar.
Main features: Smart Natural Language Search, AI Document Exporter, Live Logs, visual automation designer.`,
      status: 'processed',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const tasks = [
    { id: 't1', creator_id: 'u1', assignee_id: 'u3', title: 'Review Q2 Financial Statement', description: 'Cross-check the generated invoice reports against final client receipts before board submission.', status: 'todo', priority: 'high', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
    { id: 't2', creator_id: 'u2', assignee_id: 'u5', title: 'Complete Compliance Training', description: 'Complete the security and workplace compliance modules online.', status: 'in_progress', priority: 'medium', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
    { id: 't3', creator_id: 'u3', assignee_id: 'u2', title: 'Conduct Performance Appraisal', description: 'Prepare performance reviews for the engineering department team leads.', status: 'completed', priority: 'low', due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
    { id: 't4', creator_id: 'u1', assignee_id: 'u4', title: 'Optimize API Middleware Latency', description: 'Implement caching headers and query optimization to reduce server round-trips.', status: 'under_review', priority: 'high', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
    { id: 't5', creator_id: 'u4', assignee_id: 'u1', title: 'Prepare Hackathon Pitch Deck', description: 'Draft the presentation slides highlighting CloudPilot AI value proposition.', status: 'todo', priority: 'medium', due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() }
  ];

  const leaves = [
    { id: 'lv1', user_id: 'u5', full_name: 'Jane Foster', start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reason: 'Family vacation to Hawaii', type: 'Annual Leave', status: 'pending', created_at: new Date().toISOString() },
    { id: 'lv2', user_id: 'u3', full_name: 'Alice Smith', start_date: '2026-06-01', end_date: '2026-06-03', reason: 'Dental surgery recovery', type: 'Sick Leave', status: 'approved', created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const expenses = [
    { id: 'ex1', user_id: 'u3', merchant: 'AWS Infrastructure', amount: 1450.25, category: 'Hosting', date: new Date().toISOString().split('T')[0], status: 'approved', receipt_url: '', created_at: new Date().toISOString() },
    { id: 'ex2', user_id: 'u5', merchant: 'Starbucks Coffee', amount: 24.50, category: 'Meals', date: new Date().toISOString().split('T')[0], status: 'pending', receipt_url: '', created_at: new Date().toISOString() },
    { id: 'ex3', user_id: 'u4', merchant: 'GitHub Copilot Enterprise', amount: 850.00, category: 'SaaS License', date: '2026-06-20', status: 'approved', receipt_url: '', created_at: new Date().toISOString() }
  ];

  const leads = [
    { id: 'ld1', company_name: 'Acme Corp', contact_person: 'John Miller', email: 'john@acme.com', phone: '+1-555-0199', status: 'Qualified', value: 25000, conversion_chance: 70, created_at: new Date().toISOString() },
    { id: 'ld2', company_name: 'Globex Corporation', contact_person: 'Hank Scorpio', email: 'hank@globex.co', phone: '+1-555-0188', status: 'Proposal', value: 48000, conversion_chance: 85, created_at: new Date().toISOString() },
    { id: 'ld3', company_name: 'Initech Inc', contact_person: 'Peter Gibbons', email: 'peter@initech.com', phone: '+1-555-0177', status: 'New', value: 12000, conversion_chance: 30, created_at: new Date().toISOString() },
    { id: 'ld4', company_name: 'Hooli Tech', contact_person: 'Gavin Belson', email: 'gavin@hooli.xyz', phone: '+1-555-0166', status: 'Won', value: 95000, conversion_chance: 100, created_at: new Date().toISOString() }
  ];

  const invoices = [
    {
      id: 'inv1',
      user_id: 'u1',
      invoice_number: 'INV-2026-001',
      client_name: 'Vercel Inc.',
      client_email: 'billing@vercel.com',
      amount: 12500.00,
      status: 'paid',
      issue_date: '2026-06-01',
      due_date: '2026-06-30',
      items: [
        { description: 'CloudPilot Enterprise License (Annual)', quantity: 1, unit_price: 10000.00, total: 10000.00 },
        { description: 'Premium AI RAG Setup & Embedding Consultation', quantity: 5, unit_price: 500.00, total: 2500.00 }
      ],
      created_at: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv2',
      user_id: 'u4',
      invoice_number: 'INV-2026-002',
      client_name: 'Stripe Inc.',
      client_email: 'finance@stripe.com',
      amount: 8500.00,
      status: 'unpaid',
      issue_date: '2026-06-15',
      due_date: '2026-07-15',
      items: [
        { description: 'Monthly Developer Copilot Seats', quantity: 85, unit_price: 100.00, total: 8500.00 }
      ],
      created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv3',
      user_id: 'u4',
      invoice_number: 'INV-2026-003',
      client_name: 'Slack Technologies',
      client_email: 'accounts@slack.com',
      amount: 15400.00,
      status: 'overdue',
      issue_date: '2026-05-10',
      due_date: '2026-06-10',
      items: [
        { description: 'Custom Integration Connectors Buildout', quantity: 1, unit_price: 15400.00, total: 15400.00 }
      ],
      created_at: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'inv4',
      user_id: 'u1',
      invoice_number: 'INV-2026-004',
      client_name: 'Linear App',
      client_email: 'billing@linear.app',
      amount: 4500.00,
      status: 'paid',
      issue_date: '2026-06-28',
      due_date: '2026-07-28',
      items: [
        { description: 'Advanced Copilot Training Workshop', quantity: 3, unit_price: 1500.00, total: 4500.00 }
      ],
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const workflows = [
    {
      id: 'w1',
      user_id: 'u1',
      name: 'Employee Leave Request',
      description: 'Triggered when an employee requests paid time off. Automated check, approval routing, and schedule synchronization.',
      is_active: true,
      trigger_type: 'leave_request',
      steps: [
        { id: 's1', type: 'check_balance', title: 'Check Leave Balance', status: 'pending', config: { minDays: 1 } },
        { id: 's2', type: 'manager_approval', title: 'Manager Approval Check', status: 'pending', config: { approverRole: 'Manager' } },
        { id: 's3', type: 'hr_notify', title: 'Notify HR Department', status: 'pending', config: { channel: 'Slack' } },
        { id: 's4', type: 'calendar_update', title: 'Sync to Shared Calendar', status: 'pending', config: { calendarId: 'company_shared' } },
        { id: 's5', type: 'send_email', title: 'Send Confirmation Email', status: 'pending', config: { template: 'leave_approved' } }
      ],
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'w2',
      user_id: 'u3',
      name: 'Vendor Invoice Processing',
      description: 'Scans incoming invoices, runs AI validation, matches purchase order, and flags for financial clearance.',
      is_active: true,
      trigger_type: 'new_invoice',
      steps: [
        { id: 'ws1', type: 'ai_validate', title: 'AI Extract & Verify Details', status: 'pending', config: { confidenceThreshold: 0.9 } },
        { id: 'ws2', type: 'check_budget', title: 'Validate Department Budget', status: 'pending', config: { budgetId: 'operations_q2' } },
        { id: 'ws3', type: 'finance_approval', title: 'Finance Officer Signoff', status: 'pending', config: { approverRole: 'Finance' } },
        { id: 'ws4', type: 'send_payment', title: 'Queue Transfer in Stripe', status: 'pending', config: { bankRoute: 'ACH' } }
      ],
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const workflow_logs = [
    {
      id: 'wl1',
      workflow_id: 'w1',
      status: 'completed',
      current_step: 5,
      steps_log: [
        { step: 'Check Leave Balance', status: 'success', detail: 'Balance verified: 18 days remaining.' },
        { step: 'Manager Approval Check', status: 'success', detail: 'Approved by Alice Smith (Manager).' },
        { step: 'Notify HR Department', status: 'success', detail: 'HR records updated. Leave tracked.' },
        { step: 'Sync to Shared Calendar', status: 'success', detail: 'Event written: Jane Foster Away July 10-14.' },
        { step: 'Send Confirmation Email', status: 'success', detail: 'Email dispatched to jane.foster@cloudpilot.ai.' }
      ],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'wl2',
      workflow_id: 'w1',
      status: 'pending_approval',
      current_step: 1,
      steps_log: [
        { step: 'Check Leave Balance', status: 'success', detail: 'Balance verified: 22 days remaining.' },
        { step: 'Manager Approval Check', status: 'pending', detail: 'Awaiting digital signature from Alice Smith.' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const approvals = [
    { id: 'a1', workflow_log_id: 'wl2', approver_id: 'u3', role_required: 'Manager', status: 'pending', comments: '', created_at: new Date().toISOString() }
  ];

  const notifications = [
    { id: 'n1', user_id: 'u3', title: 'Pending Approval: Leave Request', message: 'Employee Jane Foster submitted a leave request. Manager approval is required.', type: 'workflow', is_read: false, created_at: new Date().toISOString() },
    { id: 'n2', user_id: 'u1', title: 'Document Processed Successfully', message: 'The document "HR Leave Policy 2026.txt" has been index-mapped for AI Chat searches.', type: 'success', is_read: true, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'n3', user_id: 'u4', title: 'Stripe Invoice Overdue Alert', message: 'Invoice INV-2026-003 for Slack Technologies is 27 days overdue.', type: 'danger', is_read: false, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const audit_logs = [
    { id: 'al1', user_id: 'u1', action: 'USER_LOGIN', target_type: 'user', target_id: 'u1', details: { success: true }, ip_address: '127.0.0.1', created_at: new Date().toISOString() },
    { id: 'al2', user_id: 'u2', action: 'FILE_UPLOAD', target_type: 'document', target_id: 'd2', details: { filename: 'Sales Quarterly Targets.csv' }, ip_address: '192.168.1.104', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const chat_sessions = [
    { id: 'cs1', user_id: 'u1', title: 'HR Leave Policy Qs', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const chat_messages = [
    { id: 'm1', session_id: 'cs1', sender: 'user', content: 'What is our standard maternity leave?', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    {
      id: 'm2',
      session_id: 'cs1',
      sender: 'assistant',
      content: 'Standard maternity leave is **16 weeks fully paid** according to the company policy. You can also carry over up to 5 unused leave days to the next financial year.',
      source_documents: [{ id: 'd1', name: 'HR Leave Policy 2026.txt' }],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const analytics = {
    revenue: [
      { month: 'Jan', revenue: 125000, expenses: 85000, growth: 12 },
      { month: 'Feb', revenue: 115000, expenses: 90000, growth: -8 },
      { month: 'Mar', revenue: 165000, expenses: 95000, growth: 43 },
      { month: 'Apr', revenue: 178000, expenses: 110000, growth: 8 },
      { month: 'May', revenue: 195000, expenses: 120000, growth: 10 },
      { month: 'Jun', revenue: 210000, expenses: 125000, growth: 7 }
    ],
    aiUsage: [
      { date: '07/01', tokens: 12400, requests: 340, savings: 240 },
      { date: '07/02', tokens: 18500, requests: 450, savings: 320 },
      { date: '07/03', tokens: 9800, requests: 210, savings: 150 },
      { date: '07/04', tokens: 15200, requests: 380, savings: 290 },
      { date: '07/05', tokens: 21000, requests: 510, savings: 410 },
      { date: '07/06', tokens: 24500, requests: 620, savings: 500 },
      { date: '07/07', tokens: 11000, requests: 280, savings: 210 }
    ],
    productivity: {
      averageResponseTime: '1.2s',
      tasksCompleted: 42,
      workflowsExecuted: 87,
      aiSavingsUSD: 2350,
      businessHealthScore: 94
    }
  };

  return {
    users,
    documents,
    tasks,
    invoices,
    workflows,
    workflow_logs,
    approvals,
    notifications,
    audit_logs,
    chat_sessions,
    chat_messages,
    analytics,
    leaves,
    expenses,
    leads
  };
};

// Initialize DB file if not exists or is empty
export const initializeDB = () => {
  let data = {};
  if (!fs.existsSync(DB_FILE) || fs.readFileSync(DB_FILE, 'utf8').trim() === '') {
    const defaultData = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  } else {
    try {
      data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      const seed = getSeedData();
      let updated = false;
      ['leaves', 'expenses', 'leads'].forEach(key => {
        if (!data[key]) {
          data[key] = seed[key];
          updated = true;
        }
      });
      if (data.tasks && data.tasks.length <= 3) {
        data.tasks = seed.tasks;
        updated = true;
      }
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      data = getSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    }
  }
};

// Lowdb-like simple implementation
export const db = {
  read: () => {
    initializeDB();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  },

  write: (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  },

  // Read a specific table
  get: (table) => {
    const data = db.read();
    return data[table] || [];
  },

  // Query table
  find: (table, filterFn) => {
    const list = db.get(table);
    return list.filter(filterFn);
  },

  findOne: (table, filterFn) => {
    const list = db.get(table);
    return list.find(filterFn);
  },

  // Insert items
  insert: (table, record) => {
    const data = db.read();
    if (!data[table]) data[table] = [];
    
    // Add unique string id if missing
    if (!record.id) {
      record.id = Math.random().toString(36).substr(2, 9);
    }
    record.created_at = record.created_at || new Date().toISOString();
    
    data[table].push(record);
    db.write(data);
    return record;
  },

  // Update item
  update: (table, filterFn, updatedFields) => {
    const data = db.read();
    const list = data[table] || [];
    let updatedCount = 0;
    
    const updatedList = list.map(item => {
      if (filterFn(item)) {
        updatedCount++;
        return { ...item, ...updatedFields, updated_at: new Date().toISOString() };
      }
      return item;
    });
    
    data[table] = updatedList;
    db.write(data);
    return updatedCount;
  },

  // Delete item
  delete: (table, filterFn) => {
    const data = db.read();
    const list = data[table] || [];
    const filtered = list.filter(item => !filterFn(item));
    
    const deletedCount = list.length - filtered.length;
    data[table] = filtered;
    db.write(data);
    return deletedCount;
  }
};

// Initialize on import
initializeDB();

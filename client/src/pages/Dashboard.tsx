import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Cpu, 
  Heart, 
  AlertCircle, 
  Check, 
  X, 
  Sparkles,
  Calendar,
  FileText,
  UserCheck,
  ChevronRight,
  Shield,
  Users,
  Activity,
  DollarSign,
  Plus,
  Send,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Employee Form State
  const [requestType, setRequestType] = useState<'leave' | 'expense'>('leave');
  // Leave form
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState('Annual Leave');
  // Expense form
  const [expMerchant, setExpMerchant] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Hosting');
  const [expDate, setExpDate] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [
        analyticsRes,
        approvalsRes,
        docsRes,
        tasksRes,
        leavesRes,
        expensesRes,
        leadsRes,
        usersRes
      ] = await Promise.all([
        api.analytics.get().catch(() => ({ metrics: null, recommendations: [] })),
        api.workflows.listApprovals().catch(() => []),
        api.documents.list().catch(() => []),
        api.business.tasks.list().catch(() => []),
        api.business.leaves.list().catch(() => []),
        api.business.expenses.list().catch(() => []),
        api.business.leads.list().catch(() => []),
        api.users.list().catch(() => [])
      ]);

      setMetrics(analyticsRes.metrics);
      setRecommendations(analyticsRes.recommendations || []);
      setApprovals(approvalsRes);
      setDocuments(docsRes);
      setTasks(tasksRes);
      setLeaves(leavesRes);
      setExpenses(expensesRes);
      setLeads(leadsRes);
      setUsers(usersRes);

      // Load admin audits if applicable
      if (user?.role === 'Admin') {
        const auditLogs = await api.users.audits().catch(() => []);
        setAudits(auditLogs);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleResolveApproval = async (approvalId: string, status: 'approved' | 'rejected') => {
    try {
      await api.workflows.resolveApproval(approvalId, status, 'Approved via dashboard widget');
      addToast('Approval Recorded', `Workflow has been marked as ${status} successfully.`, 'success');
      loadDashboardData();
    } catch (err: any) {
      addToast('Action Failed', err.message, 'danger');
    }
  };

  const handleResolveLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await api.business.leaves.resolve(leaveId, status);
      addToast('Leave Request Updated', `Leave request has been ${status}.`, 'success');
      loadDashboardData();
    } catch (err: any) {
      addToast('Action Failed', err.message, 'danger');
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await api.business.tasks.update(task.id, { ...task, status: newStatus });
      addToast('Task Updated', `Task status changed to ${newStatus}.`, 'info');
      loadDashboardData();
    } catch (err: any) {
      addToast('Task Update Failed', err.message, 'danger');
    }
  };

  // Submit Leave from Dashboard (Employee Widget)
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) {
      addToast('Fields Required', 'Please fill in all leave request inputs.', 'warning');
      return;
    }
    setSubmittingRequest(true);
    try {
      await api.business.leaves.create({
        start_date: leaveStart,
        end_date: leaveEnd,
        reason: leaveReason,
        type: leaveType
      });
      addToast('Request Submitted', 'Your leave request has been submitted for approval.', 'success');
      // Reset form
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
      loadDashboardData();
    } catch (err: any) {
      addToast('Request Failed', err.message, 'danger');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Submit Expense from Dashboard (Employee Widget)
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expMerchant || !expAmount || !expDate) {
      addToast('Fields Required', 'Please fill in all expense claims details.', 'warning');
      return;
    }
    setSubmittingRequest(true);
    try {
      await api.business.expenses.create({
        merchant: expMerchant,
        amount: expAmount,
        category: expCategory,
        date: expDate
      });
      addToast('Claim Submitted', 'Your expense claim was saved successfully.', 'success');
      // Reset form
      setExpMerchant('');
      setExpAmount('');
      setExpDate('');
      loadDashboardData();
    } catch (err: any) {
      addToast('Claim Failed', err.message, 'danger');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl col-span-2" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Define dynamic role welcome message and metrics
  const userRole = user?.role || 'Employee';

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* 1. Welcome Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Welcome back, {user?.full_name.split(' ')[0]}</span> 
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong className="text-brand-500">{userRole}</strong> in the **{user?.organization_name || 'Acme Workspace'}** panel.
          </p>
        </div>

        {/* Action Button depending on roles */}
        <div className="flex items-center gap-2">
          {userRole === 'Admin' && (
            <button 
              onClick={() => setActiveTab?.('users')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
            >
              Manage Users
            </button>
          )}
          {userRole === 'HR' && (
            <button 
              onClick={() => setActiveTab?.('hr')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
            >
              Verify Leave Request Queues
            </button>
          )}
          {userRole === 'Finance' && (
            <button 
              onClick={() => setActiveTab?.('generator')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
            >
              Compile Invoices
            </button>
          )}
          {userRole === 'Manager' && (
            <button 
              onClick={() => setActiveTab?.('workflows')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
            >
              Review Running Pipelines
            </button>
          )}
          {userRole === 'Employee' && (
            <button 
              onClick={() => setActiveTab?.('chat')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. AI Executive Brief & Risk Alerts Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Daily Business Summary */}
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-500/10 to-accent-500/10 border border-brand-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-500">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">AI Executive Brief • {userRole} Portal</span>
            </div>
            
            <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 leading-snug">
              {userRole === 'Admin' && `Operations are stable. Mapped ${users.length} active employee profiles and completed security checks.`}
              {userRole === 'HR' && `Standard Leave Carry-over complies with standard HR guidelines. Mapped ${leaves.filter(l => l.status === 'pending').length} pending leave request.`}
              {userRole === 'Finance' && `Cash flow is positive with target projections met. Overdue invoice outstanding is currently $15,400.`}
              {userRole === 'Manager' && `Team delivery pipelines are executing. Action suggested to resolve pending leave approvals.`}
              {userRole === 'Employee' && `Your personal workspace is initialized. Mapped ${tasks.filter(t => t.assignee_id === user?.id && t.status !== 'completed').length} pending tasks assigned to you.`}
            </h2>
            
            <p className="text-xs text-slate-455 dark:text-slate-400 leading-relaxed">
              {userRole === 'Admin' && `System logs audit shows active tokens. Mapped ${documents.length} scanned documents. System integrity is compliant.`}
              {userRole === 'HR' && `Team leave summaries show active vacation calendars. Employees have registered their 2026 plans. Average team compliance is 99%.`}
              {userRole === 'Finance' && `Acme Q2 target achievements are visible in the ledger. Unpaid invoice alert has been triggered for Slack Technologies.`}
              {userRole === 'Manager' && `Workflow executor is running. Blocked task queues require supervisor clearance on leave claims.`}
              {userRole === 'Employee' && `Your annual leave balance shows 22 days remaining. If you want to check your benefits guidelines, search or ask the Copilot.`}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Copilot Engine Active</span>
            </span>
            <span>•</span>
            <span>Last Sync: Just now</span>
          </div>
        </div>

        {/* Risk Alerts Center */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider">Workspace Alerts</span>
            </div>

            <div className="space-y-3.5">
              {userRole === 'Admin' && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">User role modifications detected</p>
                      <p className="text-[10px] text-slate-450">Admin audited role changes manually saved</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Disk cache backup pending</p>
                      <p className="text-[10px] text-slate-450">Seeded lowdb JSON structures written locally</p>
                    </div>
                  </div>
                </>
              )}
              {userRole === 'HR' && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Pending Leave Request Approval</p>
                      <p className="text-[10px] text-slate-450">Jane Foster requested leave starting July 15 • 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Compliances Check complete</p>
                      <p className="text-[10px] text-slate-450">Standard HR document guides fully processed for RAG</p>
                    </div>
                  </div>
                </>
              )}
              {userRole === 'Finance' && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Slack Tech invoice is overdue</p>
                      <p className="text-[10px] text-slate-450">Stripe invoice is 27 days late • Value: $15,400.00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Outstanding Receivables check</p>
                      <p className="text-[10px] text-slate-450">Total outstanding balance from unpaid templates: $23,900</p>
                    </div>
                  </div>
                </>
              )}
              {userRole === 'Manager' && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Action Blocked Approvals</p>
                      <p className="text-[10px] text-slate-450">1 leave request blocks execution pipelines runner</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Tasks assigned audit</p>
                      <p className="text-[10px] text-slate-450">Tasks queue verified • 3 items active</p>
                    </div>
                  </div>
                </>
              )}
              {userRole === 'Employee' && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Assigned Tasks Review</p>
                      <p className="text-[10px] text-slate-450">Complete compliance modules training in tasks tab</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Vacation approved by HR</p>
                      <p className="text-[10px] text-slate-450">Leave calendar entry synchronized for August 1</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-bold mt-4">
            Alert Risk Status: <span className="text-emerald-500 font-semibold">SECURE</span>
          </div>
        </div>
      </div>

      {/* 3. Role-Based Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
              {userRole === 'Admin' && 'System Users'}
              {userRole === 'HR' && 'Total Employees'}
              {userRole === 'Finance' && 'Collected Revenue'}
              {userRole === 'Manager' && 'Blocked Approvals'}
              {userRole === 'Employee' && 'My Tasks Queue'}
            </span>
            <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {userRole === 'Admin' && `${users.length} Profiles`}
              {userRole === 'HR' && `${users.length} People`}
              {userRole === 'Finance' && `$${metrics?.revenueCollected?.toLocaleString() || '125,000'}`}
              {userRole === 'Manager' && `${approvals.length} Blockers`}
              {userRole === 'Employee' && `${tasks.filter(t => t.assignee_id === user?.id && t.status !== 'completed').length} Active`}
            </p>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Standard Operations Mapped</span>
            </span>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
            {userRole === 'Admin' || userRole === 'HR' ? <Users className="h-5 w-5" /> : null}
            {userRole === 'Finance' ? <TrendingUp className="h-5 w-5" /> : null}
            {userRole === 'Manager' ? <UserCheck className="h-5 w-5" /> : null}
            {userRole === 'Employee' ? <Check className="h-5 w-5" /> : null}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">
              {userRole === 'Admin' && 'Indexed Files'}
              {userRole === 'HR' && 'Pending Leaves'}
              {userRole === 'Finance' && 'Late Receivables'}
              {userRole === 'Manager' && 'Running Pipelines'}
              {userRole === 'Employee' && 'Vacation Entitlement'}
            </span>
            <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {userRole === 'Admin' && `${documents.length} Docs`}
              {userRole === 'HR' && `${leaves.filter(l => l.status === 'pending').length} Requests`}
              {userRole === 'Finance' && `$${metrics?.outstandingReceivables?.toLocaleString() || '15,400'}`}
              {userRole === 'Manager' && `${metrics?.runningExecutionsCount || 1} Active`}
              {userRole === 'Employee' && '22 Days Left'}
            </p>
            <span className="text-[10px] text-slate-400 font-bold mt-1 block">
              {userRole === 'Admin' && 'RAG search database vectors'}
              {userRole === 'HR' && 'Awaiting approvals'}
              {userRole === 'Finance' && 'Overdue Stripe collections'}
              {userRole === 'Manager' && 'Automated step executors'}
              {userRole === 'Employee' && 'Annual leave carry-over loaded'}
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            {userRole === 'Admin' && <FileText className="h-5 w-5" />}
            {userRole === 'HR' || userRole === 'Employee' && <Calendar className="h-5 w-5" />}
            {userRole === 'Finance' && <DollarSign className="h-5 w-5" />}
            {userRole === 'Manager' && <Cpu className="h-5 w-5" />}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">
              {userRole === 'Admin' && 'System Automations'}
              {userRole === 'HR' && 'Compliance Rate'}
              {userRole === 'Finance' && 'Unpaid Invoices'}
              {userRole === 'Manager' && 'Running Workflows'}
              {userRole === 'Employee' && 'Approved Claims'}
            </span>
            <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {userRole === 'Admin' && `${metrics?.activeAutomationsCount || 2} Jobs`}
              {userRole === 'HR' && '99%'}
              {userRole === 'Finance' && `${leads.length} Invoiced`}
              {userRole === 'Manager' && `${metrics?.activeAutomationsCount || 2} Systems`}
              {userRole === 'Employee' && `${expenses.filter(e => e.user_id === user?.id && e.status === 'approved').length} Expenses`}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
              {userRole === 'Admin' && 'Trigger node connectors'}
              {userRole === 'HR' && 'Leave regulations compliance'}
              {userRole === 'Finance' && 'Pending billing clearance'}
              {userRole === 'Manager' && 'Webhook listeners mapped'}
              {userRole === 'Employee' && 'Directly logged via ledger'}
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
            {userRole === 'Admin' || userRole === 'Manager' ? <Cpu className="h-5 w-5" /> : null}
            {userRole === 'HR' ? <Activity className="h-5 w-5" /> : null}
            {userRole === 'Finance' ? <FileText className="h-5 w-5" /> : null}
            {userRole === 'Employee' ? <DollarSign className="h-5 w-5" /> : null}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">
              {userRole === 'Admin' && 'System Health'}
              {userRole === 'HR' && 'Compliance Audits'}
              {userRole === 'Finance' && 'Finance Health'}
              {userRole === 'Manager' && 'Operations Health'}
              {userRole === 'Employee' && 'Automations Run'}
            </span>
            <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {userRole === 'Admin' && '98%'}
              {userRole === 'HR' && '100%'}
              {userRole === 'Finance' && '97%'}
              {userRole === 'Manager' && '94%'}
              {userRole === 'Employee' && '12 Runs'}
            </p>
            <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${userRole === 'Admin' ? '98' : userRole === 'HR' ? '100' : userRole === 'Finance' ? '97' : userRole === 'Manager' ? '94' : '85'}%` }} 
              />
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Heart className="h-5 w-5 animate-pulse" />
          </div>
        </div>

      </div>

      {/* 4. Middle Grid Layout tailored to user roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Widget (Grid Column Span 2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between">
          <div>
            
            {/* Admin Audit Logs Widget */}
            {userRole === 'Admin' && (
              <>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-brand-500" />
                  <span>Security Audit Logs</span>
                </h2>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {audits.length === 0 ? (
                    <p className="py-6 text-center text-slate-400 text-xs">No recent system logs.</p>
                  ) : (
                    audits.slice(0, 4).map((audit) => (
                      <div key={audit.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-350">{audit.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Target: {audit.target_type} • User: {audit.user_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-slate-500">{audit.ip_address}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{new Date(audit.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* HR Pending Leaves Widget */}
            {userRole === 'HR' && (
              <>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-brand-500" />
                  <span>Active Leaves Approval Queue</span>
                </h2>
                <div className="space-y-3">
                  {leaves.filter(l => l.status === 'pending').length === 0 ? (
                    <p className="py-6 text-center text-slate-400 text-xs">No leave requests require immediate HR signoff.</p>
                  ) : (
                    leaves.filter(l => l.status === 'pending').map((leave) => (
                      <div key={leave.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                            <span>{leave.full_name}</span>
                            <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-500 font-bold text-[9px] uppercase">{leave.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1">Duration: {leave.start_date} to {leave.end_date} • "{leave.reason}"</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleResolveLeave(leave.id, 'approved')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-0.5 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button 
                            onClick={() => handleResolveLeave(leave.id, 'rejected')}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-0.5 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Finance Overdue Billing Widget */}
            {userRole === 'Finance' && (
              <>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4.5 w-4.5 text-brand-500" />
                  <span>Late / Outstanding Invoices</span>
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-150">Slack Technologies Inc.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">INV-2026-003 • Due June 10, 2026</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs font-bold text-rose-500">$15,400.00</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">27 days overdue</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-500 uppercase">Overdue</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-150">Stripe Inc.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">INV-2026-002 • Due July 15, 2026</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs font-bold text-amber-500">$8,500.00</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Awaiting check</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 uppercase">Unpaid</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Manager Pending Approvals Widget */}
            {userRole === 'Manager' && (
              <>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <UserCheck className="h-4.5 w-4.5 text-brand-500" />
                  <span>Pending Action Approvals</span>
                </h2>
                
                {approvals.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No active workflows require approval at this time. All runners are operational.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvals.map((app) => (
                      <div 
                        key={app.id} 
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {app.workflow_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Awaiting role verification: **{app.role_required}**. Log reference: #{app.workflow_log_id}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveApproval(app.id, 'approved')}
                            className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleResolveApproval(app.id, 'rejected')}
                            className="bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Employee Quick Request panel widget */}
            {userRole === 'Employee' && (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5 text-brand-500" />
                    <span>Submit Quick Request</span>
                  </h2>
                  <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    <button 
                      onClick={() => setRequestType('leave')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${requestType === 'leave' ? 'bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                      Time Off
                    </button>
                    <button 
                      onClick={() => setRequestType('expense')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${requestType === 'expense' ? 'bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                      Expense Claim
                    </button>
                  </div>
                </div>

                {requestType === 'leave' ? (
                  <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Date</label>
                        <input 
                          type="date"
                          required
                          value={leaveStart}
                          onChange={(e) => setLeaveStart(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">End Date</label>
                        <input 
                          type="date"
                          required
                          value={leaveEnd}
                          onChange={(e) => setLeaveEnd(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Leave Type</label>
                        <select 
                          value={leaveType}
                          onChange={(e) => setLeaveType(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="Annual Leave">Annual Vacation Leave</option>
                          <option value="Sick Leave">Fully Paid Medical Leave</option>
                          <option value="Maternity Leave">Maternity Time Off</option>
                          <option value="Paternity Leave">Paternity Time Off</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Brief Reason</label>
                        <input 
                          type="text"
                          required
                          placeholder="Family vacation plans"
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={submittingRequest}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10 transition-colors w-full"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submittingRequest ? 'Submitting request...' : 'File Leave Request'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleExpenseSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Merchant / Vendor</label>
                        <input 
                          type="text"
                          required
                          placeholder="Amazon Web Services"
                          value={expMerchant}
                          onChange={(e) => setExpMerchant(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Total Amount ($)</label>
                        <input 
                          type="number"
                          step="0.01"
                          required
                          placeholder="42.80"
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Expense Category</label>
                        <select 
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="Hosting">Hosting & Infrastructure</option>
                          <option value="Meals">Meals & Catering</option>
                          <option value="Travel">Business Travel</option>
                          <option value="SaaS License">Software Subscription</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Receipt Date</label>
                        <input 
                          type="date"
                          required
                          value={expDate}
                          onChange={(e) => setExpDate(e.target.value)}
                          disabled={submittingRequest}
                          className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={submittingRequest}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10 transition-colors w-full"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submittingRequest ? 'Logging claim...' : 'Submit Expense Claim'}</span>
                    </button>
                  </form>
                )}
              </>
            )}

          </div>

          {/* Bottom redirection indicators */}
          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-6 flex justify-between items-center text-xs text-brand-500 font-bold hover:underline cursor-pointer">
            {userRole === 'Admin' && (
              <div onClick={() => setActiveTab?.('users')} className="flex items-center justify-between w-full">
                <span>Access all database tables directory</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
            {userRole === 'HR' && (
              <div onClick={() => setActiveTab?.('hr')} className="flex items-center justify-between w-full">
                <span>View historical leaves logbooks</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
            {userRole === 'Finance' && (
              <div onClick={() => setActiveTab?.('finance')} className="flex items-center justify-between w-full">
                <span>Audit monthly sales ledgers</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
            {userRole === 'Manager' && (
              <div onClick={() => setActiveTab?.('workflows')} className="flex items-center justify-between w-full">
                <span>Review all execution pipelines</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
            {userRole === 'Employee' && (
              <div onClick={() => setActiveTab?.('tasks')} className="flex items-center justify-between w-full">
                <span>Check all assigned deliverables</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Right Widget (Grid Column Span 1) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-500" />
              <span>AI Agent Suggestions</span>
            </h2>
            
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                        {rec.category}
                      </span>
                      <span className="text-[9px] text-brand-500 font-semibold">{rec.impact}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {rec.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {rec.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      SYSTEM
                    </span>
                    <span className="text-[9px] text-brand-500 font-semibold">HIGH</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    Run automated leave updates
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    AI suggests checking leave balance policies in Knowledge Base to synchronize team vacations automations.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-500/10 to-accent-500/10 p-3 rounded-2xl border border-brand-500/10 text-[10px] text-slate-400 flex items-start gap-2 mt-6">
            <Sparkles className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <span>
              {userRole === 'Admin' && 'AI recommends enforcing JWT signature policies to secure webhook executors.'}
              {userRole === 'HR' && 'AI suggests matching leave schedules with upcoming project milestones.'}
              {userRole === 'Finance' && 'AI suggests automated late invoice collection emails for overdue contracts.'}
              {userRole === 'Manager' && 'AI suggests resolving Jane Foster leave requests to clear blocked runners.'}
              {userRole === 'Employee' && 'AI suggests referencing HR Policy text file in Knowledge Base before filing vacation requests.'}
            </span>
          </div>
        </div>

      </div>

      {/* 5. Bottom Columns: Recent Documents & Tasks Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Knowledgebase Documents */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-brand-500" />
            <span>Recent Indexed Knowledge</span>
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {documents.length === 0 ? (
              <p className="py-6 text-center text-slate-400 text-xs">No indexed files. Upload txt/csv files in Knowledge Base.</p>
            ) : (
              documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-slate-500 text-[10px] font-bold tracking-wide uppercase">
                      {doc.file_type}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate max-w-[200px]">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Size: {(doc.file_size / 1024).toFixed(1)} KB | Status: {doc.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checklist: Assigned/Workspace Tasks */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-brand-500" />
            <span>
              {userRole === 'Employee' ? 'My Assigned Deliverables' : 'Workspace Action Deliverables'}
            </span>
          </h2>

          <div className="space-y-3">
            {tasks.filter(t => userRole === 'Employee' ? t.assignee_id === user?.id : true).length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-xs">No checklist tasks assigned.</p>
            ) : (
              tasks.filter(t => userRole === 'Employee' ? t.assignee_id === user?.id : true).slice(0, 4).map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-950/20 border border-slate-150/60 dark:border-slate-800/30 transition-colors hover:border-brand-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleTaskStatus(task)}
                        className="h-4.5 w-4.5 text-brand-500 rounded border-slate-300 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700"
                      />
                      <span className={`text-xs font-semibold text-slate-750 dark:text-slate-300 ${isCompleted ? 'line-through opacity-40' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' :
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;

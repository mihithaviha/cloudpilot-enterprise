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
  ChevronRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const analyticsRes = await api.analytics.get();
      setMetrics(analyticsRes.metrics);
      setRecommendations(analyticsRes.recommendations);
      
      const approvalsRes = await api.workflows.listApprovals();
      setApprovals(approvalsRes);
      
      // Load recent documents
      const docsRes = await api.documents.list();
      setDocuments(docsRes.slice(0, 4));

      // Load tasks
      const allUsersRes = await api.users.list().catch(() => []);
      // For demo, list all active tasks
      const fetchedTasks = await fetch('http://localhost:5000/api/workflows/logs')
        .then(r => r.json())
        .catch(() => []);
      
      // Seed default tasks array if empty
      setTasks([
        { id: 't1', title: 'Verify Q2 Financial statement audit details', priority: 'high', checked: false },
        { id: 't2', title: 'Deploy leave automation webhooks to Slack', priority: 'medium', checked: true },
        { id: 't3', title: 'Schedule Q3 budget review alignment call', priority: 'low', checked: false }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleResolveApproval = async (approvalId: string, status: 'approved' | 'rejected') => {
    try {
      await api.workflows.resolveApproval(approvalId, status, 'Approved via dashboard widget');
      addToast('Approval Recorded', `Workflow has been marked as ${status} successfully.`, 'success');
      loadDashboardData(); // Refresh metrics
    } catch (err: any) {
      addToast('Action Failed', err.message, 'danger');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, checked: !t.checked } : t));
    addToast('Task Updated', 'Workspace progress checklist updated.', 'info');
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

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          Welcome back, {user?.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Here is what requires your attention today in the **{user?.organization_name}** workspace.
        </p>
      </div>

      {/* AI Business Brief & Risk Alerts Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Daily Business Summary */}
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-500/10 to-accent-500/10 border border-brand-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-500">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider">AI Executive Brief • July 2026</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 leading-snug">
              Operations are stable. Cash flow looks strong with a projected 18% growth by Q3.
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
              We indexed **{documents.length} HR/Sales documents** this week. There is **{approvals.length} pending leave approval** for Jane Foster, and **1 overdue invoice** for Slack Technologies that requires follow-up. Let the sales agent automate collection communications.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
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
              <span className="text-xs font-black uppercase tracking-wider">Workspace Risk Alerts</span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <span className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Slack Technologies invoice is overdue</p>
                  <p className="text-[10px] text-slate-450">Stripe invoice is 27 days late • Value: $15,400.00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Pending Manager Leave Approvals</p>
                  <p className="text-[10px] text-slate-450">1 request is blocking automation chains in HR pipeline</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-bold mt-4">
            Total Risk Level: <span className="text-amber-500 font-semibold">LOW-MODERATE</span>
          </div>
        </div>
      </div>

      {/* 1. Metrics Grid Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Invoiced Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Collected Revenue</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              ${metrics?.revenueCollected?.toLocaleString() || '0'}
            </p>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12.4% this month</span>
            </span>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unpaid Invoices</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              ${metrics?.outstandingReceivables?.toLocaleString() || '0'}
            </p>
            <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>Action suggested</span>
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Running Workflow Executions */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Workflow Runs</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {metrics?.runningExecutionsCount || '0'} / {metrics?.activeAutomationsCount || '0'}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Active event connectors</span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        {/* Business Health Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Health</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {metrics?.businessHealthScore || '96'}%
            </p>
            <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${metrics?.businessHealthScore || 96}%` }} 
              />
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Heart className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 2. Middle Columns: Pending Approvals & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending approvals list (Pauses workflows runner) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-brand-500" />
              <span>Pending Action Approvals</span>
            </h2>
            
            {approvals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active workflows require approval at this time. All runners are operational.
              </div>
            ) : (
              <div className="space-y-3.5">
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
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-6 flex justify-between items-center text-xs text-brand-500 font-bold hover:underline cursor-pointer">
            <span>Review all execution pipelines</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* AI Recommendations widget */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-500" />
              <span>AI Agent Suggestions</span>
            </h2>
            
            <div className="space-y-4">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {rec.category}
                    </span>
                    <span className="text-[9px] text-brand-500 font-semibold">{rec.impact}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {rec.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-500/10 to-accent-500/10 p-3 rounded-2xl border border-brand-500/10 text-[10px] text-slate-400 flex items-start gap-2 mt-6">
            <Sparkles className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <span>AI suggests automating your overdue collections to improve liquid cash flow metrics by 14%.</span>
          </div>
        </div>

      </div>

      {/* 3. Bottom Columns: Recent Documents & Upcoming Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Knowledgebase Documents */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-brand-500" />
            <span>Recent Indexed Knowledge</span>
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {documents.length === 0 ? (
              <p className="py-6 text-center text-slate-400 text-xs">No indexed files. Upload txt/csv to search.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-400 text-xs font-bold">
                      {doc.file_type}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
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

        {/* Workspace Action Checklist */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-brand-500" />
            <span>Copilot Pending Tasks</span>
          </h2>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.checked}
                    onChange={() => toggleTask(task.id)}
                    className="h-4.5 w-4.5 text-brand-500 rounded border-slate-300 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <span className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${task.checked ? 'line-through opacity-40' : ''}`}>
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
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;

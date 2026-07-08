import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  Cpu, 
  Play, 
  GitBranch, 
  HelpCircle, 
  Settings, 
  Plus, 
  Activity, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const Workflows: React.FC = () => {
  const { addToast } = useNotifications();

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [currentExecution, setCurrentExecution] = useState<any>(null);
  const [running, setRunning] = useState(false);

  // Leave request simulation inputs
  const [leaveDays, setLeaveDays] = useState(3);

  const loadWorkflows = async () => {
    try {
      const res = await api.workflows.list();
      setWorkflows(res);
      if (res.length > 0 && !activeWorkflow) {
        setActiveWorkflow(res[0]);
      }
      
      const logsRes = await api.workflows.listLogs();
      setExecutionLogs(logsRes);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleSelectWorkflow = (wf: any) => {
    setActiveWorkflow(wf);
    setCurrentExecution(null);
  };

  const handleTriggerWorkflow = async () => {
    if (!activeWorkflow || running) return;

    setRunning(true);
    setCurrentExecution(null);
    addToast('Triggering Workflow', `Initializing "${activeWorkflow.name}" automation pipeline...`, 'info');

    try {
      const initialData = activeWorkflow.trigger_type === 'leave_request' 
        ? { days: leaveDays } 
        : { clientName: 'Vercel Inc.', totalAmount: 1500 };

      const res = await api.workflows.execute(activeWorkflow.id, initialData);
      setCurrentExecution(res);
      addToast('Workflow Fired', `Status: ${res.status.replace('_', ' ').toUpperCase()}`, 'success');
      
      // Reload logs
      const logsRes = await api.workflows.listLogs();
      setExecutionLogs(logsRes);
    } catch (err: any) {
      addToast('Workflow Trigger Error', err.message, 'danger');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          Workflow Automations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Build automated business flows by connecting triggers to AI actions and workspace integration gates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 1. Left Sidebar: Workflow Templates & Logs */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Templates list */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-3 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-brand-500" />
              <span>Pipelines</span>
            </h3>
            <div className="space-y-1.5">
              {workflows.map((w) => {
                const isActive = activeWorkflow?.id === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectWorkflow(w)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {w.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution History logs */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-3 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-brand-500" />
              <span>Execution Logs</span>
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {executionLogs.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-4">No historical runs.</p>
              ) : (
                executionLogs.map((log) => {
                  const isCompleted = log.status === 'completed';
                  const isPending = log.status === 'pending_approval';
                  return (
                    <div 
                      key={log.id} 
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-105/50 dark:border-slate-800/30 text-[10px] space-y-1"
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-650 dark:text-slate-350 truncate">#{log.id}</span>
                        <span className={`${
                          isCompleted ? 'text-emerald-500' :
                          isPending ? 'text-brand-500' :
                          'text-rose-500'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400">
                        Steps executed: {log.current_step} | {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* 2. Right Canvas: Interactive Connector Visualizer */}
        <div className="lg:col-span-3 space-y-6">
          {activeWorkflow ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 relative">
              
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-4 mb-6">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{activeWorkflow.name}</h2>
                  <p className="text-[11px] text-slate-450 mt-1">{activeWorkflow.description}</p>
                </div>
                
                {/* Simulated Trigger controls */}
                <div className="flex items-center gap-3">
                  {activeWorkflow.trigger_type === 'leave_request' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold">DAYS:</span>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={leaveDays}
                        onChange={(e) => setLeaveDays(Number(e.target.value))}
                        className="w-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center rounded-lg text-xs py-1 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleTriggerWorkflow}
                    disabled={running}
                    className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40 px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-brand-500/10"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Trigger Flow</span>
                  </button>
                </div>
              </div>

              {/* Trigger Node card */}
              <div className="flex flex-col items-center gap-6">
                <div className="w-64 p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg text-center flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded mb-2">TRIGGER BLOCK</span>
                  <p className="text-xs font-bold">{activeWorkflow.trigger_type === 'leave_request' ? 'Paid Leave Form Submitted' : 'Vendor Invoice Uploaded'}</p>
                  <p className="text-[10px] text-brand-100 mt-1">Simulated via user portal trigger</p>
                </div>

                <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-slate-400 rotate-90" />
                </div>

                {/* Steps Nodes sequence cards connected by arrows */}
                <div className="flex flex-wrap justify-center gap-4 relative w-full px-4">
                  {activeWorkflow.steps.map((step: any, idx: number) => {
                    // Check if this step was executed in the current/latest log
                    const isLeave = activeWorkflow.trigger_type === 'leave_request';
                    const runLog = currentExecution?.steps_log?.[idx];
                    const runSuccess = runLog?.status === 'success';
                    const runPending = runLog?.status === 'pending';
                    const runFailed = runLog?.status === 'failed';

                    return (
                      <React.Fragment key={step.id}>
                        <div className={`w-52 p-4 rounded-2xl border text-center flex flex-col items-center justify-between h-36 transition-all ${
                          runSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 ring-2 ring-emerald-500/10' :
                          runPending ? 'bg-brand-500/10 border-brand-500/20 text-brand-800 dark:text-brand-400 ring-2 ring-brand-500/10 animate-pulse' :
                          runFailed ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-400 ring-2 ring-rose-500/10' :
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350'
                        }`}>
                          <div className="w-full flex justify-between items-start">
                            <span className="text-[8px] bg-slate-100 dark:bg-slate-800 p-1 rounded font-bold text-slate-400">STEP {idx + 1}</span>
                            <Settings className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                          </div>

                          <div className="my-2">
                            <p className="text-xs font-bold leading-tight">{step.title}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{step.type.replace('_', ' ')}</p>
                          </div>

                          {/* Execution detail overlay */}
                          <div className="w-full text-center border-t border-slate-100 dark:border-slate-800/60 pt-2 flex items-center justify-center gap-1.5">
                            {runSuccess && (
                              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                                <CheckCircle className="h-3 w-3" /> Success
                              </span>
                            )}
                            {runPending && (
                              <span className="text-[9px] text-brand-500 font-bold flex items-center gap-0.5">
                                <Clock className="h-3 w-3 animate-spin" /> Pending Approval
                              </span>
                            )}
                            {runFailed && (
                              <span className="text-[9px] text-rose-500 font-bold flex items-center gap-0.5">
                                <AlertTriangle className="h-3 w-3" /> Failed
                              </span>
                            )}
                            {!runLog && (
                              <span className="text-[9px] text-slate-400">Idle queue</span>
                            )}
                          </div>
                        </div>

                        {idx < activeWorkflow.steps.length - 1 && (
                          <div className="hidden lg:flex items-center justify-center text-slate-300 dark:text-slate-700">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

              </div>
              
              {/* Detailed logs feed at bottom of running execution */}
              {currentExecution && (
                <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 space-y-2 text-xs">
                  <p className="font-extrabold text-slate-700 dark:text-slate-350">Live State Output</p>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400 max-h-36 overflow-y-auto">
                    {currentExecution.steps_log.map((step: any, sidx: number) => (
                      <div key={sidx} className="flex gap-2">
                        <span className="text-slate-500 font-semibold">[{new Date().toLocaleTimeString()}]</span>
                        <span className={step.status === 'success' ? 'text-emerald-500' : step.status === 'pending' ? 'text-brand-400' : 'text-rose-500'}>
                          {step.step}:
                        </span>
                        <span className="text-slate-650 dark:text-slate-350">{step.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">No workflows templates loaded.</div>
          )}
        </div>

      </div>

    </div>
  );
};
export default Workflows;

import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  FolderKanban, 
  Calendar, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ChevronRight, 
  CheckCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface Task {
  id: string;
  creator_id: string;
  assignee_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'under_review' | 'completed';
  due_date: string;
  created_at: string;
  aiScore?: number;
}

export const Tasks: React.FC = () => {
  const { addToast } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [loading, setLoading] = useState(true);
  
  // Task form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'under_review' | 'completed'>('todo');
  const [dueDate, setDueDate] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.business.tasks.list();
      // Add a mock AI prioritization score
      const enriched = res.map((t: Task) => {
        let base = 50;
        if (t.priority === 'high') base += 30;
        if (t.priority === 'medium') base += 15;
        if (t.status === 'completed') base = 100;
        const hash = t.title.charCodeAt(0) || 0;
        return {
          ...t,
          aiScore: Math.min(100, Math.max(10, base + (hash % 15)))
        };
      });
      setTasks(enriched);
      setLoading(false);
    } catch (err: any) {
      addToast('Error', 'Failed to fetch tasks: ' + err.message, 'danger');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      addToast('Validation Error', 'Title is required.', 'warning');
      return;
    }

    try {
      await api.business.tasks.create({
        title,
        description,
        priority,
        status,
        due_date: dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      });
      addToast('Task Created', 'AI Copilot added task and optimized priority score.', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
      loadTasks();
    } catch (err: any) {
      addToast('Creation Failed', err.message, 'danger');
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: Task['status']) => {
    try {
      await api.business.tasks.update(task.id, {
        ...task,
        status: newStatus
      });
      addToast('Task Updated', `Task moved to ${newStatus.replace('_', ' ')}`, 'info');
      loadTasks();
    } catch (err: any) {
      addToast('Update Failed', err.message, 'danger');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.business.tasks.delete(id);
      addToast('Task Deleted', 'Workspace task removed successfully.', 'info');
      loadTasks();
    } catch (err: any) {
      addToast('Delete Failed', err.message, 'danger');
    }
  };

  // Helper stats
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const columns: { id: Task['status']; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'border-t-slate-400 dark:border-t-slate-600' },
    { id: 'in_progress', label: 'In Progress', color: 'border-t-brand-500' },
    { id: 'under_review', label: 'Under Review', color: 'border-t-amber-500' },
    { id: 'completed', label: 'Completed', color: 'border-t-emerald-500' }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-brand-500" />
            <span>AI Task Workspace</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize tasks, optimize delivery with AI priority predictions, and track developer output.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/40 flex">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'calendar' 
                  ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/10 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Productivity Score Alert widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span>AI Workspace Recommendations</span>
            </h3>
            <p className="text-[11px] text-slate-400 max-w-md">
              Developer checklist velocity is running at **{progressPercent}%** completion. AI suggests prioritizing task <span className="text-amber-500 font-bold">"Review Q2 Financial Statement"</span> to optimize upcoming vendor billing loops.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-200 dark:stroke-slate-800 fill-transparent" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" className="stroke-brand-500 fill-transparent transition-all duration-500" strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)} 
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-700 dark:text-slate-200">{progressPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Velocity Score</span>
              <span className="text-xs font-black text-brand-500 flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Steady (+4%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Small calendar header summary */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Workspace Deadlines</span>
            <p className="text-sm font-black text-slate-700 dark:text-slate-250">
              {tasks.filter(t => t.status !== 'completed').length} Tasks Pending
            </p>
            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              <span>{tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length} High Priority</span>
            </span>
          </div>
          <div className="p-3.5 bg-brand-500/10 rounded-2xl text-brand-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban Board Columns */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className={`glass-panel rounded-3xl p-5 border-t-4 border border-slate-250/50 dark:border-slate-850/30 flex flex-col justify-between min-h-[500px] ${col.color}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-5 px-1">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      {col.label}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-450 dark:text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[480px] no-scrollbar">
                    {colTasks.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-[10px] text-slate-400">
                        No tasks in this stage.
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200 space-y-3 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                              task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' :
                              task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-slate-500/10 text-slate-500'
                            }`}>
                              {task.priority}
                            </span>

                            <span className="text-[9px] text-slate-450 dark:text-slate-500 font-extrabold flex items-center gap-0.5 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                              <Sparkles className="h-2.5 w-2.5 text-brand-500" />
                              <span>AI:{task.aiScore}%</span>
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[10px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-1 flex items-center justify-between">
                            <span className="text-[9px] text-slate-400">
                              Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>

                            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              {/* Stage movement actions */}
                              {col.id !== 'completed' && (
                                <button
                                  onClick={() => {
                                    const stages: Task['status'][] = ['todo', 'in_progress', 'under_review', 'completed'];
                                    const nextIdx = stages.indexOf(col.id) + 1;
                                    handleUpdateStatus(task, stages[nextIdx]);
                                  }}
                                  title="Move to Next Stage"
                                  className="p-1 rounded-md bg-slate-50 hover:bg-brand-50 dark:bg-slate-950 dark:hover:bg-brand-950 text-slate-400 hover:text-brand-500 transition-colors"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete Task"
                                className="p-1 rounded-md bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/40 text-slate-450 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar view grid */
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <div className="grid grid-cols-7 gap-4 text-center border-b border-slate-150 dark:border-slate-800/50 pb-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-xs font-extrabold text-slate-450 dark:text-slate-500 uppercase">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4 min-h-[350px]">
            {/* Generate calendar dummy offsets */}
            {[...Array(35)].map((_, i) => {
              const dayNum = (i - 2) > 0 && (i - 2) <= 31 ? (i - 2) : null;
              const dateStr = dayNum ? `2026-07-${dayNum.toString().padStart(2, '0')}` : null;
              const dayTasks = tasks.filter(t => {
                if (!dateStr) return false;
                const taskDate = t.due_date.split('T')[0];
                return taskDate === dateStr;
              });

              return (
                <div 
                  key={i} 
                  className={`p-3 rounded-2xl border min-h-[90px] flex flex-col justify-between ${
                    dayNum 
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50' 
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                    {dayNum}
                  </span>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <div 
                        key={task.id} 
                        className={`px-2 py-0.5 rounded text-[8px] font-bold truncate ${
                          task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[7px] text-slate-400 text-center font-bold">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl animate-scale-up">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <FolderKanban className="h-5 w-5 text-brand-500" />
              <span>Create New Task</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audits review checklist"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Description</label>
                <textarea
                  placeholder="e.g. Check details of Q2 transactions"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Status Column</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Tasks;

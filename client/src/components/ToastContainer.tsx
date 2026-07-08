import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle, AlertTriangle, Info, Play, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isDanger = toast.type === 'danger';
        const isWarning = toast.type === 'warning';
        const isWorkflow = toast.type === 'workflow';

        return (
          <div
            key={toast.id}
            className={`flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 ${
              isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400' :
              isDanger ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-400' :
              isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400' :
              isWorkflow ? 'bg-brand-500/10 border-brand-500/20 text-brand-800 dark:text-brand-400' :
              'bg-slate-500/10 border-slate-500/20 text-slate-800 dark:text-slate-400'
            }`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {isSuccess && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {isDanger && <AlertTriangle className="h-5 w-5 text-rose-500" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {isWorkflow && <Play className="h-5 w-5 text-brand-500" />}
              {!['success', 'danger', 'warning', 'workflow'].includes(toast.type) && <Info className="h-5 w-5 text-sky-500" />}
            </div>
            
            <div className="flex-1">
              <p className="font-semibold text-sm leading-none mb-1">{toast.title}</p>
              <p className="text-xs opacity-90 leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
export default ToastContainer;

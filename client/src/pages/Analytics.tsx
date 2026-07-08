import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Activity, 
  Sparkles, 
  Heart,
  TrendingDown
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { addToast } = useNotifications();

  const [charts, setCharts] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.analytics.get();
        setCharts(res.charts);
        setMetrics(res.metrics);
        setRecommendations(res.recommendations);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl col-span-2" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          Analytics & Business Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your organizational productivity, financial cash flows, and AI utilization metrics.
        </p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Invoiced */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Invoiced Amount</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              ${metrics?.totalRevenue?.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">Sum of all billing profiles</span>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Revenue Collected</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${metrics?.revenueCollected?.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{((metrics?.revenueCollected / metrics?.totalRevenue) * 100).toFixed(0)}% completion rate</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outstanding Receivables</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              ${metrics?.outstandingReceivables?.toLocaleString()}
            </p>
            <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingDown className="h-3 w-3" />
              <span>Uncollected billing reserves</span>
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Financial Flow Area Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Revenue vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.85)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Daily Usage Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-4 uppercase tracking-wider">AI Daily Tokens consumption</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.aiUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.85)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="tokens" fill="#6366f1" radius={[4, 4, 0, 0]} name="Token Usage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Bottom Columns: Recommendations Details */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
        <h3 className="text-xs font-bold text-slate-755 dark:text-slate-250 mb-6 flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand-500 animate-pulse" />
          <span>AI Business Recommendations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-105/50 dark:border-slate-800/50 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-650 dark:text-brand-400">
                    {rec.category}
                  </span>
                  <span className="text-[9px] text-emerald-500 font-bold">{rec.impact}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <button 
                onClick={() => addToast('Task Auto-Configured', `Added checklist item: ${rec.title}`, 'success')}
                className="w-full text-center mt-5 text-[10px] font-extrabold text-brand-500 hover:underline border-t border-slate-150/40 dark:border-slate-800/40 pt-3"
              >
                Trigger suggestion automations
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default Analytics;

import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Plus, 
  FileText, 
  ArrowRight,
  TrendingDown, 
  Check, 
  Briefcase,
  Users,
  Search,
  UploadCloud
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface Lead {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  status: 'New' | 'Qualified' | 'Proposal' | 'Won';
  value: number;
  conversion_chance: number;
}

interface Expense {
  id: string;
  user_id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const FinanceSales: React.FC = () => {
  const { addToast } = useNotifications();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadCompanyName, setLeadCompanyName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const [leadChance, setLeadChance] = useState('20');
  const [leadStatus, setLeadStatus] = useState<Lead['status']>('New');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expMerchant, setExpMerchant] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Hosting');
  const [expDate, setExpDate] = useState('');

  // OCR Loading state
  const [ocrScanning, setOcrScanning] = useState(false);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const leadsRes = await api.business.leads.list();
      const expensesRes = await api.business.expenses.list();
      setLeads(leadsRes);
      setExpenses(expensesRes);
      setLoading(false);
    } catch (err: any) {
      addToast('Error', 'Failed to load finance logs: ' + err.message, 'danger');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCompanyName || !leadContact) {
      addToast('Validation Error', 'Company name and contact person are required.', 'warning');
      return;
    }

    try {
      await api.business.leads.create({
        company_name: leadCompanyName,
        contact_person: leadContact,
        email: leadEmail,
        value: parseFloat(leadValue) || 0,
        conversion_chance: parseInt(leadChance) || 10,
        status: leadStatus
      });
      addToast('Lead Added', 'Sales pipeline lead registered successfully.', 'success');
      setIsLeadModalOpen(false);
      setLeadCompanyName('');
      setLeadContact('');
      setLeadEmail('');
      setLeadValue('');
      setLeadChance('20');
      setLeadStatus('New');
      loadFinanceData();
    } catch (err: any) {
      addToast('Failed', err.message, 'danger');
    }
  };

  const handleAdvanceLead = async (lead: Lead) => {
    const statusCycle: Lead['status'][] = ['New', 'Qualified', 'Proposal', 'Won'];
    const currentIdx = statusCycle.indexOf(lead.status);
    if (currentIdx === statusCycle.length - 1) return; // Already won

    const nextStatus = statusCycle[currentIdx + 1];
    let nextChance = lead.conversion_chance;
    if (nextStatus === 'Qualified') nextChance = 50;
    if (nextStatus === 'Proposal') nextChance = 80;
    if (nextStatus === 'Won') nextChance = 100;

    try {
      await api.business.leads.update(lead.id, {
        ...lead,
        status: nextStatus,
        conversion_chance: nextChance
      });
      addToast('Pipeline Advanced', `${lead.company_name} moved to ${nextStatus}`, 'success');
      loadFinanceData();
    } catch (err: any) {
      addToast('Failed to update lead', err.message, 'danger');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expMerchant || !expAmount || !expDate) {
      addToast('Validation Error', 'Please enter merchant details, amount, and date.', 'warning');
      return;
    }

    try {
      await api.business.expenses.create({
        merchant: expMerchant,
        amount: expAmount,
        category: expCategory,
        date: expDate
      });
      addToast('Expense Logged', 'Expense recorded for HR/Finance clearance.', 'success');
      setIsExpenseModalOpen(false);
      setExpMerchant('');
      setExpAmount('');
      setExpCategory('Hosting');
      setExpDate('');
      loadFinanceData();
    } catch (err: any) {
      addToast('Failed to log expense', err.message, 'danger');
    }
  };

  // Mock Receipt OCR trigger
  const handleOcrMock = () => {
    setOcrScanning(true);
    addToast('Parsing File', 'AI OCR engine is analyzing receipt formatting...', 'info');
    setTimeout(() => {
      setOcrScanning(false);
      setExpMerchant('Uber Technologies Inc.');
      setExpAmount('42.80');
      setExpCategory('Travel');
      setExpDate(new Date().toISOString().split('T')[0]);
      addToast('AI Extraction Complete', 'Merchant, Amount, Category, and Date populated automatically.', 'success');
    }, 2200);
  };

  // Stats
  const totalPipelineValue = leads.reduce((sum, l) => sum + l.value, 0);
  const averageConversion = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.conversion_chance, 0) / leads.length) : 0;
  const pendingExpensesTotal = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  // Mock Recharts Data for Cash-flow Dashboard
  const forecastData = [
    { name: 'Jan', SalesRevenue: 125000, OperatingCosts: 85000, NetProfit: 40000 },
    { name: 'Feb', SalesRevenue: 115000, OperatingCosts: 90000, NetProfit: 25000 },
    { name: 'Mar', SalesRevenue: 165000, OperatingCosts: 95000, NetProfit: 70000 },
    { name: 'Apr', SalesRevenue: 178000, OperatingCosts: 110000, NetProfit: 68000 },
    { name: 'May', SalesRevenue: 195000, OperatingCosts: 120000, NetProfit: 75000 },
    { name: 'Jun', SalesRevenue: 210000, OperatingCosts: 125000, NetProfit: 85000 },
    { name: 'Jul (Forecast)', SalesRevenue: 235000, OperatingCosts: 130000, NetProfit: 105000 }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-brand-500" />
            <span>AI Finance & Sales Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track deals pipeline, log business expenses using AI OCR receipt scanning, and monitor forecast charts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-250 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add CRM Lead</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/10 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CRM Lead Pipeline</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              ${totalPipelineValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{averageConversion}% average conversion</span>
            </span>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Expenses</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              ${pendingExpensesTotal.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">Awaiting manager signoff</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Projected Cash Balance</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              $195,400.00
            </p>
            <span className="text-[10px] text-brand-500 font-bold block mt-1 flex items-center gap-0.5">
              <Sparkles className="h-3 w-3" />
              <span>AI forecasts +18% Q3 growth</span>
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast Graph */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-250 mb-6">
          Interactive Cash Flow & Forecast Model
        </h2>
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
              <YAxis stroke="#94A3B8" fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: '16px', background: 'rgba(255,255,255,0.9)', border: 'none', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" name="Sales Revenue" dataKey="SalesRevenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" name="Operating Costs" dataKey="OperatingCosts" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Columns: Sales Pipeline & Expenses logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline Leads */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              Active CRM Lead Funnel
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Advance lead stages dynamically to track sales revenue conversions.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {leads.length === 0 ? (
              <p className="py-8 text-center text-slate-450 text-xs">No active sales pipeline leads.</p>
            ) : (
              leads.map(lead => (
                <div key={lead.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-250">{lead.company_name}</p>
                    <p className="text-[10px] text-slate-450">
                      Contact: {lead.contact_person} | {lead.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] bg-brand-500/10 text-brand-500 font-bold px-2 py-0.5 rounded-full uppercase">
                        ${lead.value.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {lead.conversion_chance}% conversion
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      lead.status === 'Won' ? 'bg-emerald-500/10 text-emerald-500' :
                      lead.status === 'Proposal' ? 'bg-indigo-500/10 text-indigo-500' :
                      lead.status === 'Qualified' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {lead.status}
                    </span>

                    {lead.status !== 'Won' && (
                      <button
                        onClick={() => handleAdvanceLead(lead)}
                        title="Move to Next Stage"
                        className="p-1 rounded-lg bg-slate-50 hover:bg-brand-50 dark:bg-slate-950 dark:hover:bg-brand-950 text-slate-450 hover:text-brand-500 transition-colors"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses List */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              Corporate Expense Ledger
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Verify company-wide expense receipts submitted by employees.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {expenses.length === 0 ? (
              <p className="py-8 text-center text-slate-450 text-xs">No logged expenses.</p>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-250">{exp.merchant}</p>
                    <p className="text-[10px] text-slate-400">
                      Category: {exp.category} | Logged: {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">${exp.amount.toFixed(2)}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      exp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      exp.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CRM Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl animate-scale-up">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-brand-500" />
              <span>Add Sales CRM Lead</span>
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe Inc."
                  value={leadCompanyName}
                  onChange={(e) => setLeadCompanyName(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={leadContact}
                    onChange={(e) => setLeadContact(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Lead Funnel Stage</label>
                  <select
                    value={leadStatus}
                    onChange={(e: any) => setLeadStatus(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  >
                    <option value="New">New Lead</option>
                    <option value="Qualified">Qualified Lead</option>
                    <option value="Proposal">Proposal Submitted</option>
                    <option value="Won">Deal Won</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl animate-scale-up">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-brand-500" />
              <span>Log Corporate Expense</span>
            </h3>

            {/* Simulated OCR Receipt Uploader Box */}
            <div 
              onClick={handleOcrMock}
              className="mb-4 border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-brand-500/5 dark:hover:bg-brand-500/5 p-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
            >
              <UploadCloud className={`h-6 w-6 ${ocrScanning ? 'text-brand-500 animate-bounce' : 'text-slate-400'}`} />
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                {ocrScanning ? 'AI Receipt OCR Engine Parsing fields...' : 'Drag & Drop Receipt PDF/Image'}
              </span>
              <span className="text-[9px] text-slate-450">Click to run AI extraction simulation</span>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Merchant / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Hosting"
                  value={expMerchant}
                  onChange={(e) => setExpMerchant(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Expense Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="45.99"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  >
                    <option value="Hosting">Software & Hosting</option>
                    <option value="Meals">Meals & Catering</option>
                    <option value="Travel">Travel & Lodging</option>
                    <option value="Hardware">Hardware Equipment</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinanceSales;

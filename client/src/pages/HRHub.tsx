import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  UserCheck, 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  user_id: string;
  full_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const HRHub: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Annual Leave');

  // Policy Search
  const [searchQuery, setSearchQuery] = useState('');
  const [policyAnswers, setPolicyAnswers] = useState<any[]>([]);
  const [searchingPolicy, setSearchingPolicy] = useState(false);

  // Clock state
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);

  // Onboarding Checklist
  const [onboardingItems, setOnboardingItems] = useState([
    { id: 1, label: 'Sign offer letter and compliance contract', checked: true },
    { id: 2, label: 'Complete security awareness video modules', checked: true },
    { id: 3, label: 'Configure employee profile & set up Slack webhook keys', checked: false },
    { id: 4, label: 'Schedule introductory meeting with department lead', checked: false }
  ]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.business.leaves.list();
      setLeaves(res);
      setLoading(false);
    } catch (err: any) {
      addToast('Error', 'Failed to fetch leaves: ' + err.message, 'danger');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleClockToggle = () => {
    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockTime(new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
      addToast('Clocked In', 'Attendance log registered successfully.', 'success');
    } else {
      setIsClockedIn(false);
      setClockTime(null);
      addToast('Clocked Out', 'Good work today! Attendance session closed.', 'info');
    }
  };

  const handleOnboardingToggle = (id: number) => {
    setOnboardingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    addToast('Onboarding Updated', 'Roadmap checklist progress updated.', 'info');
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      addToast('Validation Error', 'All fields are required.', 'warning');
      return;
    }

    try {
      await api.business.leaves.create({
        start_date: startDate,
        end_date: endDate,
        reason,
        type: leaveType
      });
      addToast('Request Submitted', 'Your leave request has been submitted to the automation runner.', 'success');
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      loadLeaves();
    } catch (err: any) {
      addToast('Submission Failed', err.message, 'danger');
    }
  };

  const handleResolveLeave = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.business.leaves.resolve(id, status);
      addToast(`Leave ${status}`, `Leave request has been marked as ${status}.`, 'success');
      loadLeaves();
    } catch (err: any) {
      addToast('Resolve Failed', err.message, 'danger');
    }
  };

  const handlePolicySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      setSearchingPolicy(true);
      const res = await api.search(searchQuery);
      setPolicyAnswers(res);
      setSearchingPolicy(false);
    } catch (err: any) {
      addToast('Search Failed', err.message, 'danger');
      setSearchingPolicy(false);
    }
  };

  const leavesEntitlementUsed = leaves.filter(l => l.status === 'approved' && l.user_id === user?.id).length * 3; // Approx 3 days per leave
  const remainingLeaves = Math.max(0, 25 - leavesEntitlementUsed);

  // Determine if current user has HR / Admin / Manager rights
  const hasHRRights = user && ['Admin', 'HR', 'Manager'].includes(user.role);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl md:col-span-2" />
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
            <UserCheck className="h-6 w-6 text-brand-500" />
            <span>AI HR Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit leave requests, clock-in sessions, complete onboarding checklists, and query HR policy documents.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/10 transition-all hover:-translate-y-0.5 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Leave Balance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Leave</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {remainingLeaves} / 25 Days
            </p>
            <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(remainingLeaves / 25) * 100}%` }} 
              />
            </div>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Onboarding checklist widget */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Onboarding Progress</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {onboardingItems.filter(i => i.checked).length} / {onboardingItems.length} Done
            </p>
            <span className="text-[10px] text-brand-500 font-semibold mt-1 block">New Hire Checklist</span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        {/* Clock Session */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center md:col-span-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Logger</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-1">
              Status: {isClockedIn ? `Clocked In since ${clockTime}` : 'Offline'}
            </p>
            <span className="text-[9px] text-slate-400 mt-1 block">Time tracking reports are compiled directly to monthly invoice ledgers.</span>
          </div>
          <button
            onClick={handleClockToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isClockedIn 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
            }`}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Leaves Requests */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-500" />
              <span>Leave Request History & Approvals</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              {hasHRRights ? 'You have administrative rights to approve/reject company requests.' : 'Track the state of your requested leaves.'}
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {leaves.length === 0 ? (
              <p className="py-8 text-center text-slate-450 text-xs">No leave requests logged yet.</p>
            ) : (
              leaves.map(req => (
                <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-250">{req.full_name}</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded-full text-slate-500 uppercase">{req.type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Dates: {new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      " {req.reason} "
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status tag */}
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      req.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {req.status}
                    </span>

                    {/* HR approvals controls */}
                    {hasHRRights && req.status === 'pending' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleResolveLeave(req.id, 'approved')}
                          title="Approve Leave"
                          className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleResolveLeave(req.id, 'rejected')}
                          title="Reject Leave"
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Columns - Onboarding Checklist & Policy Q&A */}
        <div className="space-y-6">
          {/* Onboarding Checklist */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-brand-500" />
              <span>Employee Onboarding Roadmap</span>
            </h2>

            <div className="space-y-3.5">
              {onboardingItems.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleOnboardingToggle(item.id)}
                    className="h-4.5 w-4.5 mt-0.5 text-brand-500 rounded border-slate-300 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <span className={`text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed ${item.checked ? 'line-through opacity-40' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HR Policy assistant search RAG integration */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-brand-500" />
                <span>HR Policy Assistant</span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Ask queries about maternity, sick leave carry-over, or payment timelines.
              </p>
            </div>

            <form onSubmit={handlePolicySearch} className="relative">
              <input
                type="text"
                placeholder="Ask about carry-over rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/60 dark:bg-slate-900/50 pl-3 pr-10 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-450 hover:text-brand-500"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {searchingPolicy && (
              <div className="space-y-2 py-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse" />
              </div>
            )}

            {!searchingPolicy && policyAnswers.length > 0 && (
              <div className="p-3 bg-brand-500/5 rounded-2xl border border-brand-500/10 space-y-2">
                <span className="text-[8px] font-bold text-brand-500 flex items-center gap-0.5 uppercase">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Policy Match</span>
                </span>
                <p className="text-[10px] text-slate-700 dark:text-slate-350 leading-relaxed max-h-[120px] overflow-y-auto no-scrollbar">
                  {policyAnswers[0]?.snippet || 'Search returned no exact matching rules. Please rephrase.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Request modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl animate-scale-up">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-brand-500" />
              <span>Submit Leave Request</span>
            </h3>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Reason for Absence</label>
                <textarea
                  required
                  placeholder="e.g. Travel out of town / medical recovery"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-950/50 px-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200 resize-none"
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HRHub;

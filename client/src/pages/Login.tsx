import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Terminal, User, Shield, Briefcase, BarChart, FileText, Plus, ArrowLeft } from 'lucide-react';

const GoogleIcon: React.FC = () => (
  <svg className="h-5 w-5 mr-2.5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const Login: React.FC = () => {
  const { googleLogin } = useAuth();
  const { addToast } = useNotifications();

  const [showChooser, setShowChooser] = useState(false);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Employee');
  const [submitting, setSubmitting] = useState(false);

  // Seeded mock Google accounts list matching seed data
  const seededAccounts = [
    { email: 'admin@cloudpilot.ai', fullName: 'Sarah Connor', role: 'Admin', desc: 'System Administrator & Audit Logs', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { email: 'hr@cloudpilot.ai', fullName: 'John Doe', role: 'HR', desc: 'HR Operations & Leave Planner', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { email: 'manager@cloudpilot.ai', fullName: 'Alice Smith', role: 'Manager', desc: 'Team Lead & Workflow Approver', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { email: 'finance@cloudpilot.ai', fullName: 'Bob Miller', role: 'Finance', desc: 'Financial Records & Invoice Overseer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { email: 'employee@cloudpilot.ai', fullName: 'Jane Foster', role: 'Employee', desc: 'Submit Leaves & Upload Documents', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }
  ];

  const handleSelectAccount = async (account: typeof seededAccounts[0]) => {
    setSubmitting(true);
    try {
      await googleLogin({
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        avatarUrl: account.avatar
      });
      addToast('Google Sign In', `Welcome back, ${account.fullName}!`, 'success');
    } catch (err: any) {
      addToast('Sign In Failed', err.message || 'Error authenticating with Google.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Email Required', 'Please enter your Google email.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const name = fullName || email.split('@')[0];
      await googleLogin({
        email,
        fullName: name,
        role
      });
      addToast('Google Sign In', `Logged in successfully as ${name}.`, 'success');
    } catch (err: any) {
      addToast('Sign In Failed', err.message || 'Error logging in.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const baseClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ";
    switch (roleName) {
      case 'Admin': 
        return <span className={baseClass + "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20"}><Shield className="h-2.5 w-2.5" /> Admin</span>;
      case 'HR': 
        return <span className={baseClass + "bg-pink-500/10 text-pink-500 dark:bg-pink-500/20"}><User className="h-2.5 w-2.5" /> HR</span>;
      case 'Manager': 
        return <span className={baseClass + "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20"}><Briefcase className="h-2.5 w-2.5" /> Manager</span>;
      case 'Finance': 
        return <span className={baseClass + "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"}><BarChart className="h-2.5 w-2.5" /> Finance</span>;
      default: 
        return <span className={baseClass + "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20"}><FileText className="h-2.5 w-2.5" /> Employee</span>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      
      {/* Dynamic Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        
        {!showChooser ? (
          /* 1. Landing Screen showing Google Login Button */
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-gradient-to-tr from-brand-500 to-accent-500 p-4 rounded-3xl text-white shadow-xl shadow-brand-500/25">
              <Terminal className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Welcome to CloudPilot AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Connect your business workflows and launch autonomous agent copilots with Google Single Sign-On.
              </p>
            </div>

            <button
              onClick={() => setShowChooser(true)}
              className="w-full bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-5 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-md flex items-center justify-center hover:-translate-y-0.5 transition-all text-sm group"
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>
            
            <div className="text-[10px] text-slate-400 dark:text-slate-555 pt-4 border-t border-slate-100 dark:border-slate-800/60 w-full">
              Secured with Google Cloud Identity Services & JWT parameters.
            </div>
          </div>
        ) : (
          /* 2. Choose Google Account Dialog */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (useCustomAccount) {
                    setUseCustomAccount(false);
                  } else {
                    setShowChooser(false);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-650 dark:hover:text-slate-205 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Back"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {useCustomAccount ? 'Google Account Login' : 'Choose an account'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  to continue to CloudPilot Workspace
                </p>
              </div>
            </div>

            {useCustomAccount ? (
              /* Custom Account Inputs Form */
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block mb-1">Google Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="Sarah Connor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={submitting}
                    className="w-full bg-slate-100/60 dark:bg-slate-955/60 px-4 py-2.5 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-850 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block mb-1">Select Profile Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={submitting}
                    className="w-full bg-slate-100/60 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl text-xs border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-855 dark:text-slate-200"
                  >
                    <option value="Employee">Employee (View templates, logs)</option>
                    <option value="Admin">Admin (Access core operations)</option>
                    <option value="HR">HR (View leaves & team logbooks)</option>
                    <option value="Finance">Finance (Validate invoices & values)</option>
                    <option value="Manager">Manager (Review & approve steps)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 mt-6"
                >
                  {submitting ? 'Connecting...' : 'Sign In and Launch'}
                </button>
              </form>
            ) : (
              /* Pre-seeded Google Accounts Chooser */
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                {seededAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAccount(account)}
                    disabled={submitting}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-150/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 text-left transition-all hover:scale-[1.01] hover:border-brand-500/25"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={account.avatar} 
                        alt={account.fullName} 
                        className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 object-cover"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                          <span>{account.fullName}</span>
                          {getRoleBadge(account.role)}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{account.email}</div>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Add/Use Custom Account Option */}
                <button
                  onClick={() => setUseCustomAccount(true)}
                  disabled={submitting}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-transparent hover:border-brand-500/40 text-slate-505 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-[11px] font-bold">Use another account</div>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;

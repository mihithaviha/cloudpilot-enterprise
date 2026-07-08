import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Terminal, Lock, Mail, User, Building, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const { addToast } = useNotifications();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState('Employee');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !fullName)) {
      addToast('Validation Error', 'Please fill in all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          email,
          password,
          fullName,
          organizationName: orgName || 'Acme Corp',
          role
        });
        addToast('Welcome to CloudPilot!', 'Your account has been created successfully.', 'success');
      } else {
        await login({ email, password });
        addToast('Welcome Back', 'Logged in successfully.', 'success');
      }
    } catch (error: any) {
      addToast('Authentication Failed', error.message || 'Check your credentials.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-gradient-to-tr from-brand-500 to-accent-500 p-3 rounded-2xl text-white shadow-lg shadow-brand-500/20 mb-3">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {isRegister ? 'Create your account' : 'Sign in to CloudPilot'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {isRegister ? 'Get started with automated business agents.' : 'Enter your credentials to access your workspace.'}
          </p>
        </div>

        {/* Input fields form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Organization Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Acme Corp (Optional)"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-slate-100/60 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Demo Role Selector (Essential for Hackathon testing roles!) */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Select Profile Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-100/60 dark:bg-slate-900/50 px-4 py-2.5 rounded-xl text-sm border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
                >
                  <option value="Employee">Employee (Submit leaves, upload docs)</option>
                  <option value="Admin">Admin (Access audit logs, grant user roles)</option>
                  <option value="HR">HR (View logs, manage leave profiles)</option>
                  <option value="Finance">Finance (View revenue, signoff billing)</option>
                  <option value="Manager">Manager (Approve workflow requests)</option>
                </select>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@cloudpilot.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100/60 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100/60 dark:bg-slate-900/50 pl-10 pr-12 py-2.5 rounded-xl text-sm border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-6"
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Form Switch */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Seeding instruction helper for first run */}
        <div className="mt-8 pt-4 border-t border-slate-200/40 dark:border-slate-850/40 text-center">
          <p className="text-[10px] text-slate-400 leading-normal">
            💡 **Hackathon Quick Access:** <br />
            Sign in with email **admin@cloudpilot.ai** and password **password123** to inspect full seeded metrics immediately!
          </p>
        </div>

      </div>
    </div>
  );
};
export default Login;

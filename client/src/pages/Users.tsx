import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Lock, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const Users: React.FC = () => {
  const { addToast } = useNotifications();
  const { user: currentUser, updateUserRoleState } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.users.list();
      setUsers(usersRes);

      const auditsRes = await api.users.audits().catch(() => []);
      setAudits(auditsRes);
      
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load user management resources:', error);
      addToast('Access Denied', error.message || 'Permissions required.', 'danger');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.users.updateRole(userId, newRole);
      
      // Update local state list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      // If updating current logged in user, refresh their context
      if (currentUser && currentUser.id === userId) {
        updateUserRoleState(userId, newRole);
      }

      addToast('Role Updated', 'Permissions updated and saved in logs.', 'success');
      loadData(); // Reload audits to trace modification
    } catch (err: any) {
      addToast('Action Denied', err.message, 'danger');
    }
  };

  const validRoles = ['Employee', 'Manager', 'Finance', 'HR', 'Admin'];

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            User Management & Compliance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grant role permissions, audit security checkpoints, and monitor file compliance.
          </p>
        </div>
        <button
          onClick={loadData}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Database</span>
        </button>
      </div>

      {/* 1. User Profiles list panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
          <UsersIcon className="h-4.5 w-4.5 text-brand-500" />
          <span>Active Company Profiles</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="pb-3 pl-4">Full Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Organization</th>
                <th className="pb-3 pr-4">Access Role Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-3.5 pl-4 flex items-center gap-3">
                    <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{u.full_name}</span>
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="py-3.5 text-slate-550 dark:text-slate-400">{u.organization_name}</td>
                  <td className="py-3.5 pr-4">
                    {/* Role update toggle selector */}
                    <select
                      value={u.role}
                      disabled={currentUser?.role !== 'Admin'} // Restrict modification to admins
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-brand-500 text-slate-850 dark:text-slate-250 disabled:opacity-60"
                    >
                      {validRoles.map(roleOpt => (
                        <option key={roleOpt} value={roleOpt}>{roleOpt}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Security Audit Trails logs table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-4 flex items-center gap-1.5">
          <Terminal className="h-4.5 w-4.5 text-brand-500 animate-pulse" />
          <span>Active Audit Trails Compliance</span>
        </h3>
        
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="pb-3 pl-4">Timestamp</th>
                <th className="pb-3">Triggered By</th>
                <th className="pb-3">Action Checkpoint</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 pr-4">IP Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-[11px] font-mono text-slate-400">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs font-sans">No audit records.</td>
                </tr>
              ) : (
                audits.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 pl-4">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-3 text-slate-550 dark:text-slate-300 font-sans font-semibold">{log.user_email}</td>
                    <td className="py-3 text-brand-500 font-semibold">{log.action}</td>
                    <td className="py-3 uppercase">{log.target_type}</td>
                    <td className="py-3 pr-4">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default Users;

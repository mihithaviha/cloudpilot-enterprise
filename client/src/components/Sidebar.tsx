import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FolderKanban, 
  FileSignature, 
  Cpu, 
  BarChart3, 
  Users, 
  LogOut, 
  Terminal,
  Calendar,
  UserCheck,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'chat', label: 'AI Chat (RAG)', icon: MessageSquare, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'tasks', label: 'AI Tasks', icon: Calendar, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'hr', label: 'AI HR Hub', icon: UserCheck, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'finance', label: 'AI Finance & Sales', icon: TrendingUp, roles: ['Admin', 'HR', 'Finance', 'Manager'] },
    { id: 'knowledge', label: 'Knowledge Base', icon: FolderKanban, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'generator', label: 'AI Doc Generator', icon: FileSignature, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'workflows', label: 'Workflow Automations', icon: Cpu, roles: ['Admin', 'HR', 'Employee', 'Finance', 'Manager'] },
    { id: 'analytics', label: 'Analytics Insights', icon: BarChart3, roles: ['Admin', 'HR', 'Finance', 'Manager'] },
    { id: 'users', label: 'User & Audits', icon: Users, roles: ['Admin', 'HR'] }
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/60 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="bg-gradient-to-tr from-brand-500 to-accent-500 p-2 rounded-xl text-white shadow-md shadow-brand-500/10">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-400">
              CloudPilot AI
            </h1>
            <span className="text-[10px] text-slate-400 tracking-wider font-semibold">CO-WORKER AGENT</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer bar */}
      {user && (
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none mb-1 text-slate-800 dark:text-slate-200">
                {user.full_name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {user.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {user.organization_name}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;

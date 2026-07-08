import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/ToastContainer';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Page Imports
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { DocGen } from './pages/DocGen';
import { Workflows } from './pages/Workflows';
import { Analytics } from './pages/Analytics';
import { Users } from './pages/Users';
import { Tasks } from './pages/Tasks';
import { HRHub } from './pages/HRHub';
import { FinanceSales } from './pages/FinanceSales';

const MainApp: React.FC = () => {
  const { token, loading, user } = useAuth();
  
  // Navigation states: 'landing' | 'login' | dashboard active tabs
  const [viewState, setViewState] = useState<'landing' | 'login' | 'dashboard'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'Admin':
          setActiveTab('users');
          break;
        case 'HR':
          setActiveTab('hr');
          break;
        case 'Finance':
          setActiveTab('finance');
          break;
        case 'Manager':
          setActiveTab('workflows');
          break;
        case 'Employee':
          setActiveTab('tasks');
          break;
        default:
          setActiveTab('dashboard');
      }
    }
  }, [user]);

  // Loading skeleton while verifying JWT
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="h-10 w-10 border-4 border-t-brand-500 border-slate-800 rounded-full animate-spin" />
        <span className="text-xs text-slate-450 mt-4 tracking-widest font-semibold">INITIALIZING CLOUDPILOT...</span>
      </div>
    );
  }

  // 1. Logged Out Flow
  if (!token) {
    if (viewState === 'landing') {
      return <Landing onStart={() => setViewState('login')} />;
    }
    return (
      <div className="relative">
        <button
          onClick={() => setViewState('landing')}
          className="absolute top-5 left-5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 px-3 py-1.5 rounded-lg z-50 font-bold transition-all"
        >
          ← Back to Site
        </button>
        <Login />
      </div>
    );
  }

  // 2. Logged In Workspace
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Navigation */}
        <Navbar setActiveTab={setActiveTab} />

        {/* Tab view rendering */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'knowledge' && <KnowledgeBase />}
          {activeTab === 'generator' && <DocGen />}
          {activeTab === 'workflows' && <Workflows />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'tasks' && <Tasks />}
          {activeTab === 'hr' && <HRHub />}
          {activeTab === 'finance' && <FinanceSales />}
        </main>
      </div>

      {/* Toast Alert Prompt Overlay */}
      <ToastContainer />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;

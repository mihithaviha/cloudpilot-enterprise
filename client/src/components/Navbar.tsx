import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../utils/api';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Check, 
  Trash2, 
  Sparkles,
  FileText,
  DollarSign,
  CheckSquare
} from 'lucide-react';

interface NavbarProps {
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveTab }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  // Close search results and notification drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run autocomplete search query
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await api.search(searchQuery);
          setSearchResults(res);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Smart search failed:', error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchItemClick = (item: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    // Determine target page
    if (item.type === 'document') {
      setActiveTab('knowledge');
    } else if (item.type === 'invoice') {
      setActiveTab('analytics');
    } else if (item.type === 'task') {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="h-16 px-8 border-b border-slate-200/60 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
      
      {/* 1. Natural Language Smart Search Bar */}
      <div ref={searchRef} className="relative w-96">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Type 'leave policy' or 'Stripe invoice'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length > 1 && setShowSearchResults(true)}
            className="w-full bg-slate-100/80 dark:bg-slate-800/50 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-12 left-0 w-full glass-panel rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-500" />
              <span>Smart Matches</span>
            </p>
            <div className="mt-1 space-y-0.5">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearchItemClick(item)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-500">
                    {item.type === 'document' && <FileText className="h-3.5 w-3.5" />}
                    {item.type === 'invoice' && <DollarSign className="h-3.5 w-3.5" />}
                    {item.type === 'task' && <CheckSquare className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-500 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Right Side Buttons (Theme, Notifications) */}
      <div className="flex items-center gap-4">
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Dropdown Bell */}
        <div ref={notifyRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alert Center</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-brand-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No new alerts to show.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-left transition-colors ${
                        n.is_read ? 'bg-transparent' : 'bg-brand-500/5 dark:bg-brand-500/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-xs font-bold ${
                          n.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-brand-600 dark:text-brand-400'
                        }`}>
                          {n.title}
                        </p>
                        <div className="flex gap-1">
                          {!n.is_read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="text-slate-400 hover:text-emerald-500 transition-colors p-0.5"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 block mt-1">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};
export default Navbar;

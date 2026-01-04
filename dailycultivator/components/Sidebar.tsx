
import React from 'react';
import { View, ThemeMode, AppUser } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  appName: string;
  logoUrl?: string;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  streak: number;
  user: AppUser;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, appName, logoUrl, themeMode, onThemeChange, streak, user, onLogout }) => {
  const menuItems = [
    { id: 'habits', icon: 'fa-calendar-check', label: 'Habits' },
    { id: 'journal', icon: 'fa-book-open', label: 'Journal' },
    { id: 'tasks', icon: 'fa-list-check', label: 'Tasks' },
    { id: 'chat', icon: 'fa-robot', label: 'AI Coach' },
    { id: 'community', icon: 'fa-people-pulling', label: 'Community' },
    ...(user.role === 'admin' || user.role === 'super-admin' ? [{ id: 'admin', icon: 'fa-gears', label: 'Admin Panel' }] : []),
  ];

  const themes: { id: ThemeMode; icon: string; label: string }[] = [
    { id: 'light', icon: 'fa-sun', label: 'Light' },
    { id: 'dark', icon: 'fa-moon', label: 'Dark' },
    { id: 'system', icon: 'fa-desktop', label: 'System' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-[var(--surface-color)] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-sm transition-all duration-300 z-50">
      <div className="p-6 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-[var(--primary-color)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 overflow-hidden">
          {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <i className="fa-solid fa-seedling text-xl text-white"></i>}
        </div>
        <span className="hidden md:block font-black text-xl text-[var(--text-color)] truncate tracking-tight">{appName}</span>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id
                ? 'bg-[var(--primary-color)] text-white font-bold shadow-md shadow-primary/20 scale-[1.02]'
                : 'text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[var(--text-color)]'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center text-lg ${activeView === item.id ? 'text-white' : ''}`}></i>
            <span className="hidden md:block font-semibold tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
        <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex items-center justify-around">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                themeMode === t.id
                  ? 'bg-white dark:bg-gray-800 text-[var(--primary-color)] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`fa-solid ${t.icon} text-sm`}></i>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
           <div className="flex justify-between items-center mb-1 px-1">
             <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Streak</span>
             <span className="text-xs font-black text-[var(--text-color)]">{streak}d</span>
           </div>
           <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary-color)] rounded-full transition-all duration-500" style={{ width: `${Math.min(streak * 10, 100)}%` }}></div>
           </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold"
        >
          <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
          <span className="hidden md:block text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

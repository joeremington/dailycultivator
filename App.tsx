
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, JournalEntry, Task, View, AppSettings, AppUser, TierType, GlobalStats } from './types';
import HabitTracker from './components/HabitTracker';
import Journal from './components/Journal';
import TaskManager from './components/TaskManager';
import AIChat from './components/AIChat';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import PricingPage from './components/PricingPage';
import PrivacySettings from './components/PrivacySettings';
import CommunityView from './components/CommunityView';
import { upgradeTier, getGlobalStats } from './services/tierService';
import { logout } from './services/authService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('dc_auth') === 'true');
  const [activeView, setActiveView] = useState<View>('habits');
  // Secret state to show admin login only if URL has ?portal=admin
  const [showAdminEntry, setShowAdminEntry] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admin') {
      setShowAdminEntry(true);
    }
  }, []);
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('dc_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('dc_journal');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('dc_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [user, setUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('dc_user');
    if (saved) return JSON.parse(saved);
    return {
      id: 'guest',
      email: '',
      displayName: 'Guest Cultivator',
      role: 'user',
      tier: 'cultivator',
      memberNumber: null,
      masterNumber: null,
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
      isActive: true,
      stats: { habitsTracked: 0, journalEntries: 0, tasksCompleted: 0 },
      usage: { habitsCount: 0, tasksCount: 0, journalEntriesCount: 0, aiRequestsToday: 0, lastAiRequestReset: new Date().toISOString() },
      privacy: {
        profileVisibility: 'private',
        showMemberNumber: false,
        showStreak: false,
        showDonationTotal: false,
        showOnMemberMap: false,
        allowLeaderboards: false,
        allowDirectMessages: false,
        showAchievements: false,
        anonymousStats: false,
      },
      publicProfile: {
        displayName: 'Guest',
        memberNumber: null,
        tier: 'cultivator',
        memberSince: new Date().toISOString(),
        country: 'USA',
        currentStreak: null,
        totalDonated: null,
        bio: null,
      },
      adminNotes: ''
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('dc_settings');
    if (saved) return JSON.parse(saved);
    return {
      appName: 'DailyCultivator',
      logoUrl: '',
      themeMode: 'system',
      branding: {
        light: { primary: '#2e7f4f', secondary: '#facc15', background: '#f9fafb', surface: '#ffffff', text: '#111827', textMuted: '#6b7280' },
        dark: { primary: '#4ade80', secondary: '#fbbf24', background: '#132243', surface: '#1a2c5a', text: '#f1f1f1', textMuted: '#94a3b8' }
      },
      pricing: { 
        tiers: [
          { id: 'cultivator', name: 'Cultivator', price: 0, billingPeriod: 'monthly', displayOrder: 1, badge: '🌱', identity: { title: "I'm curious", tagline: "Start your journey" }, limits: { maxHabits: 5, maxTasks: 20, maxJournalEntries: 30, aiRequestsPerDay: 10 }, features: ["5 habits", "20 tasks", "AI Coach"] },
          { id: 'daily', name: 'Daily Cultivator', price: 999, billingPeriod: 'monthly', displayOrder: 2, isPopular: true, badge: '🌿', identity: { title: "I cultivate daily", tagline: "Join the movement" }, limits: { maxHabits: -1, maxTasks: -1, maxJournalEntries: -1, aiRequestsPerDay: 100 }, features: ["Unlimited everything", "Weekly reports"] },
          { id: 'master', name: 'Master Cultivator', price: 2999, billingPeriod: 'monthly', displayOrder: 3, badge: '🌳', identity: { title: "I am a Master", tagline: "Lead the movement" }, limits: { maxHabits: -1, maxTasks: -1, maxJournalEntries: -1, aiRequestsPerDay: -1 }, features: ["$1 Donation", "Coaching calls"] }
        ]
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('dc_habits', JSON.stringify(habits));
    localStorage.setItem('dc_journal', JSON.stringify(journalEntries));
    localStorage.setItem('dc_tasks', JSON.stringify(tasks));
    localStorage.setItem('dc_user', JSON.stringify(user));
    localStorage.setItem('dc_settings', JSON.stringify(settings));
    localStorage.setItem('dc_auth', isAuthenticated.toString());
  }, [habits, journalEntries, tasks, user, settings, isAuthenticated]);

  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.streak), 0);
  }, [habits]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.themeMode === 'dark' || (settings.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const colors = isDark ? settings.branding.dark : settings.branding.light;
    
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--surface-color', colors.surface);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--text-muted', colors.textMuted);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.themeMode, settings.branding]);

  const handleUpgrade = (tierId: TierType) => {
    const { user: upgradedUser, message } = upgradeTier(user, tierId);
    setUser(upgradedUser);
    setActiveView('habits');
    alert(message);
  };

  const handleLogin = (role: 'user' | 'admin') => {
    setUser(prev => ({ ...prev, id: 'user_' + Date.now(), role, displayName: role === 'admin' ? 'Admin Master' : 'Cultivator' }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    localStorage.removeItem('dc_auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-[var(--primary-color)] rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-primary/30">
             {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-contain" /> : <i className="fa-solid fa-seedling text-4xl text-white"></i>}
           </div>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">{settings.appName}</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">
             An intelligent space for your habits, journals, and strategic tasks.
           </p>
           <div className="space-y-3">
             <button 
               onClick={() => handleLogin('user')}
               className="w-full py-4 bg-[#2e7f4f] text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
             >
               <i className="fa-brands fa-google"></i>
               Sign In with Google
             </button>
             
             {/* Hidden Staff Portal Link: Only visible if ?portal=admin is in URL */}
             {showAdminEntry && (
                <button 
                  onClick={() => handleLogin('admin')}
                  className="w-full py-3 mt-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest border border-dashed border-gray-300 dark:border-gray-600"
                >
                  <i className="fa-solid fa-user-shield"></i>
                  Authorized Staff Access
                </button>
             )}
           </div>
           <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Everything is Private by Default</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300 overflow-hidden">
      <Sidebar 
        activeView={activeView} onViewChange={setActiveView} 
        appName={settings.appName} logoUrl={settings.logoUrl}
        themeMode={settings.themeMode} onThemeChange={(mode) => setSettings(s => ({...s, themeMode: mode}))}
        streak={currentStreak}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text-color)]">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest">{user.tier} Plan</span>
                {user.memberNumber && <span className="text-[10px] bg-[var(--primary-color)] text-white px-2 py-0.5 rounded font-black tracking-widest">#{user.memberNumber}</span>}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveView('settings')} className="w-10 h-10 bg-[var(--surface-color)] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-primary transition-all shadow-sm">
                 <i className="fa-solid fa-gear"></i>
              </button>
              <button onClick={() => setActiveView('pricing')} className="px-5 py-2.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20 hover:bg-primary/20 transition-all">My Account</button>
            </div>
          </header>

          <div className="transition-all duration-300">
            {activeView === 'habits' && <HabitTracker habits={habits} onUpdate={setHabits} user={user} onUserUpdate={setUser} onNavigateToPricing={() => setActiveView('pricing')} />}
            {activeView === 'journal' && <Journal entries={journalEntries} onUpdate={setJournalEntries} user={user} onUserUpdate={setUser} onNavigateToPricing={() => setActiveView('pricing')} />}
            {activeView === 'tasks' && <TaskManager tasks={tasks} onUpdate={setTasks} user={user} onUserUpdate={setUser} onNavigateToPricing={() => setActiveView('pricing')} />}
            {activeView === 'chat' && <AIChat habits={habits} journalEntries={journalEntries} user={user} onUserUpdate={setUser} onNavigateToPricing={() => setActiveView('pricing')} />}
            {activeView === 'community' && <CommunityView currentUser={user} />}
            {activeView === 'settings' && <PrivacySettings user={user} onUpdate={(u) => setUser({...user, privacy: {...user.privacy, ...u}})} />}
            {activeView === 'admin' && user.role === 'admin' && <AdminPanel settings={settings} onUpdate={setSettings} />}
            {activeView === 'pricing' && <PricingPage tiers={settings.pricing.tiers} currentUser={user} onUpgrade={handleUpgrade} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

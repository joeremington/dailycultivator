
import React, { useState, useEffect } from 'react';
import { Habit, AppUser } from '../types';
import { generateHabitCoach, speakAffirmation } from '../services/geminiService';
import { checkTierLimit } from '../services/tierService';

interface HabitTrackerProps {
  habits: Habit[];
  onUpdate: (habits: Habit[]) => void;
  user: AppUser;
  onUserUpdate: (user: AppUser) => void;
  onNavigateToPricing: () => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onUpdate, user, onUserUpdate, onNavigateToPricing }) => {
  const [coachMsg, setCoachMsg] = useState<string>('');
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const refreshCoach = async () => {
    const aiCheck = checkTierLimit(user, 'aiRequestsPerDay');
    if (!aiCheck.allowed) {
      alert(`AI limit reached for your ${user.tier} tier. Upgrade for more.`);
      onNavigateToPricing();
      return;
    }

    if (habits.length === 0) return;
    setLoadingCoach(true);
    try {
      const msg = await generateHabitCoach(habits);
      setCoachMsg(msg || "Keep going! You're doing great.");
      onUserUpdate({
        ...user,
        usage: { ...user.usage, aiRequestsToday: user.usage.aiRequestsToday + 1 }
      });
    } catch (e) {
      setCoachMsg("Focus on consistency today. Every small step counts.");
    }
    setLoadingCoach(false);
  };

  useEffect(() => {
    if (habits.length > 0 && !coachMsg) {
      refreshCoach();
    }
  }, []);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const limitCheck = checkTierLimit(user, 'maxHabits');
    if (!limitCheck.allowed) {
      alert(`Limit reached! Your ${user.tier} tier allows max ${limitCheck.max} habits.`);
      onNavigateToPricing();
      return;
    }

    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newHabitName,
      streak: 0,
      completions: [],
    };
    
    onUpdate([...habits, newHabit]);
    onUserUpdate({
      ...user,
      usage: { ...user.usage, habitsCount: (user.usage.habitsCount || 0) + 1 }
    });
    setNewHabitName('');
  };

  const toggleHabit = (id: string) => {
    onUpdate(habits.map(h => {
      if (h.id === id) {
        const hasCompletedToday = h.completions.includes(todayStr);
        const newCompletions = hasCompletedToday 
          ? h.completions.filter(d => d !== todayStr)
          : [...h.completions, todayStr];
        
        const newStreak = hasCompletedToday ? Math.max(0, h.streak - 1) : h.streak + 1;
        
        return { ...h, completions: newCompletions, streak: newStreak };
      }
      return h;
    }));
  };

  const handleSpeak = async () => {
    if (!coachMsg || isSpeaking) return;
    setIsSpeaking(true);
    await speakAffirmation(coachMsg);
    setIsSpeaking(false);
  };

  const renderFormattedMsg = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/);
      return (
        <div key={i} className="mb-2">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-primary font-black">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--surface-color)] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        <div className="p-10 bg-primary/5 dark:bg-primary/20 md:w-1/3 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-[var(--surface-color)] rounded-[2rem] flex items-center justify-center text-primary shadow-2xl shadow-primary/20 mb-6 group transition-transform hover:rotate-6 hover:scale-110 border border-primary/10">
             <i className="fa-solid fa-wand-magic-sparkles text-4xl"></i>
          </div>
          <h3 className="font-black text-[var(--text-color)] text-xl tracking-tight">Growth Coach</h3>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2 opacity-80">AI Insight Engine</p>
        </div>
        <div className="p-10 md:w-2/3 flex flex-col justify-between">
          <div className="relative">
            <i className="fa-solid fa-quote-left absolute -top-6 -left-4 text-primary opacity-10 text-6xl"></i>
            {loadingCoach ? (
              <div className="space-y-4 animate-pulse pt-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-full"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-5/6"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-4/6"></div>
              </div>
            ) : (
              <div className="text-[var(--text-color)] leading-relaxed text-sm md:text-base font-medium pt-2 pl-4 max-w-prose">
                {coachMsg ? renderFormattedMsg(coachMsg) : "Start tracking your habits to receive personalized encouragement and pattern analysis from your AI Growth Coach."}
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={refreshCoach} 
              disabled={loadingCoach}
              className="text-[10px] font-black px-6 py-3 border border-primary/20 dark:border-primary/40 text-primary rounded-2xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-all uppercase tracking-[0.1em] disabled:opacity-50"
            >
              Analyze Trends
            </button>
            <button 
              onClick={handleSpeak} 
              disabled={!coachMsg || isSpeaking} 
              className={`text-[10px] font-black px-6 py-3 bg-primary text-white rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 uppercase tracking-[0.1em] shadow-lg disabled:opacity-50 ${isSpeaking ? 'animate-pulse' : ''}`}
            >
              <i className={`fa-solid ${isSpeaking ? 'fa-spinner animate-spin' : 'fa-volume-high'}`}></i> 
              {isSpeaking ? 'Playing...' : 'Play Insight'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--surface-color)] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg flex flex-col justify-center transition-colors">
          <form onSubmit={addHabit} className="space-y-5">
            <div className="flex items-center gap-3 mb-1 px-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h4 className="font-black text-[var(--text-color)] tracking-tight uppercase text-xs opacity-60">Add New Habit</h4>
            </div>
            <input 
              type="text" 
              placeholder="e.g. 30m Meditation" 
              value={newHabitName} 
              onChange={(e) => setNewHabitName(e.target.value)} 
              className="w-full px-6 py-4 bg-[var(--bg-color)] border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:outline-none text-[var(--text-color)] transition-all placeholder:text-[var(--text-muted)] font-medium" 
            />
            <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
              <i className="fa-solid fa-plus"></i> Begin Tracking
            </button>
          </form>
        </div>

        {habits.map((habit) => {
          const isDone = habit.completions.includes(todayStr);
          return (
            <div key={habit.id} className="bg-[var(--surface-color)] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg group hover:border-primary/40 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h4 className="font-black text-[var(--text-color)] text-lg group-hover:text-primary transition-colors tracking-tight leading-tight">{habit.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">{habit.streak} Day Streak</p>
                  </div>
                </div>
                <button onClick={() => toggleHabit(habit.id)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${isDone ? 'bg-green-500 text-white shadow-green-200 scale-110' : 'bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary'}`}>
                  <i className={`fa-solid ${isDone ? 'fa-check text-xl' : 'fa-plus text-xl'}`}></i>
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                 <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Persistence</span>
                 <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (habit.streak % 6) ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                   ))}
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitTracker;

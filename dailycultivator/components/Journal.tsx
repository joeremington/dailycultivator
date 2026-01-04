
import React, { useState, useEffect } from 'react';
import { JournalEntry, AppUser } from '../types';
import { generateJournalPrompt } from '../services/geminiService';
import { checkTierLimit } from '../services/tierService';

interface JournalProps {
  entries: JournalEntry[];
  onUpdate: (entries: JournalEntry[]) => void;
  user: AppUser;
  onUserUpdate: (user: AppUser) => void;
  onNavigateToPricing: () => void;
}

const Journal: React.FC<JournalProps> = ({ entries, onUpdate, user, onUserUpdate, onNavigateToPricing }) => {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!currentPrompt) getNewPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNewPrompt = async () => {
    const aiCheck = checkTierLimit(user, 'aiRequestsPerDay');
    if (!aiCheck.allowed) {
      alert(`AI limit reached for your ${user.tier} tier. Upgrade for more.`);
      onNavigateToPricing();
      return;
    }

    setIsGenerating(true);
    try {
      const p = await generateJournalPrompt(entries.slice(-3));
      setCurrentPrompt(p || "What is one strategic objective you can advance today?");
      onUserUpdate({
        ...user,
        usage: { ...user.usage, aiRequestsToday: user.usage.aiRequestsToday + 1 }
      });
    } catch (e) {
      setCurrentPrompt("What was the primary driver of your productivity today?");
    }
    setIsGenerating(false);
  };

  const saveEntry = () => {
    if (!content.trim()) return;

    const limitCheck = checkTierLimit(user, 'maxJournalEntries');
    if (!limitCheck.allowed) {
      alert(`Limit reached! Your ${user.tier} tier allows max ${limitCheck.max} entries.`);
      onNavigateToPricing();
      return;
    }

    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      prompt: currentPrompt,
      content,
    };
    onUpdate([newEntry, ...entries]);
    onUserUpdate({
      ...user,
      usage: { ...user.usage, journalEntriesCount: (user.usage.journalEntriesCount || 0) + 1 }
    });
    setContent('');
    getNewPrompt();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-[var(--surface-color)] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl p-8 relative overflow-hidden transition-colors">
          <div className="flex justify-between items-center mb-6 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <i className="fa-solid fa-pen-nib"></i>
               </div>
               <h3 className="font-black text-[var(--text-color)] text-lg tracking-tight">Daily Strategic Reflection</h3>
             </div>
             <button 
              onClick={getNewPrompt}
              className="text-[10px] bg-[var(--bg-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-full hover:text-primary dark:hover:text-primary hover:bg-primary/5 transition-all font-black uppercase tracking-widest flex items-center gap-2 border border-transparent dark:border-gray-800"
             >
                <i className={`fa-solid fa-arrows-rotate ${isGenerating ? 'animate-spin' : ''}`}></i>
                Analyze Context & Prompt
             </button>
          </div>
          
          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10 dark:border-primary/20 mb-6 relative group">
            <p className="text-[var(--text-color)] font-bold leading-relaxed text-lg">
              {isGenerating ? "Analyzing patterns for next reflection..." : (currentPrompt || "What high-leverage action did you take today?")}
            </p>
            <div className="absolute top-2 right-2 opacity-10">
              <i className="fa-solid fa-microchip text-3xl text-primary"></i>
            </div>
          </div>

          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Document your observations, blockers, and wins..."
            className="w-full h-64 p-6 bg-[var(--bg-color)] border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all resize-none text-[var(--text-color)] text-lg leading-relaxed placeholder:text-[var(--text-muted)]"
          ></textarea>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={saveEntry}
              className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 uppercase tracking-widest text-sm"
            >
              Archive Reflection
              <i className="fa-solid fa-check"></i>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-[var(--text-color)] px-2 text-xl tracking-tight">Growth Archive</h3>
          {entries.length === 0 && (
             <div className="bg-[var(--surface-color)] p-12 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700 text-center flex flex-col items-center justify-center transition-colors">
                <i className="fa-solid fa-layer-group text-4xl text-[var(--text-muted)] opacity-20 mb-4"></i>
                <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">No entries recorded yet.</p>
             </div>
          )}
          {entries.map(entry => (
            <div key={entry.id} className="bg-[var(--surface-color)] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg group hover:border-primary/20 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full">{entry.date}</span>
              </div>
              <p className="text-sm font-black text-[var(--text-muted)] mb-3 italic">"{entry.prompt}"</p>
              <p className="text-[var(--text-color)] leading-relaxed font-medium text-lg">{entry.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
         <div className="bg-gray-900 dark:bg-black rounded-[2rem] p-8 text-white shadow-2xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-black mb-8 flex items-center gap-3 text-lg tracking-widest uppercase">
                 <i className="fa-solid fa-chart-line text-primary"></i>
                 Performance Data
              </h4>
              <div className="space-y-8">
                 <div className="group">
                    <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                       <span>Reflection Consistency</span>
                       <span className="text-primary">85%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(46,127,79,0.5)] transition-all duration-1000" style={{ width: '85%' }}></div>
                    </div>
                 </div>
                 <div className="group">
                    <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                       <span>Focus Alignment</span>
                       <span className="text-primary">72%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-primary/70 rounded-full transition-all duration-1000" style={{ width: '72%' }}></div>
                    </div>
                 </div>
              </div>
              <div className="mt-12 bg-white/5 p-6 rounded-2xl border border-white/5">
                 <p className="text-xs text-gray-400 leading-relaxed font-medium">
                   "Archive data suggests focus is trending toward 'Scalable Systems' and 'Routine Automation' based on keyword density in recent logs."
                 </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
         </div>
      </div>
    </div>
  );
};

export default Journal;

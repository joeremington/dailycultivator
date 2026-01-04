
import React, { useState } from 'react';
import { AppUser, TierType } from '../types';

interface UserDetailsModalProps {
  user: AppUser;
  onClose: () => void;
  onUpdate: (userId: string, updates: Partial<AppUser>) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onUpdate }) => {
  const [notes, setNotes] = useState(user.adminNotes);

  const tierStyles = {
    cultivator: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    daily: 'bg-primary/10 text-primary border border-primary/20',
    master: 'bg-primary text-white shadow-lg shadow-primary/20'
  };

  const handleCycleTier = () => {
    const validTiers: TierType[] = ['cultivator', 'daily', 'master'];
    const currentIndex = validTiers.indexOf(user.tier);
    const nextTier = validTiers[(currentIndex + 1) % validTiers.length];
    
    onUpdate(user.id, { 
      tier: nextTier,
      memberNumber: nextTier !== 'cultivator' ? (user.memberNumber || Math.floor(1000 + Math.random() * 9000)) : null,
      masterNumber: nextTier === 'master' ? (user.masterNumber || Math.floor(1 + Math.random() * 99)) : null
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/20">
              {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-2xl" /> : user.displayName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-[var(--text-color)] tracking-tight">{user.displayName}</h2>
                {user.isBetaUser && <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black uppercase rounded">Beta</span>}
              </div>
              <p className="text-muted font-medium text-sm">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tierStyles[user.tier]}`}>
                  {user.tier}
                </span>
                {!user.isActive && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Suspended</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-muted transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {/* Stats */}
          <section>
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Cultivation Activity</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Habits', value: user.stats.habitsTracked, icon: 'fa-calendar-check', color: 'text-primary' },
                { label: 'Journals', value: user.stats.journalEntries, icon: 'fa-book-open', color: 'text-primary' },
                { label: 'Tasks', value: user.stats.tasksCompleted, icon: 'fa-list-check', color: 'text-primary' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <i className={`fa-solid ${stat.icon} ${stat.color} mb-2 opacity-50`}></i>
                  <div className="text-2xl font-black text-[var(--text-color)]">{stat.value}</div>
                  <div className="text-[10px] font-black text-muted uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Member Since</h4>
              <p className="font-bold text-[var(--text-color)]">{user.createdAt}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Member Number</h4>
              <p className="font-mono font-black text-primary">#{user.memberNumber || 'N/A'}</p>
            </div>
          </section>

          {/* Internal Notes */}
          <section>
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Internal Admin Notes</h3>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal log or notes..."
              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none text-[var(--text-color)] transition-all resize-none text-sm font-medium"
            ></textarea>
            <button 
              onClick={() => {
                onUpdate(user.id, { adminNotes: notes });
                alert('Notes saved.');
              }}
              className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-70"
            >
              <i className="fa-solid fa-save"></i> Save Notes
            </button>
          </section>
        </div>

        {/* Actions */}
        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button 
            onClick={() => onUpdate(user.id, { isActive: !user.isActive })}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              user.isActive 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
            }`}
          >
            {user.isActive ? 'Suspend Access' : 'Restore Access'}
          </button>
          <button 
            onClick={handleCycleTier}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Cycle Tier
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

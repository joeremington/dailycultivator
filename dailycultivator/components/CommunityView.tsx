
import React, { useMemo } from 'react';
import { AppUser } from '../types';
import { getGlobalStats } from '../services/tierService';

interface CommunityViewProps {
  currentUser: AppUser;
}

const CommunityView: React.FC<CommunityViewProps> = ({ currentUser }) => {
  const stats = useMemo(() => getGlobalStats(), []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Community Stats Banner */}
      <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] text-center">
        <h2 className="text-3xl font-black text-[var(--text-color)] mb-4 tracking-tight">
          Join {stats.totalMembers.toLocaleString()} Daily Cultivators
        </h2>
        <p className="text-sm text-[var(--text-muted)] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
          Together we've donated 
          <span className="text-primary font-black ml-1 text-lg">${stats.totalDonated.toLocaleString()}</span> to fight human trafficking.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-[var(--surface-color)] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-2xl font-black text-primary">{stats.activeDailyCultivators.toLocaleString()}</div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Daily Cultivators</div>
          </div>
          <div className="bg-[var(--surface-color)] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-2xl font-black text-[var(--text-color)]">{stats.activeMasterCultivators.toLocaleString()}</div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Master Cultivators</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-950 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden h-[400px]">
        <div className="relative z-10 flex flex-col items-center text-center">
          <h3 className="text-white font-black text-2xl tracking-tight mb-2">Member Map</h3>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">Pins appear at country-level only</p>
          
          {/* Mock Map Visual */}
          <div className="relative w-full max-w-2xl h-48 opacity-40">
            <div className="absolute top-10 left-20 w-3 h-3 bg-primary rounded-full blur-[2px] animate-pulse"></div>
            <div className="absolute top-32 left-40 w-2 h-2 bg-primary rounded-full blur-[1px] animate-pulse [animation-delay:0.5s]"></div>
            <div className="absolute top-20 left-80 w-3 h-3 bg-primary rounded-full blur-[2px] animate-pulse [animation-delay:1.2s]"></div>
            <div className="absolute top-40 left-[90%] w-2 h-2 bg-primary rounded-full blur-[1px] animate-pulse [animation-delay:0.8s]"></div>
          </div>

          <div className="mt-auto">
            {!currentUser.privacy.showOnMemberMap ? (
              <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <i className="fa-solid fa-location-dot text-primary"></i>
                <p className="text-xs text-white/70 font-medium">Your pin is hidden. Opt-in to show your country on the map.</p>
              </div>
            ) : (
              <div className="bg-primary/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-primary/40 flex items-center gap-4">
                <i className="fa-solid fa-location-dot text-primary"></i>
                <p className="text-xs text-white/90 font-medium">You are visible on the map as a Cultivator from {currentUser.publicProfile.country}.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[var(--surface-color)] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h4 className="font-black text-lg">Streak Leaderboard</h4>
            <i className="fa-solid fa-trophy text-amber-500"></i>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            {[
              { name: 'Cultivator #1294', streak: 452, tier: 'master' },
              { name: 'Sarah Connor', streak: 310, tier: 'master' },
              { name: 'Cultivator #882', streak: 215, tier: 'daily' },
              { name: 'Daily Cultivator', streak: 120, tier: 'daily' },
            ].map((lead, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black opacity-20 w-4">{i+1}</span>
                  <div>
                    <div className="text-sm font-black">{lead.name}</div>
                    <div className="text-[9px] uppercase font-bold text-primary tracking-widest">{lead.tier}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[var(--text-color)]">{lead.streak}</span>
                  <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Days</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-950/50 text-center">
             <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Only showing opted-in profiles</p>
          </div>
        </section>

        <section className="bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 p-8 flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mb-6">
              <i className="fa-solid fa-share-nodes text-2xl"></i>
           </div>
           <h4 className="font-black text-xl mb-2">Private Achievement Cards</h4>
           <p className="text-sm text-[var(--text-muted)] font-medium max-w-xs mb-8">
             Generate a card with your badges and member number. Specific habits are never included.
           </p>
           <button className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
             Generate Card
           </button>
        </section>
      </div>
    </div>
  );
};

export default CommunityView;

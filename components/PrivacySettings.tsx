
import React from 'react';
import { AppUser, VisibilityType } from '../types';

interface PrivacySettingsProps {
  user: AppUser;
  onUpdate: (updates: Partial<AppUser['privacy']>) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ user, onUpdate }) => {
  const { privacy } = user;

  const visibilityOptions: { id: VisibilityType; title: string; desc: string; icon: string }[] = [
    { id: 'private', title: 'Private (Default)', desc: 'Your profile is completely hidden. Only you see your data.', icon: 'fa-shield-halved' },
    { id: 'anonymous', title: 'Anonymous', desc: 'Show member number and tier badge only. No personal info.', icon: 'fa-user-secret' },
    { id: 'public', title: 'Public', desc: 'Create a public profile with info you choose to share.', icon: 'fa-globe' },
  ];

  const Toggle = ({ id, label, checked, disabled = false, subtext = "" }: { id: keyof AppUser['privacy']; label: string; checked: boolean; disabled?: boolean; subtext?: string }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
      <div className="flex-1">
        <p className="text-sm font-black text-[var(--text-color)]">{label}</p>
        {subtext && <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 uppercase tracking-wider">{subtext}</p>}
      </div>
      <button 
        onClick={() => !disabled && onUpdate({ [id]: !checked })}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-eye text-primary text-xl"></i>
          <h3 className="text-xl font-black tracking-tight">Profile Visibility</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibilityOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onUpdate({ profileVisibility: opt.id })}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all ${
                privacy.profileVisibility === opt.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-100 dark:border-gray-800 bg-[var(--surface-color)] opacity-60 hover:opacity-100'
              }`}
            >
              <i className={`fa-solid ${opt.icon} text-2xl text-primary mb-4`}></i>
              <h4 className="font-black text-sm mb-1">{opt.title}</h4>
              <p className="text-[10px] leading-relaxed text-[var(--text-muted)] font-medium">{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-lock text-primary text-xl"></i>
          <h3 className="text-xl font-black tracking-tight">What Can Others See?</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle 
            id="showMemberNumber" 
            label="Member Number" 
            checked={privacy.showMemberNumber} 
            disabled={privacy.profileVisibility !== 'public'}
            subtext={`e.g. #${user.memberNumber || '0000'}`}
          />
          <Toggle 
            id="showStreak" 
            label="Current Streak" 
            checked={privacy.showStreak} 
            disabled={privacy.profileVisibility !== 'public'}
            subtext="Days of consistency"
          />
          <Toggle 
            id="showDonationTotal" 
            label="Total Donations" 
            checked={privacy.showDonationTotal} 
            disabled={privacy.profileVisibility !== 'public' || user.tier !== 'master'}
            subtext="Master Cultivators only"
          />
          <Toggle 
            id="showAchievements" 
            label="Achievements & Badges" 
            checked={privacy.showAchievements} 
            disabled={privacy.profileVisibility !== 'public'}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-people-group text-primary text-xl"></i>
          <h3 className="text-xl font-black tracking-tight">Community Participation</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle 
            id="showOnMemberMap" 
            label="Show on Member Map" 
            checked={privacy.showOnMemberMap} 
            disabled={privacy.profileVisibility === 'private'}
            subtext="Country level only"
          />
          <Toggle 
            id="allowLeaderboards" 
            label="Include in Leaderboards" 
            checked={privacy.allowLeaderboards} 
            disabled={privacy.profileVisibility === 'private'}
          />
          <Toggle 
            id="anonymousStats" 
            label="Share Anonymous Statistics" 
            checked={privacy.anonymousStats} 
            subtext="Help build global benchmarks"
          />
        </div>
      </section>

      <div className="bg-amber-50 dark:bg-amber-950/20 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900/40">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
             <i className="fa-solid fa-user-shield text-xl"></i>
          </div>
          <div>
            <h4 className="font-black text-amber-800 dark:text-amber-400 tracking-tight uppercase text-xs mb-1">Our Privacy Commitment</h4>
            <p className="text-xs text-amber-800/70 dark:text-amber-400/70 leading-relaxed font-medium">
              We never share your journal contents, specific habit names, or task details. 
              <strong> Everything is PRIVATE by default.</strong> Even with a public profile, your actual growth data remains for your eyes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;


import React, { useState, useMemo } from 'react';
import { AppUser, TierType, UserPrivacy, PublicProfile } from '../types';
import UserDetailsModal from './UserDetailsModal';

// Helper to generate default privacy
const defaultPrivacy: UserPrivacy = {
  profileVisibility: 'private',
  showMemberNumber: false,
  showStreak: false,
  showDonationTotal: false,
  showOnMemberMap: false,
  allowLeaderboards: false,
  allowDirectMessages: false,
  showAchievements: false,
  anonymousStats: false,
};

// Helper to generate default public profile
const createPublicProfile = (name: string, tier: any, memberNumber: number | null): PublicProfile => ({
  displayName: name,
  memberNumber,
  tier,
  memberSince: new Date().toISOString(),
  country: 'Global',
  currentStreak: null,
  totalDonated: null,
  bio: null,
});

const MOCK_USERS: AppUser[] = [
  { 
    id: '1', email: 'jane.doe@example.com', displayName: 'Jane Doe', role: 'user', tier: 'daily', createdAt: 'Jan 3, 2026', lastActive: '2 hours ago', isActive: true, isBetaUser: true, 
    stats: { habitsTracked: 45, journalEntries: 12, tasksCompleted: 89 }, adminNotes: 'Frequent user, very active in journals.', memberNumber: 1234, masterNumber: null, 
    usage: { habitsCount: 5, tasksCount: 10, journalEntriesCount: 12, aiRequestsToday: 5, lastAiRequestReset: new Date().toISOString() },
    privacy: { ...defaultPrivacy, profileVisibility: 'public', showStreak: true },
    publicProfile: createPublicProfile('Jane Doe', 'daily', 1234)
  },
  { 
    id: '2', email: 'john.smith@gmail.com', displayName: 'John Smith', role: 'user', tier: 'cultivator', createdAt: 'Dec 28, 2025', lastActive: '1 day ago', isActive: true, 
    stats: { habitsTracked: 12, journalEntries: 2, tasksCompleted: 15 }, adminNotes: '', memberNumber: null, masterNumber: null, 
    usage: { habitsCount: 2, tasksCount: 5, journalEntriesCount: 2, aiRequestsToday: 1, lastAiRequestReset: new Date().toISOString() },
    privacy: { ...defaultPrivacy },
    publicProfile: createPublicProfile('John Smith', 'cultivator', null)
  },
  { 
    id: '3', email: 'team_lead@corporate.com', displayName: 'Sarah Connor', role: 'user', tier: 'master', createdAt: 'Jan 10, 2026', lastActive: '15 mins ago', isActive: true, isBetaUser: true, 
    stats: { habitsTracked: 120, journalEntries: 54, tasksCompleted: 310 }, adminNotes: 'Enterprise testing lead.', memberNumber: 5678, masterNumber: 99, 
    usage: { habitsCount: 20, tasksCount: 50, journalEntriesCount: 54, aiRequestsToday: 15, lastAiRequestReset: new Date().toISOString() },
    privacy: { ...defaultPrivacy, profileVisibility: 'public', showMemberNumber: true, showDonationTotal: true },
    publicProfile: createPublicProfile('Sarah Connor', 'master', 5678)
  },
  { 
    id: '4', email: 'alex.beta@daily.com', displayName: 'Alex Beta', role: 'user', tier: 'cultivator', createdAt: 'Jan 15, 2026', lastActive: 'Just now', isActive: true, isBetaUser: true, 
    stats: { habitsTracked: 5, journalEntries: 0, tasksCompleted: 10 }, adminNotes: 'Newly joined beta tester.', memberNumber: null, masterNumber: null, 
    usage: { habitsCount: 1, tasksCount: 2, journalEntriesCount: 0, aiRequestsToday: 3, lastAiRequestReset: new Date().toISOString() },
    privacy: { ...defaultPrivacy },
    publicProfile: createPublicProfile('Alex Beta', 'cultivator', null)
  }
];

const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [betaFilter, setBetaFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (tierFilter === 'All' || u.tier === tierFilter.toLowerCase()) &&
      (betaFilter === 'All' || (betaFilter === 'Beta' ? u.isBetaUser : !u.isBetaUser))
    );
  }, [users, searchTerm, tierFilter, betaFilter]);

  const handleUpdateUser = (userId: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleAddBetaUser = () => {
    const email = prompt("Enter email for Beta Access:");
    if (!email) return;
    const name = prompt("Enter display name:");
    if (!name) return;
    const tierInput = prompt("Enter tier (cultivator, daily, master):", "master");
    
    const validTiers: TierType[] = ['cultivator', 'daily', 'master'];
    const chosenTier = validTiers.includes(tierInput as TierType) ? (tierInput as TierType) : 'cultivator';

    const memberNum = chosenTier !== 'cultivator' ? Math.floor(1000 + Math.random() * 9000) : null;
    const masterNum = chosenTier === 'master' ? Math.floor(1 + Math.random() * 99) : null;

    const newUser: AppUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      displayName: name,
      role: 'user',
      tier: chosenTier,
      createdAt: new Date().toLocaleDateString(),
      lastActive: 'Never',
      isActive: true,
      isBetaUser: true,
      stats: { habitsTracked: 0, journalEntries: 0, tasksCompleted: 0 },
      adminNotes: 'Manually added beta tester.',
      memberNumber: memberNum,
      masterNumber: masterNum,
      usage: { habitsCount: 0, tasksCount: 0, journalEntriesCount: 0, aiRequestsToday: 0, lastAiRequestReset: new Date().toISOString() },
      privacy: { ...defaultPrivacy },
      publicProfile: createPublicProfile(name, chosenTier, memberNum)
    };
    
    setUsers(prev => [newUser, ...prev]);
    alert(`${name} has been added as a Beta User on the ${chosenTier} tier.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-surface p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 opacity-30"></i>
          <input 
            type="text" 
            placeholder="Search cultivators by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none font-medium"
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <select 
            value={tierFilter} 
            onChange={(e) => setTierFilter(e.target.value)}
            className="flex-1 lg:flex-none px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
          >
            <option value="All">All Tiers</option>
            <option value="cultivator">Cultivator</option>
            <option value="daily">Daily</option>
            <option value="master">Master</option>
          </select>
          <button 
            onClick={handleAddBetaUser}
            className="px-6 py-3.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-primary/20 flex items-center gap-2 whitespace-nowrap"
          >
            <i className="fa-solid fa-user-plus"></i> New Beta User
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Identity</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Status & Tier</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Beta Toggle</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase border border-primary/10">
                        {user.displayName[0]}
                      </div>
                      <div>
                        <div className="font-black text-sm tracking-tight flex items-center gap-2">
                          {user.displayName}
                          {user.isBetaUser && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase">Beta</span>}
                        </div>
                        <div className="text-[10px] opacity-60 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-md w-fit border border-primary/10">
                        {user.tier}
                      </span>
                      <span className={`text-[9px] font-bold ${user.isActive ? 'text-green-500' : 'text-red-500'} uppercase tracking-widest`}>
                        {user.isActive ? '• Active' : '• Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleUpdateUser(user.id, { isBetaUser: !user.isBetaUser })}
                        className={`w-11 h-6 rounded-full relative transition-all duration-300 border ${user.isBetaUser ? 'bg-primary border-primary' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${user.isBetaUser ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary hover:text-white transition-all"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <i className="fa-solid fa-users-slash text-4xl opacity-10"></i>
              <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No users found matching filters</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdate={handleUpdateUser} 
        />
      )}
    </div>
  );
};

export default UserManagementTable;

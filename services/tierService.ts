
import { AppUser, TierType, TierLimits, GlobalStats } from '../types';

// Impressive initial data for launch credibility
let mockGlobalStats: GlobalStats = {
  totalMembers: 4892,
  activeDailyCultivators: 4765,
  activeMasterCultivators: 127,
  totalDonated: 12341,
  nextMemberNumber: 4893,
  nextMasterNumber: 128,
  lastUpdated: new Date().toISOString()
};

export const getGlobalStats = (): GlobalStats => {
  return { ...mockGlobalStats };
};

export const checkTierLimit = (user: AppUser, limitType: keyof TierLimits): { allowed: boolean; current: number; max: number } => {
  const currentTiers: Record<TierType, TierLimits> = {
    cultivator: { maxHabits: 5, maxTasks: 20, maxJournalEntries: 30, aiRequestsPerDay: 10 },
    daily: { maxHabits: -1, maxTasks: -1, maxJournalEntries: -1, aiRequestsPerDay: 100 },
    master: { maxHabits: -1, maxTasks: -1, maxJournalEntries: -1, aiRequestsPerDay: -1 }
  };

  const limits = currentTiers[user.tier];
  const max = limits[limitType];
  
  let current = 0;
  if (limitType === 'maxHabits') current = user.usage.habitsCount;
  if (limitType === 'maxTasks') current = user.usage.tasksCount;
  if (limitType === 'maxJournalEntries') current = user.usage.journalEntriesCount;
  if (limitType === 'aiRequestsPerDay') current = user.usage.aiRequestsToday;

  if (max === -1) return { allowed: true, current, max };
  return { allowed: current < max, current, max };
};

export const upgradeTier = (user: AppUser, newTier: TierType): { user: AppUser; message: string } => {
  const now = new Date().toISOString();
  let updatedUser = { ...user };
  let message = `Successfully upgraded to ${newTier}!`;

  if ((newTier === 'daily' || newTier === 'master') && !user.memberNumber) {
    const assignedNumber = mockGlobalStats.nextMemberNumber;
    mockGlobalStats.nextMemberNumber++;
    mockGlobalStats.totalMembers++;
    mockGlobalStats.activeDailyCultivators++;
    updatedUser.memberNumber = assignedNumber;
    updatedUser.joinedPaidDate = now;
    message = `Welcome, Daily Cultivator #${assignedNumber}!`;
  }

  if (newTier === 'master' && !user.masterNumber) {
    const assignedMaster = mockGlobalStats.nextMasterNumber;
    mockGlobalStats.nextMasterNumber++;
    mockGlobalStats.activeMasterCultivators++;
    if (user.tier === 'daily') mockGlobalStats.activeDailyCultivators--;
    mockGlobalStats.totalDonated += 1;
    updatedUser.masterNumber = assignedMaster;
    updatedUser.upgradedToMasterDate = now;
    message = `Welcome, Master Cultivator #${assignedMaster}!`;
  }

  updatedUser.tier = newTier;
  mockGlobalStats.lastUpdated = now;

  return { user: updatedUser, message };
};

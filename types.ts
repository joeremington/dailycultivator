
export interface Habit {
  id: string;
  name: string;
  streak: number;
  completions: string[]; // ISO Dates
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  content: string;
  mood?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  completed: boolean;
  subtasks: { title: string; completed: boolean }[];
  energyLevel: 'low' | 'medium' | 'high';
}

export interface UserStats {
  habitsTracked: number;
  journalEntries: number;
  tasksCompleted: number;
}

export type TierType = 'cultivator' | 'daily' | 'master';
export type UserRole = 'user' | 'admin' | 'super-admin';
export type VisibilityType = 'private' | 'anonymous' | 'public';

export interface UserPrivacy {
  profileVisibility: VisibilityType;
  showMemberNumber: boolean;
  showStreak: boolean;
  showDonationTotal: boolean;
  showOnMemberMap: boolean;
  allowLeaderboards: boolean;
  allowDirectMessages: boolean;
  showAchievements: boolean;
  anonymousStats: boolean;
}

export interface PublicProfile {
  displayName: string;
  memberNumber: number | null;
  tier: TierType;
  memberSince: string;
  country: string;
  currentStreak: number | null;
  totalDonated: number | null;
  bio: string | null;
}

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole; // NEW: Distinguishes access levels
  photoURL?: string;
  tier: TierType;
  memberNumber: number | null;
  masterNumber: number | null;
  createdAt: string;
  lastActive: string;
  isActive: boolean;
  isBetaUser?: boolean;
  stats: UserStats;
  usage: TierUsage;
  privacy: UserPrivacy;
  publicProfile: PublicProfile;
  adminNotes: string;
  // Added missing date properties for tier upgrades
  joinedPaidDate?: string;
  upgradedToMasterDate?: string;
}

export interface TierUsage {
  habitsCount: number;
  tasksCount: number;
  journalEntriesCount: number;
  aiRequestsToday: number;
  lastAiRequestReset: string;
}

export interface TierLimits {
  maxHabits: number;
  maxTasks: number;
  maxJournalEntries: number;
  aiRequestsPerDay: number;
}

export interface PricingTier {
  id: TierType;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  displayOrder: number;
  badge: string;
  isPopular?: boolean;
  identity: {
    title: string;
    tagline: string;
  };
  limits: TierLimits;
  features: string[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
  themeMode: ThemeMode;
  branding: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  pricing: {
    tiers: PricingTier[];
  };
}

// Added GlobalStats interface
export interface GlobalStats {
  totalMembers: number;
  activeDailyCultivators: number;
  activeMasterCultivators: number;
  totalDonated: number;
  nextMemberNumber: number;
  nextMasterNumber: number;
  lastUpdated: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type View = 'habits' | 'journal' | 'tasks' | 'chat' | 'admin' | 'pricing' | 'community' | 'settings';

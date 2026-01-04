
import { AppUser, PublicProfile } from "../types";

/**
 * Strips private data from a user object to generate a safe public representation.
 * Adheres to CORE PRINCIPLE: Everything is PRIVATE by default.
 */
export const getSafePublicProfile = (user: AppUser): Partial<PublicProfile> | null => {
  const { privacy } = user;

  // 1. If profile is private, return absolutely nothing
  if (privacy.profileVisibility === 'private') {
    return null;
  }

  // 2. ANONYMOUS: Only show member number and tier/badge
  if (privacy.profileVisibility === 'anonymous') {
    return {
      displayName: `Daily Cultivator #${user.memberNumber || '????'}`,
      tier: user.tier,
      memberNumber: user.memberNumber,
    };
  }

  // 3. PUBLIC: Granular opt-in logic
  const profile: Partial<PublicProfile> = {
    displayName: user.displayName,
    tier: user.tier,
    memberSince: user.createdAt,
    country: user.publicProfile.country, // Country is allowed, city is never shared
  };

  // Only add fields if user has explicitly opted-in
  if (privacy.showMemberNumber) profile.memberNumber = user.memberNumber;
  if (privacy.showStreak) profile.currentStreak = user.stats.habitsTracked > 0 ? 5 : 0; // Simulated streak
  if (privacy.showDonationTotal && user.tier === 'master') profile.totalDonated = user.publicProfile.totalDonated;
  if (privacy.showAchievements) profile.bio = user.publicProfile.bio;

  return profile;
};

export const validateSharePermission = (user: AppUser, dataType: string): boolean => {
  const { privacy } = user;
  if (privacy.profileVisibility === 'private') return false;
  
  switch(dataType) {
    case 'streak': return privacy.showStreak;
    case 'memberNumber': return privacy.showMemberNumber;
    case 'donations': return privacy.showDonationTotal && user.tier === 'master';
    case 'map': return privacy.showOnMemberMap;
    default: return false;
  }
};

/**
 * Helpers for the daily completion limit.
 * type: 'lessons' | 'dilemmas' | 'challenges'
 */
import { getLocalDateString } from '@/lib/progressUtils';

export const DAILY_LIMIT = 4;

// Preview bypass: no daily cap for the app owner reviewing content
const PREVIEW_EMAIL = 'anika.seksaria@gmail.com';
export function isPreviewUser(userEmail) {
  return userEmail === PREVIEW_EMAIL;
}

export function getDailyCount(progress, type) {
  const today = getLocalDateString();
  const dateKey = `daily_${type}_date`;
  const countKey = `daily_${type}_count`;
  if (!progress) return 0;
  if (progress[dateKey] !== today) return 0;
  return progress[countKey] || 0;
}

export function isAtDailyLimit(progress, type, userEmail) {
  if (userEmail && isPreviewUser(userEmail)) return false;
  return getDailyCount(progress, type) >= DAILY_LIMIT;
}

export function buildDailyCountUpdate(progress, type) {
  const today = getLocalDateString();
  const dateKey = `daily_${type}_date`;
  const countKey = `daily_${type}_count`;
  const currentCount = getDailyCount(progress, type);
  return {
    [dateKey]: today,
    [countKey]: currentCount + 1,
  };
}
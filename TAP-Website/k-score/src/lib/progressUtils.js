/**
 * Shared progress calculation utilities used across Lessons, Dilemmas, and Challenges.
 */

/**
 * Get today's date string in local timezone (YYYY-MM-DD)
 */
export function getLocalDateString() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Compute new XP and level after earning XP.
 */
export function computeXpAndLevel(currentXp, currentLevel, earnedXp) {
  let xp = currentXp + earnedXp;
  let level = currentLevel;

  while (true) {
    const xpNeeded = level * 100;
    if (xp >= xpNeeded) {
      xp -= xpNeeded;
      level++;
    } else {
      break;
    }
  }

  return { xp, level };
}

/**
 * Compute the ME-Score (k_score) as the sum of all 5 skill scores.
 * Pass individual scores; this sums them.
 */
export function computeKScore(logic, empathy, discipline, emotionalReg, integrity) {
  return (logic || 0) + (empathy || 0) + (discipline || 0) + (emotionalReg || 0) + (integrity || 0);
}

/**
 * Compute new streak based on last_activity_date and current streak_days.
 * - If last activity was yesterday → increment streak
 * - If last activity was today → no change
 * - Otherwise → reset to 1
 */
export function computeStreak(lastActivityDate, currentStreakDays) {
  const today = getLocalDateString();

  if (!lastActivityDate) {
    return { streak_days: 1, last_activity_date: today };
  }

  if (lastActivityDate === today) {
    return { streak_days: currentStreakDays || 1, last_activity_date: today };
  }

  const nowDate = new Date();
  const pad = n => String(n).padStart(2, '0');
  const yest = new Date(nowDate);
  yest.setDate(yest.getDate() - 1);
  const yesterdayStr = `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`;

  if (lastActivityDate === yesterdayStr) {
    return { streak_days: (currentStreakDays || 0) + 1, last_activity_date: today };
  }

  return { streak_days: 1, last_activity_date: today };
}
/**
 * Check whether a given curriculum level is unlocked.
 * Level 1 is always unlocked. Higher levels require ALL level 1...(targetLevel-1)
 * content (lessons + dilemmas + challenges) to be fully completed.
 */
export function isGlobalLevelUnlocked({ targetLevel, allLessons, allDilemmas, allChallenges, completedLessons, completedDilemmas, completedChallenges }) {
  if (targetLevel <= 1) return true;
  if (!allLessons || !allDilemmas || !allChallenges) return false;

  for (let lvl = 1; lvl < targetLevel; lvl++) {
    const lessonsInLevel = allLessons.filter(l => (l.curriculum_level || 1) === lvl && l.section !== 'literary_masters');
    const dilemmasInLevel = allDilemmas.filter(d => (d.curriculum_level || 1) === lvl);
    const challengesInLevel = allChallenges.filter(c => (c.curriculum_level || 1) === lvl);

    const total = lessonsInLevel.length + dilemmasInLevel.length + challengesInLevel.length;
    if (total === 0) continue; // no content in this level, skip

    const allDone =
      lessonsInLevel.every(l => completedLessons.includes(l.id)) &&
      dilemmasInLevel.every(d => completedDilemmas.includes(d.id)) &&
      challengesInLevel.every(c => completedChallenges.includes(c.id));

    if (!allDone) return false;
  }
  return true;
}

/**
 * Check if all content in a curriculum level is done and return the new level.
 * Recursively advances through levels until an incomplete one is found.
 */
export function computeCurriculumLevel({ currentCurriculumLevel, allLessons, allDilemmas, allChallenges, completedLessons, completedDilemmas, completedChallenges }) {
  // If any content source hasn't loaded yet, don't compute — return current level unchanged
  if (!allLessons || !allDilemmas || !allChallenges) {
    return currentCurriculumLevel || 1;
  }

  const startLevel = currentCurriculumLevel || 1;
  let lvl = startLevel;

  while (lvl < 3) {
    const lessonsInLevel = allLessons.filter(l => (l.curriculum_level || 1) === lvl && l.section !== 'literary_masters');
    const dilemmasInLevel = allDilemmas.filter(d => (d.curriculum_level || 1) === lvl);
    const challengesInLevel = allChallenges.filter(c => (c.curriculum_level || 1) === lvl);

    const total = lessonsInLevel.length + dilemmasInLevel.length + challengesInLevel.length;
    // If no content in this level, advance past it
    if (total === 0) { lvl++; continue; }

    const allDone =
      lessonsInLevel.every(l => completedLessons.includes(l.id)) &&
      dilemmasInLevel.every(d => completedDilemmas.includes(d.id)) &&
      challengesInLevel.every(c => completedChallenges.includes(c.id));

    if (allDone) { lvl++; } else { break; }
  }

  // Never demote — always return at least the level the user already had
  return Math.max(lvl, startLevel);
}
// Badge definitions — each badge has an id, label, description, icon name, color, medal tier, and an unlock function
// unlock(progress, rank, totalUsers) => boolean

// Medal tiers: 'bronze' | 'silver' | 'gold' | 'platinum'

export const BADGES = [
  // ── First Steps ──────────────────────────────────────────────────────────
  {
    id: 'first_lesson',
    label: 'First Step',
    description: 'Complete your first lesson',
    icon: 'BookOpen',
    tier: 'bronze',
    category: 'lessons',
    unlock: (p) => (p?.completed_lessons?.length || 0) >= 1,
  },
  {
    id: 'lessons_10',
    label: 'Avid Reader',
    description: 'Complete 10 lessons',
    icon: 'BookOpen',
    tier: 'silver',
    category: 'lessons',
    unlock: (p) => (p?.completed_lessons?.length || 0) >= 10,
  },
  {
    id: 'lessons_25',
    label: 'Scholar',
    description: 'Complete 25 lessons',
    icon: 'BookOpen',
    tier: 'gold',
    category: 'lessons',
    unlock: (p) => (p?.completed_lessons?.length || 0) >= 25,
  },

  // ── Streaks ───────────────────────────────────────────────────────────────
  {
    id: 'streak_3',
    label: '3-Day Streak',
    description: 'Maintain a 3-day learning streak',
    icon: 'Flame',
    tier: 'bronze',
    category: 'streak',
    unlock: (p) => (p?.streak_days || 0) >= 3,
  },
  {
    id: 'streak_7',
    label: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'Flame',
    tier: 'silver',
    category: 'streak',
    unlock: (p) => (p?.streak_days || 0) >= 7,
  },
  {
    id: 'streak_30',
    label: 'Ironclad',
    description: 'Maintain a 30-day learning streak',
    icon: 'Flame',
    tier: 'gold',
    category: 'streak',
    unlock: (p) => (p?.streak_days || 0) >= 30,
  },

  // ── Dilemmas ──────────────────────────────────────────────────────────────
  {
    id: 'dilemma_1',
    label: 'Moral Thinker',
    description: 'Complete your first ethical dilemma',
    icon: 'Scale',
    tier: 'bronze',
    category: 'dilemmas',
    unlock: (p) => (p?.completed_dilemmas?.length || 0) >= 1,
  },
  {
    id: 'dilemma_10',
    label: 'Ethicist',
    description: 'Complete 10 ethical dilemmas',
    icon: 'Scale',
    tier: 'silver',
    category: 'dilemmas',
    unlock: (p) => (p?.completed_dilemmas?.length || 0) >= 10,
  },
  {
    id: 'dilemma_25',
    label: 'Philosopher',
    description: 'Complete 25 ethical dilemmas',
    icon: 'Scale',
    tier: 'gold',
    category: 'dilemmas',
    unlock: (p) => (p?.completed_dilemmas?.length || 0) >= 25,
  },

  // ── Challenges ────────────────────────────────────────────────────────────
  {
    id: 'challenge_1',
    label: 'Challenge Accepted',
    description: 'Complete your first challenge',
    icon: 'Target',
    tier: 'bronze',
    category: 'challenges',
    unlock: (p) => (p?.completed_challenges?.length || 0) >= 1,
  },
  {
    id: 'challenge_10',
    label: 'Challenge Taker',
    description: 'Complete 10 challenges',
    icon: 'Target',
    tier: 'silver',
    category: 'challenges',
    unlock: (p) => (p?.completed_challenges?.length || 0) >= 10,
  },
  {
    id: 'challenge_master',
    label: 'Challenge Master',
    description: 'Complete 25 challenges',
    icon: 'Target',
    tier: 'gold',
    category: 'challenges',
    unlock: (p) => (p?.completed_challenges?.length || 0) >= 25,
  },

  // ── ME-Score Milestones ───────────────────────────────────────────────────
  {
    id: 'kscore_100',
    label: 'Century Mark',
    description: 'Reach a ME-Score of 100',
    icon: 'Zap',
    tier: 'bronze',
    category: 'me_score',
    unlock: (p) => (p?.k_score || 0) >= 100,
  },
  {
    id: 'kscore_500',
    label: 'High Performer',
    description: 'Reach a ME-Score of 500',
    icon: 'Zap',
    tier: 'silver',
    category: 'me_score',
    unlock: (p) => (p?.k_score || 0) >= 500,
  },
  {
    id: 'kscore_1000',
    label: 'ME Master',
    description: 'Reach the maximum ME-Score of 1000',
    icon: 'Star',
    tier: 'platinum',
    category: 'me_score',
    unlock: (p) => (p?.k_score || 0) >= 1000,
  },

  // ── Skill Mastery (each skill capped at 200) ──────────────────────────────
  {
    id: 'logic_master',
    label: 'Logic Master',
    description: 'Max out your Logic score (200)',
    icon: 'Brain',
    tier: 'gold',
    category: 'skills',
    unlock: (p) => (p?.logic_score || 0) >= 200,
  },
  {
    id: 'empathy_master',
    label: 'Empathy Master',
    description: 'Max out your Empathy score (200)',
    icon: 'Heart',
    tier: 'gold',
    category: 'skills',
    unlock: (p) => (p?.empathy_score || 0) >= 200,
  },
  {
    id: 'discipline_master',
    label: 'Discipline Master',
    description: 'Max out your Discipline score (200)',
    icon: 'Shield',
    tier: 'gold',
    category: 'skills',
    unlock: (p) => (p?.discipline_score || 0) >= 200,
  },
  {
    id: 'emotional_regulation_master',
    label: 'Inner Calm',
    description: 'Max out your Self-Control score (200)',
    icon: 'Wind',
    tier: 'gold',
    category: 'skills',
    unlock: (p) => (p?.emotional_regulation_score || 0) >= 200,
  },
  {
    id: 'integrity_master',
    label: 'Integrity Master',
    description: 'Max out your Integrity score (200)',
    icon: 'Star',
    tier: 'gold',
    category: 'skills',
    unlock: (p) => (p?.integrity_score || 0) >= 200,
  },
  {
    id: 'all_skills_master',
    label: 'Fully Realized',
    description: 'Max out all five skill pillars',
    icon: 'Award',
    tier: 'platinum',
    category: 'skills',
    unlock: (p) =>
      (p?.logic_score || 0) >= 200 &&
      (p?.empathy_score || 0) >= 200 &&
      (p?.discipline_score || 0) >= 200 &&
      (p?.emotional_regulation_score || 0) >= 200 &&
      (p?.integrity_score || 0) >= 200,
  },

  // ── Curriculum ────────────────────────────────────────────────────────────
  {
    id: 'curriculum_2',
    label: 'Rising Scholar',
    description: 'Reach curriculum level 2',
    icon: 'Map',
    tier: 'bronze',
    category: 'curriculum',
    unlock: (p) => (p?.curriculum_level || 1) >= 2,
  },
  {
    id: 'curriculum_5',
    label: 'Halfway There',
    description: 'Reach curriculum level 5',
    icon: 'Map',
    tier: 'silver',
    category: 'curriculum',
    unlock: (p) => (p?.curriculum_level || 1) >= 5,
  },
  {
    id: 'curriculum_10',
    label: 'Graduate',
    description: 'Complete all 10 curriculum levels',
    icon: 'GraduationCap',
    tier: 'platinum',
    category: 'curriculum',
    unlock: (p) => (p?.curriculum_level || 1) >= 10,
  },

  // ── Social / Leaderboard ──────────────────────────────────────────────────
  {
    id: 'top10pct',
    label: 'Top 10%',
    description: 'Rank in the top 10% globally',
    icon: 'Trophy',
    tier: 'silver',
    category: 'social',
    unlock: (p, rank, totalUsers) => rank > 0 && totalUsers > 0 && rank <= Math.ceil(totalUsers * 0.1),
  },
  {
    id: 'top_rank',
    label: 'Elite Thinker',
    description: 'Reach the global top 3',
    icon: 'Crown',
    tier: 'platinum',
    category: 'social',
    unlock: (p, rank) => rank > 0 && rank <= 3,
  },
];

export function getUnlockedBadges(progress, rank = 0, totalUsers = 0) {
  return BADGES.filter(b => b.unlock(progress, rank, totalUsers));
}

export function getLockedBadges(progress, rank = 0, totalUsers = 0) {
  return BADGES.filter(b => !b.unlock(progress, rank, totalUsers));
}

// Returns badges unlocked since a previous snapshot (for "newly earned" detection)
export function getNewlyUnlockedBadges(prevProgress, nextProgress, rank = 0, totalUsers = 0) {
  const prevUnlocked = new Set(getUnlockedBadges(prevProgress, rank, totalUsers).map(b => b.id));
  return getUnlockedBadges(nextProgress, rank, totalUsers).filter(b => !prevUnlocked.has(b.id));
}
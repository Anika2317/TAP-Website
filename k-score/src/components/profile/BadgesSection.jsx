import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Flame, Scale, Target, Trophy, Crown, Zap, Map,
  Award, Medal, Brain, Heart, Shield, Wind, Star, GraduationCap, X
} from 'lucide-react';
import { BADGES, getUnlockedBadges, getLockedBadges } from '@/lib/badges';

const ICON_MAP = {
  BookOpen, Flame, Scale, Target, Trophy, Crown, Zap, Map,
  Award, Medal, Brain, Heart, Shield, Wind, Star, GraduationCap,
};

// Tier visual config
const TIER = {
  bronze: {
    ring: 'ring-2 ring-amber-600/60',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-700 dark:text-amber-400',
    label: 'bg-amber-600',
    shine: 'from-amber-400 to-orange-500',
    name: 'Bronze',
  },
  silver: {
    ring: 'ring-2 ring-slate-400/60',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-700/40',
    iconBg: 'bg-slate-200 dark:bg-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-300',
    label: 'bg-slate-500',
    shine: 'from-slate-300 to-slate-500',
    name: 'Silver',
  },
  gold: {
    ring: 'ring-2 ring-yellow-400/70',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    iconColor: 'text-yellow-700 dark:text-yellow-400',
    label: 'bg-yellow-500',
    shine: 'from-yellow-300 to-amber-400',
    name: 'Gold',
  },
  platinum: {
    ring: 'ring-2 ring-purple-400/70',
    bg: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-700 dark:text-purple-400',
    label: 'bg-purple-600',
    shine: 'from-purple-400 to-indigo-500',
    name: 'Platinum',
  },
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'me_score', label: 'ME-Score' },
  { id: 'skills', label: 'Skills' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'dilemmas', label: 'Dilemmas' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'streak', label: 'Streak' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'social', label: 'Social' },
];

function BadgeMedal({ badge, unlocked, isNew = false }) {
  const [tooltip, setTooltip] = useState(false);
  const Icon = ICON_MAP[badge.icon] || Medal;
  const t = TIER[badge.tier] || TIER.bronze;

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        onClick={() => setTooltip(v => !v)}
        onBlur={() => setTooltip(false)}
        className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center focus:outline-none transition-all ${
          unlocked
            ? `${t.bg} ${t.ring} shadow-md`
            : 'bg-muted/50 ring-2 ring-border/30'
        } ${isNew ? 'animate-pulse' : ''}`}
        aria-label={badge.label}
      >
        {/* Medal shine strip for unlocked */}
        {unlocked && (
          <div className={`absolute inset-0 rounded-2xl opacity-10 bg-gradient-to-br ${t.shine} pointer-events-none`} />
        )}

        {/* Icon */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${unlocked ? t.iconBg : 'bg-muted'}`}>
          <Icon className={`w-4 h-4 ${unlocked ? t.iconColor : 'text-muted-foreground/30'}`} />
        </div>

        {/* Tier dot */}
        {unlocked && (
          <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${t.label} border-2 border-background`} />
        )}

        {/* "NEW" badge */}
        {isNew && unlocked && (
          <span className="absolute -top-2 -left-1 text-[9px] font-bold bg-emerald-500 text-white px-1 py-0.5 rounded-full leading-none">
            NEW
          </span>
        )}

        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-1">
            <span className="text-[10px] text-muted-foreground/40">🔒</span>
          </div>
        )}
      </motion.button>

      <p className={`mt-1.5 text-center text-[10px] leading-tight font-semibold w-16 px-0.5 ${
        unlocked ? 'text-foreground' : 'text-muted-foreground/40'
      }`}>
        {badge.label}
      </p>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-44 bg-popover border border-border rounded-2xl shadow-xl p-3 text-center pointer-events-none"
          >
            <p className="font-bold text-xs text-foreground mb-1">{badge.label}</p>
            <p className="text-xs text-muted-foreground leading-snug mb-2">{badge.description}</p>
            <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${t.label}`}>
              {t.name} Medal
            </span>
            {!unlocked && (
              <p className="text-[10px] text-muted-foreground mt-1.5 italic">Not yet unlocked</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BadgesSection({ progress, rank = 0, totalUsers = 0, newlyUnlocked = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showLocked, setShowLocked] = useState(false);

  const unlocked = getUnlockedBadges(progress, rank, totalUsers);
  const locked = getLockedBadges(progress, rank, totalUsers);
  const unlockedIds = new Set(unlocked.map(b => b.id));
  const newIds = new Set(newlyUnlocked.map(b => b.id));

  const filterBadges = (list) =>
    activeCategory === 'all' ? list : list.filter(b => b.category === activeCategory);

  const visibleUnlocked = filterBadges(unlocked);
  const visibleLocked = showLocked ? filterBadges(locked) : [];

  // Tier summary counts
  const tierCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  unlocked.forEach(b => { if (tierCounts[b.tier] !== undefined) tierCounts[b.tier]++; });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card border border-border rounded-3xl p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className="font-bold text-foreground">Badges & Medals</h2>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {unlocked.length}/{BADGES.length} earned
        </span>
      </div>

      {/* Tier summary pills */}
      {unlocked.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { tier: 'platinum', label: '🔮 Platinum' },
            { tier: 'gold', label: '🥇 Gold' },
            { tier: 'silver', label: '🥈 Silver' },
            { tier: 'bronze', label: '🥉 Bronze' },
          ].filter(t => tierCounts[t.tier] > 0).map(({ tier, label }) => (
            <span key={tier} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
              {label} × {tierCounts[tier]}
            </span>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Unlocked badges */}
      {visibleUnlocked.length === 0 && !showLocked && (
        <p className="text-xs text-muted-foreground text-center py-4">
          {activeCategory === 'all'
            ? 'Complete activities to earn your first badge!'
            : `No ${activeCategory.replace('_', ' ')} badges earned yet.`}
        </p>
      )}

      {visibleUnlocked.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-3">
          {visibleUnlocked.map(badge => (
            <BadgeMedal
              key={badge.id}
              badge={badge}
              unlocked
              isNew={newIds.has(badge.id)}
            />
          ))}
        </div>
      )}

      {/* Show locked toggle */}
      <button
        onClick={() => setShowLocked(v => !v)}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 flex items-center justify-center gap-1"
      >
        {showLocked ? (
          <>Hide locked badges</>
        ) : (
          <>{filterBadges(locked).length > 0 ? `Show ${filterBadges(locked).length} locked badge${filterBadges(locked).length !== 1 ? 's' : ''}` : 'No more badges in this category'}</>
        )}
      </button>

      {/* Locked badges */}
      {showLocked && visibleLocked.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-border">
          {visibleLocked.map(badge => (
            <BadgeMedal key={badge.id} badge={badge} unlocked={false} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

export default function StreakCard({ progress }) {
  const streak = progress?.streak_days || 0;
  const flames = Math.min(streak, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-3xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Daily streak</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display tabular text-4xl font-medium leading-none text-foreground">{streak}</span>
            <span className="text-sm text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span>
          </p>
        </div>
        {streak >= 7 ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
            <Trophy className="w-3.5 h-3.5" /> Perfect week
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{7 - flames} to a perfect week</span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5" role="img" aria-label={`${flames} of 7 days this week`}>
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            className={`aspect-square rounded-xl flex items-center justify-center ${
              i < flames
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-900/20'
                : 'bg-muted'
            }`}
          >
            <Flame className={`w-4 h-4 ${i < flames ? 'text-white' : 'text-muted-foreground/40'}`} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

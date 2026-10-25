import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy } from 'lucide-react';

export default function StreakCard({ progress }) {
  const streak = progress?.streak_days || 0;
  const flames = Math.min(streak, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-3xl p-6 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-foreground">Daily Streak</h3>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950">
          <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{streak} days</span>
        </div>
      </div>

      <div className="flex justify-center gap-2 py-4">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              i < flames
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50'
                : 'bg-muted'
            }`}
          >
            <Flame className={`w-4 h-4 ${i < flames ? 'text-white' : 'text-muted-foreground'}`} />
          </motion.div>
        ))}
      </div>

      {streak >= 7 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium"
        >
          <Trophy className="w-4 h-4" />
          <span>Perfect week! Keep it going!</span>
        </motion.div>
      )}
    </motion.div>
  );
}
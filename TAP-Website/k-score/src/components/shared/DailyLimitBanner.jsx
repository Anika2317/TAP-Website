import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock } from 'lucide-react';

export default function DailyLimitBanner({ type = 'lessons', completed = 2, limit = 2 }) {
  const labels = {
    lessons: 'lessons',
    dilemmas: 'dilemmas',
    challenges: 'challenges',
  };

  // Time until midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const hoursLeft = Math.floor((midnight - now) / 1000 / 3600);
  const minutesLeft = Math.floor(((midnight - now) / 1000 % 3600) / 60);
  const timeStr = hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-5 mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Moon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
            Daily limit reached
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
            You've completed your {limit} {labels[type]} for today. Rest is part of the process — your brain consolidates learning during sleep.
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Resets in {timeStr}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Star } from 'lucide-react';

export default function LevelGate({ level, currentLevel, isCompleted, children }) {
  const isUnlocked = level <= currentLevel;
  const isCurrent = level === currentLevel;

  if (isUnlocked) return children;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-500">Level {level} — Locked</p>
          <p className="text-sm text-slate-400 mt-1">Complete all Level {level - 1} content to unlock</p>
        </div>
      </div>
    </motion.div>
  );
}
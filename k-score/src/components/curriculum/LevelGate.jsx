import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function LevelGate({ level, currentLevel, isCompleted, children }) {
  const isUnlocked = level <= currentLevel;
  const isCurrent = level === currentLevel;

  if (isUnlocked) return children;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl border-2 border-dashed border-border bg-muted/60 p-8 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Level {level} — Locked</p>
          <p className="text-sm text-muted-foreground mt-1">Complete all Level {level - 1} content to unlock</p>
        </div>
      </div>
    </motion.div>
  );
}
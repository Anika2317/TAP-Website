import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flame, BookOpen, Scale, Target } from 'lucide-react';

export default function LevelProgressBar({
  currentLevel,
  // Combined totals (all content types in current level)
  completedInLevel,
  totalInLevel,
  levelCompleted,
  // Per-type breakdown (optional but preferred)
  lessonsCompleted,
  lessonsTotal,
  dilemmasCompleted,
  dilemmasTotal,
  challengesCompleted,
  challengesTotal,
}) {
  const pct = totalInLevel > 0 ? Math.round((completedInLevel / totalInLevel) * 100) : 0;
  const prevLevelsComplete = currentLevel > 1;

  const hasBreakdown = (
    lessonsTotal !== undefined ||
    dilemmasTotal !== undefined ||
    challengesTotal !== undefined
  );

  const breakdown = [
    { icon: BookOpen, label: 'Lessons', done: lessonsCompleted ?? 0, total: lessonsTotal ?? 0, color: 'text-emerald-600' },
    { icon: Scale, label: 'Dilemmas', done: dilemmasCompleted ?? 0, total: dilemmasTotal ?? 0, color: 'text-purple-600' },
    { icon: Target, label: 'Challenges', done: challengesCompleted ?? 0, total: challengesTotal ?? 0, color: 'text-amber-600' },
  ].filter(b => b.total > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm"
    >
      {prevLevelsComplete && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            Levels 1–{currentLevel - 1} completed
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-foreground">Level {currentLevel}</span>
          {levelCompleted && (
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              Complete!
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium">{completedInLevel}/{totalInLevel} done</span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>

      {hasBreakdown && breakdown.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {breakdown.map(({ icon: Icon, label, done, total, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className={`font-semibold ${done >= total ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                {done}/{total}
              </span>
              <span className="text-muted-foreground">{label}</span>
              {done >= total && <CheckCircle className="w-3 h-3 text-emerald-500" />}
            </div>
          ))}
        </div>
      )}


    </motion.div>
  );
}
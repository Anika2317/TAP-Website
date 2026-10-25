import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, ChevronRight, Feather, Brain, CheckCircle2 } from 'lucide-react';

const tabIcons = {
  neuroscience: Brain,
  literary_wisdom: Feather,
};

export default function LessonCard({ lesson, onClick, completed, literary, dimmed }) {
  const Icon = tabIcons[lesson.category] || BookOpen;

  return (
    <motion.div
      whileTap={{ scale: onClick ? 0.97 : 1 }}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `${completed ? 'Review' : 'Start'} lesson: ${lesson.title}` : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 ${
        onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
      } ${
        completed
          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
          : dimmed
          ? 'bg-muted border-border opacity-40 pointer-events-none'
          : 'bg-card border-border shadow-sm'
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        completed ? 'bg-emerald-100' : 'bg-gradient-to-br from-emerald-600 to-teal-600'
      }`}>
        {completed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          : <Icon className="w-5 h-5 text-white" />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-tight truncate ${completed ? 'text-emerald-800 dark:text-emerald-400' : 'text-foreground'}`}>
          {lesson.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{lesson.thinker} · {lesson.duration_minutes}m</p>
      </div>

      {/* XP + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!completed && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
            <Zap className="w-3 h-3" />
            {lesson.xp_reward}
          </span>
        )}
        <ChevronRight className={`w-4 h-4 ${completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
      </div>
    </motion.div>
  );
}
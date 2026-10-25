import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ChevronRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

const categoryColors = {
  personal: 'bg-purple-100 text-purple-700',
  professional: 'bg-blue-100 text-blue-700',
  social: 'bg-pink-100 text-pink-700',
  existential: 'bg-slate-100 text-slate-700',
};

export default function DilemmaCard({ dilemma, onClick, completed, dimmed }) {
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
      aria-label={onClick ? `${completed ? 'Review' : 'Start'} dilemma: ${dilemma.title}` : undefined}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 ${
        onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
      } ${
        completed
          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
          : dimmed
          ? 'bg-muted border-border opacity-50 pointer-events-none'
          : 'bg-card border-border shadow-sm'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        completed ? 'bg-emerald-100' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
      }`}>
        {completed
          ? <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          : <Scale className="w-5 h-5 text-white" />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
      <p className={`font-semibold text-sm leading-tight truncate ${completed ? 'text-emerald-800 dark:text-emerald-400' : 'text-foreground'}`}>
        {dilemma.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <span className={`text-xs font-medium capitalize ${categoryColors[dilemma.category]?.split(' ')[1] || 'text-muted-foreground'}`}>{dilemma.category}</span>
        {dilemma.difficulty && (
          <>
            <span className="text-xs text-muted-foreground">·</span>
            <span className={`text-xs font-medium ${difficultyColors[dilemma.difficulty]?.split(' ')[1] || 'text-muted-foreground'}`}>{dilemma.difficulty}</span>
          </>
        )}
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-amber-600 flex items-center gap-0.5"><Zap className="w-3 h-3" />+{dilemma.xp_reward}</span>
      </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {completed
          ? <Badge className="bg-emerald-100 text-emerald-700 text-xs">Done</Badge>
          : <ChevronRight className="w-4 h-4 text-muted-foreground" />
        }
      </div>
    </motion.div>
  );
}
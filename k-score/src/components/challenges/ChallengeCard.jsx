import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Zap, Brain, Heart, Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const skillIcons = {
  logic: Brain,
  empathy: Heart,
  discipline: Target,
  emotional_regulation: Sparkles,
  integrity: Shield,
};

const skillColors = {
  logic: 'from-emerald-600 to-teal-600',
  empathy: 'from-emerald-500 to-teal-500',
  discipline: 'from-teal-600 to-emerald-700',
  emotional_regulation: 'from-emerald-600 to-teal-700',
  integrity: 'from-teal-500 to-emerald-600',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

export default function ChallengeCard({ challenge, onClick, completed, dimmed }) {
  const Icon = skillIcons[challenge.target_skill] || Target;
  const gradient = skillColors[challenge.target_skill] || 'from-slate-500 to-slate-600';

  return (
    <motion.div
      whileTap={{ scale: onClick ? 0.97 : 1 }}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `${completed ? 'Review' : 'Start'} challenge: ${challenge.title}` : undefined}
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
        completed ? 'bg-emerald-100' : `bg-gradient-to-br ${gradient}`
      }`}>
        {completed
          ? <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          : <Icon className="w-5 h-5 text-white" />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-tight truncate ${completed ? 'text-emerald-800 dark:text-emerald-400' : 'text-foreground'}`}>
          {challenge.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground capitalize">{challenge.difficulty}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-amber-600 flex items-center gap-0.5"><Zap className="w-3 h-3" />+{challenge.xp_reward}</span>
          {challenge.time_commitment && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />{challenge.time_commitment}</span>}
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {completed ? (
          <Button size="sm" variant="outline" onClick={onClick} className="text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 h-8 px-3">
            Review
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onClick}
            className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white h-8 px-3 text-xs`}
          >
            Start
          </Button>
        )}
      </div>
    </motion.div>
  );
}
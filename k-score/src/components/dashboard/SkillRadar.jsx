import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Target, Sparkles, Shield } from 'lucide-react';

const skills = [
  { key: 'logic', label: 'Logic', icon: Brain, color: 'from-slate-600 to-slate-800' },
  { key: 'empathy', label: 'Empathy', icon: Heart, color: 'from-emerald-500 to-teal-600' },
  { key: 'discipline', label: 'Discipline', icon: Target, color: 'from-slate-500 to-emerald-700' },
  { key: 'emotional_regulation', label: 'Emotional regulation', icon: Sparkles, color: 'from-teal-500 to-emerald-700' },
  { key: 'integrity', label: 'Integrity', icon: Shield, color: 'from-emerald-600 to-teal-800' },
];

export default function SkillRadar({ progress }) {
  const scores = skills.map((s) => progress?.[`${s.key}_score`] || 0);
  // Scale bars against the strongest pillar (min 100) so they stay comparable
  const scaleMax = Math.max(100, ...scores);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-3xl p-5 shadow-sm border border-border"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">The five pillars</p>
        <h3 className="font-display text-xl font-medium text-foreground mt-0.5">Cognitive dimensions</h3>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => {
          const score = scores[index];
          const percentage = (score / scaleMax) * 100;
          const Icon = skill.icon;

          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * index }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground truncate">{skill.label}</span>
                  <span className="tabular text-sm font-semibold text-foreground">{score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + 0.08 * index, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

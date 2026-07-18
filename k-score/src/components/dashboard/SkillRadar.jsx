import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Target, Sparkles, Shield } from 'lucide-react';

const skills = [
  { key: 'logic', label: 'Logic', icon: Brain, color: 'from-slate-700 to-slate-900' },
  { key: 'empathy', label: 'Empathy', icon: Heart, color: 'from-emerald-500 to-teal-600' },
  { key: 'discipline', label: 'Discipline', icon: Target, color: 'from-slate-600 to-emerald-700' },
  { key: 'emotional_regulation', label: 'Emotional Reg.', icon: Sparkles, color: 'from-teal-600 to-emerald-700' },
  { key: 'integrity', label: 'Integrity', icon: Shield, color: 'from-emerald-600 to-teal-700' },
];

export default function SkillRadar({ progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-3xl p-6 shadow-sm border border-border"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Cognitive Dimensions</h3>
      
      <div className="space-y-4">
        {skills.map((skill, index) => {
          const score = progress?.[`${skill.key}_score`] || 0;
          const maxScore = Math.max(score, 100);
          const percentage = (score / maxScore) * 100;
          const Icon = skill.icon;

          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${skill.color} bg-opacity-20`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{skill.label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{score}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                  className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Scale, BookOpen, Target, Sparkles } from 'lucide-react';

const actions = [
  {
    title: 'Dilemmas',
    description: 'Ethical choices',
    icon: Scale,
    page: 'Dilemmas',
    gradient: 'from-slate-800 to-slate-900',
    bgGradient: 'from-slate-50 to-slate-100',
  },
  {
    title: 'Lessons',
    description: 'Philosophy & Psychology',
    icon: BookOpen,
    page: 'Lessons',
    gradient: 'from-emerald-700 to-teal-800',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  {
    title: 'Challenges',
    description: 'Daily growth',
    icon: Target,
    page: 'Challenges',
    gradient: 'from-slate-700 to-emerald-800',
    bgGradient: 'from-slate-50 to-emerald-50',
  },
  {
    title: 'Affirmations',
    description: 'Neural rewiring',
    icon: Sparkles,
    page: 'Affirmations',
    gradient: 'from-teal-700 to-slate-800',
    bgGradient: 'from-teal-50 to-slate-50',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Link to={createPageUrl(action.page)}>
              <div className={`group relative overflow-hidden rounded-2xl bg-card p-5 border border-border hover:shadow-lg transition-all duration-300`}>
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br ${action.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
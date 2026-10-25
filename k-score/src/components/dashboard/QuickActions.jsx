import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Scale, BookOpen, Target, Sparkles, ArrowUpRight } from 'lucide-react';

const actions = [
  {
    title: 'Dilemmas',
    description: 'Ethical choices',
    icon: Scale,
    page: 'Dilemmas',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    title: 'Lessons',
    description: 'Philosophy & psychology',
    icon: BookOpen,
    page: 'Lessons',
    gradient: 'from-emerald-600 to-teal-800',
  },
  {
    title: 'Challenges',
    description: 'Daily growth',
    icon: Target,
    page: 'Challenges',
    gradient: 'from-teal-600 to-emerald-900',
  },
  {
    title: 'Affirmations',
    description: 'Neural rewiring',
    icon: Sparkles,
    page: 'Affirmations',
    gradient: 'from-amber-500 to-orange-600',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.06 }}
          >
            <Link
              to={createPageUrl(action.page)}
              className="group relative block h-full overflow-hidden rounded-3xl bg-card p-4 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground leading-tight">{action.title}</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{action.description}</p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

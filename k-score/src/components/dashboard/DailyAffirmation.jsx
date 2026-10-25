import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DailyAffirmation({ affirmation }) {
  if (!affirmation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-card p-6 border border-border shadow-sm"
    >
      <span
        className="absolute -top-6 right-3 font-display text-[9rem] leading-none text-primary/10 select-none pointer-events-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Today&rsquo;s affirmation
          {affirmation.target_skill && (
            <span className="text-primary"> · {affirmation.target_skill.replaceAll('_', ' ')}</span>
          )}
        </p>

        <p className="font-display text-[1.35rem] font-normal text-foreground leading-snug mt-3 mb-4">
          {affirmation.text}
        </p>

        {affirmation.science_note && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {affirmation.science_note}
          </p>
        )}

        {affirmation.source && (
          <p className="text-xs text-muted-foreground mt-3">— {affirmation.source}</p>
        )}

        <Link
          to="/Affirmations"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:gap-2 transition-all"
        >
          More affirmations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

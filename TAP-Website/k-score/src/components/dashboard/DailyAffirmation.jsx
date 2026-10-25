import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

export default function DailyAffirmation({ affirmation }) {
  if (!affirmation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-card p-6 border border-border"
    >
      <div className="absolute top-4 right-4">
        <Sparkles className="w-5 h-5 text-emerald-500" />
      </div>
      
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950">
          <Quote className="w-4 h-4 text-emerald-700" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Today's Affirmation</h3>
          <p className="text-xs text-emerald-700 capitalize">{affirmation.target_skill?.replace('_', ' ')}</p>
        </div>
      </div>

      <p className="text-lg font-medium text-foreground leading-relaxed mb-4">
        "{affirmation.text}"
      </p>

      {affirmation.science_note && (
        <p className="text-sm text-muted-foreground italic">
          {affirmation.science_note}
        </p>
      )}

      {affirmation.source && (
        <p className="text-xs text-emerald-600 mt-2">— {affirmation.source}</p>
      )}
    </motion.div>
  );
}
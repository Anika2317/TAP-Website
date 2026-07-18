import React from 'react';
import { motion } from 'framer-motion';
import { useBackButton } from '@/hooks/useBackButton';
import { X, CheckCircle2, Target, Zap, Brain, Clock } from 'lucide-react';

export default function CompletedChallengeModal({ challenge, onClose }) {
  // Handle back button
  useBackButton(onClose);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl flex flex-col mb-2 sm:mb-0" style={{ maxHeight: '68dvh' }}>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-xs leading-tight">{challenge.title}</h2>
                <p className="text-xs text-emerald-700 capitalize">{challenge.target_skill?.replace('_', ' ')} challenge</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {/* Description */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-xs text-emerald-800 leading-relaxed">{challenge.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">
                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
                <p className="text-base font-bold text-amber-700">+{challenge.xp_reward}</p>
                <p className="text-[10px] text-amber-500">XP earned</p>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5 text-center">
                <Brain className="w-4 h-4 text-teal-500 mx-auto mb-0.5" />
                <p className="text-base font-bold text-teal-700">+{challenge.score_reward}</p>
                <p className="text-[10px] text-teal-500">{challenge.target_skill?.replace('_', ' ')}</p>
              </div>
            </div>

            {challenge.time_commitment && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{challenge.time_commitment}</span>
              </div>
            )}

            {challenge.science_backing && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-500 mb-0.5 font-medium">THE SCIENCE</p>
                <p className="text-xs text-slate-600 italic">{challenge.science_backing}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 p-3 bg-white" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          <button onClick={onClose} className="w-full min-h-[44px] rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
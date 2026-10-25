import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Star, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MEScoreCard({ progress }) {
  const MEScore = progress?.k_score || 0;
  const curriculumLevel = progress?.curriculum_level || 1;
  const allLevelsComplete = curriculumLevel > 3;
  const isMaster = allLevelsComplete;
  const hasShownConfetti = useRef(false);

  useEffect(() => {
    if (isMaster && !hasShownConfetti.current) {
      hasShownConfetti.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.4 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#a78bfa'],
        });
      }, 400);
    }
  }, [isMaster]);

  if (isMaster) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700 p-8 text-white"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-yellow-400/30 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-amber-300/20 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <p className="text-yellow-200 text-sm font-bold">ME-Score Master</p>
              <p className="text-xs text-yellow-300/70">All Levels Complete</p>
            </div>
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2 mb-4">
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="font-display tabular text-7xl font-medium tracking-tight text-yellow-100"
            >
              {MEScore}
            </motion.span>
          </div>

          <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <p className="text-sm text-yellow-100 leading-snug">
              You've mastered the five pillars. You are among the top ethical thinkers in this program.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const level = Math.min(curriculumLevel, 3);
  const activities =
    (progress?.completed_lessons?.length || 0) +
    (progress?.completed_dilemmas?.length || 0) +
    (progress?.completed_challenges?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[1.75rem] bg-[#0d2b23] p-6 text-white shadow-[0_20px_50px_-24px_rgba(6,78,59,0.7)]"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/3 w-full h-full bg-gradient-to-br from-emerald-400/30 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/3 w-full h-full bg-gradient-to-tr from-teal-300/15 to-transparent rounded-full blur-3xl"
        />
        <div className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <Brain className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium leading-tight">Your ME-Score</p>
              <p className="text-[11px] text-emerald-200/60 leading-tight">Moral Ethics Score</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-100/80 bg-white/10 rounded-full pl-3 pr-2 py-1">
            Profile <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display tabular text-[5.5rem] leading-none font-medium tracking-tight mt-6 mb-5"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {MEScore}
        </motion.p>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-white/10 px-3 py-1 text-emerald-50">Level {level} of 3</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-emerald-50">{activities} {activities === 1 ? 'activity' : 'activities'}</span>
        </div>
        {MEScore === 0 && (
          <p className="text-emerald-100/70 text-sm mt-4 leading-snug">
            Complete lessons, dilemmas &amp; challenges to grow your score.
          </p>
        )}
      </div>
    </motion.div>
  );
}

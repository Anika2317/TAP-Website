import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Star, Sparkles } from 'lucide-react';
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
              className="text-7xl font-bold tracking-tight text-yellow-100"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 text-white"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-sage-500/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Brain className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-emerald-200 text-sm font-medium">Your ME-Score</p>
              <p className="text-xs text-emerald-300/60">Moral Ethics Score</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <motion.span
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-7xl font-bold tracking-tight"
          >
            {MEScore}
          </motion.span>
          <p className="text-emerald-300/60 text-sm mt-2">Keep completing lessons, dilemmas & challenges to grow your score</p>
        </div>
      </div>
    </motion.div>
  );
}
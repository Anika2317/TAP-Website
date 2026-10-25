import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LevelUnlockCelebration({ show, unlockedLevel, onDone }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!show || firedRef.current) return;
    firedRef.current = true;

    // Burst confetti from both sides
    const fire = (originX, angle) => {
      confetti({
        particleCount: 60,
        spread: 55,
        angle,
        origin: { x: originX, y: 0.7 },
        colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'],
        startVelocity: 35,
        gravity: 0.9,
        ticks: 200,
      });
    };

    fire(0.15, 60);
    fire(0.85, 120);

    const timer = setTimeout(onDone, 3200);
    return () => {
      clearTimeout(timer);
      firedRef.current = false;
    };
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3 mx-6"
          >
            {/* Pulsing lock icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
            >
              <Unlock className="w-8 h-8 text-white" />
            </motion.div>

            <div className="text-center">
              <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">Level Complete!</p>
              <h2 className="text-white text-2xl font-bold">Level {unlockedLevel} Unlocked</h2>
            </div>

            {/* Stars row */}
            <div className="flex gap-2 mt-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
                >
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
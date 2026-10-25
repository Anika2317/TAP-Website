import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, Trophy, Loader2, BookOpen, X } from 'lucide-react';

const LEVEL_DATA = [
  {
    level: 1, title: 'The Awakening',
    color: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-400', dot: 'bg-emerald-500',
    tagline: 'Understanding how your mind actually works.',
    checkpoints: [
      { idea: 'The Stoics (Epictetus, Marcus Aurelius) argued that you can\'t control what happens to you — only how you respond. This is the foundation of emotional regulation, and modern therapy is built on it.' },
      { idea: 'Your brain has a "negativity bias": it registers threats and failures more intensely than wins. This was useful for survival 100,000 years ago — but it distorts how you see yourself today.' },
      { idea: 'Neuroplasticity means your brain physically rewires itself based on what you repeatedly think and do. Every time you reflect on a decision, you\'re strengthening the neural pathways for ethical reasoning.' },
      { idea: 'Socrates said "know thyself" — but research shows most people are bad at accurately predicting how they\'ll behave in tough situations. That gap between who we think we are and who we act like is what this program measures.' },
    ],
  },
  {
    level: 2, title: 'The Observer',
    color: 'from-teal-400 to-cyan-500', ring: 'ring-cyan-400', dot: 'bg-cyan-500',
    tagline: 'Seeing past your own blind spots.',
    checkpoints: [
      { idea: 'Cognitive biases are systematic errors in thinking that affect everyone — including smart people. The "confirmation bias" means you naturally seek information that confirms what you already believe, filtering out everything else.' },
      { idea: 'Empathy isn\'t just "being nice" — it\'s a measurable cognitive skill. Research shows people with higher empathy make better team decisions, have lower conflict rates, and are more trusted by others.' },
      { idea: 'Plato\'s "Allegory of the Cave" describes people mistaking shadows for reality. The modern equivalent: social media algorithms show you a curated version of the world designed to trigger emotional reactions, not inform you.' },
      { idea: 'The brain doesn\'t store memories like a video recording — it reconstructs them each time you recall them, influenced by your current mood and beliefs. Eyewitness testimony is unreliable for this exact reason.' },
    ],
  },
  {
    level: 3, title: 'The Reasoner',
    color: 'from-cyan-400 to-blue-500', ring: 'ring-blue-400', dot: 'bg-blue-500',
    tagline: 'Logic, ethics, and the architecture of good decisions.',
    checkpoints: [
      { idea: 'There are three main ethical frameworks: Consequentialism (judge by outcomes), Deontology (judge by the rule or duty), and Virtue Ethics (judge by character). Most real dilemmas can\'t be solved cleanly by just one — which is exactly why they\'re hard.' },
      { idea: 'Aristotle\'s concept of "phronesis" (practical wisdom) is the ability to do the right thing in the right way at the right time — not just knowing what\'s right in theory. It\'s a skill built through practice, not something you\'re born with.' },
      { idea: 'Dopamine isn\'t released when you get a reward — it spikes in anticipation of it. This is why social media is addictive: the variable reward (will this post get likes?) creates a dopamine loop that keeps you checking.' },
      { idea: 'Integrity is not just honesty — it\'s consistency between your values, your words, and your actions even when no one is watching. Research on moral identity shows that people who think of themselves as ethical are more likely to act ethically under pressure.' },
    ],
  },
];

export default function Journey() {
  const [user, setUser] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: progressList, isLoading } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const progress = progressList?.[0];
  const curriculumLevel = progress?.curriculum_level || 1;
  const isComplete = curriculumLevel > 3;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  if (isComplete) return <CongratsPage progress={progress} />;

  const activeLevelData = activeLevel ? LEVEL_DATA.find(l => l.level === activeLevel) : null;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">Your Journey</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tap any level to see the big ideas</p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-3 mb-6 flex items-center justify-around shadow-sm"
        >
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">{Math.min(curriculumLevel, 3)}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{progress?.k_score || 0}</div>
            <div className="text-xs text-muted-foreground">ME-Score</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl font-bold text-amber-500">{progress?.xp || 0}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl font-bold text-orange-500">{progress?.streak_days || 0}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </motion.div>

        {/* Path */}
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border z-0" />

          <div className="space-y-2">
            {LEVEL_DATA.map((lvl, index) => {
              const isUnlocked = curriculumLevel >= lvl.level;
              const isCurrent = curriculumLevel === lvl.level;
              const isCompleted = curriculumLevel > lvl.level;

              return (
                <motion.div
                  key={lvl.level}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative flex items-center gap-3 z-10"
                >
                  {/* Node */}
                  <button
                    onClick={() => setActiveLevel(activeLevel === lvl.level ? null : lvl.level)}
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all
                      ${isCompleted ? `bg-gradient-to-br ${lvl.color}` : ''}
                      ${isCurrent ? `bg-gradient-to-br ${lvl.color} ring-4 ring-offset-2 ring-offset-background ${lvl.ring}` : ''}
                      ${!isUnlocked ? 'bg-card border-2 border-border' : ''}
                    `}
                  >
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                    {isCurrent && <span className="text-sm font-bold text-white">{lvl.level}</span>}
                    {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {/* Row card */}
                  <button
                    onClick={() => setActiveLevel(activeLevel === lvl.level ? null : lvl.level)}
                    className={`flex-1 flex items-center justify-between rounded-2xl px-4 py-3 border transition-all text-left
                      ${isCurrent ? 'bg-card border-border shadow-sm' : ''}
                      ${isCompleted ? 'bg-card border-border' : ''}
                      ${!isUnlocked ? 'bg-card/60 border-border' : ''}
                    `}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          Level {lvl.level}
                        </span>
                        {isCurrent && <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold animate-pulse">← here</span>}
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
                      </div>
                      <p className={`text-sm font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {lvl.title}
                      </p>
                      <p className={`text-xs ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                        {lvl.tagline}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${isUnlocked ? 'text-muted-foreground bg-muted' : 'text-muted-foreground/60 bg-muted'}`}>
                      {lvl.checkpoints.length} ideas
                    </span>
                  </button>
                </motion.div>
              );
            })}

            {/* Trophy end node */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="relative flex items-center gap-3 z-10"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md
                ${isComplete ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-card border-2 border-border'}
              `}>
                <Trophy className={`w-5 h-5 ${isComplete ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <div className={`flex-1 rounded-2xl px-4 py-3 border ${isComplete ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' : 'bg-card/60 border-border'}`}>
                <p className={`text-sm font-semibold ${isComplete ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>Grand Master</p>
                <p className={`text-xs ${isComplete ? 'text-amber-500 dark:text-amber-500' : 'text-muted-foreground'}`}>Complete all 3 levels</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Continue CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
          <Link
            to="/Lessons"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center font-semibold text-base shadow-lg"
          >
            Continue Level {Math.min(curriculumLevel, 3)} →
          </Link>
        </motion.div>
      </div>

      {/* Checkpoint drawer — slides up from bottom */}
      <AnimatePresence>
        {activeLevelData && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLevel(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl pb-10 max-h-[75vh] overflow-y-auto"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2.5rem)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>

              {/* Header */}
              <div className={`mx-4 mt-2 mb-4 rounded-2xl p-4 bg-gradient-to-r ${activeLevelData.color} flex items-center justify-between`}>
                <div>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">Level {activeLevelData.level}</p>
                  <h2 className="text-white text-xl font-bold">{activeLevelData.title}</h2>
                  <p className="text-white/90 text-sm mt-0.5 font-medium">"{activeLevelData.tagline}"</p>
                </div>
                <button onClick={() => setActiveLevel(null)} className="p-1.5 rounded-full bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Checkpoints */}
              <div className="px-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Key Ideas</p>
                {activeLevelData.checkpoints.map((cp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 bg-muted rounded-2xl px-4 py-3 border border-border"
                  >
                    <p className="text-sm text-foreground font-medium leading-snug">{cp.idea}</p>
                  </motion.div>
                ))}

                {/* CTA if current level */}
                {curriculumLevel === activeLevelData.level && (
                  <Link
                    to="/Lessons"
                    onClick={() => setActiveLevel(null)}
                    className={`mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r ${activeLevelData.color} text-white font-semibold text-sm shadow-sm`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Start Level {activeLevelData.level}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CongratsPage({ progress }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center pb-24 px-4">
      <div className="max-w-lg w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-6 mx-auto">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-4xl font-bold text-white mb-2">You Did It!</h1>
          <p className="text-amber-400 text-xl font-semibold mb-6">ME-Score Grand Master</p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-8">
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              You've completed all 3 levels. Through philosophy, neuroscience, ethics, and self-reflection, you've trained your mind in the five pillars of human excellence.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300">{progress?.k_score || 0}</div>
                <div className="text-xs text-white/60">ME-Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-300">{(progress?.completed_lessons?.length || 0) + (progress?.completed_dilemmas?.length || 0) + (progress?.completed_challenges?.length || 0)}</div>
                <div className="text-xs text-white/60">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{progress?.level || 1}</div>
                <div className="text-xs text-white/60">XP Level</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 mb-8">
            {[
              { label: 'Logic', score: progress?.logic_score || 0, color: 'bg-blue-500' },
              { label: 'Empathy', score: progress?.empathy_score || 0, color: 'bg-pink-500' },
              { label: 'Discipline', score: progress?.discipline_score || 0, color: 'bg-orange-500' },
              { label: 'Emotional Regulation', score: progress?.emotional_regulation_score || 0, color: 'bg-violet-500' },
              { label: 'Integrity', score: progress?.integrity_score || 0, color: 'bg-emerald-500' },
            ].map(skill => (
              <div key={skill.label} className="flex items-center gap-3">
                <span className="text-white/70 text-xs w-28 text-left">{skill.label}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.score / 200) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${skill.color}`}
                  />
                </div>
                <span className="text-white/60 text-xs w-8 text-right">{skill.score}</span>
              </div>
            ))}
          </div>
          <Link to="/Home" className="block w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-center font-bold text-base shadow-lg">
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
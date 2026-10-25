import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollView from '@/components/shared/ScrollView';
import { Scale, Loader2, CheckCircle2, Lock, ChevronDown } from 'lucide-react';
import SearchAndFilter from '@/components/shared/SearchAndFilter';
import DilemmaCard from '@/components/dilemmas/DilemmaCard';
import DilemmaModal from '@/components/dilemmas/DilemmaModal';
import LevelProgressBar from '@/components/curriculum/LevelProgressBar';
import { computeCurriculumLevel } from '@/components/curriculum/curriculumUtils';
import { computeKScore } from '@/lib/progressUtils';
import DailyLimitBanner from '@/components/shared/DailyLimitBanner';
import { isAtDailyLimit, buildDailyCountUpdate, getDailyCount, DAILY_LIMIT } from '@/components/shared/dailyLimit';
import { computeStreak, getLocalDateString } from '@/lib/progressUtils';
import LevelUnlockCelebration from '@/components/shared/LevelUnlockCelebration';

export default function Dilemmas() {
  const [user, setUser] = useState(null);
  const [selectedDilemma, setSelectedDilemma] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [celebrateLevel, setCelebrateLevel] = useState(null);
  const [showPreviousLevels, setShowPreviousLevels] = useState(false);

  const prevDilemmaLevelRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: dilemmas, isLoading: dilemmasLoading } = useQuery({
    queryKey: ['dilemmas'],
    queryFn: () => base44.entities.Dilemma.list(),
  });

  const { data: allLessons } = useQuery({ queryKey: ['lessons'], queryFn: () => base44.entities.Lesson.list('order') });
  const { data: allChallenges } = useQuery({ queryKey: ['challenges'], queryFn: () => base44.entities.Challenge.list() });

  const { data: progressList } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const progress = progressList?.[0];
  const completedDilemmas = progress?.completed_dilemmas || [];
  const completedLessons = progress?.completed_lessons || [];
  const completedChallenges = progress?.completed_challenges || [];
  const dailyDilemmasCount = getDailyCount(progress, 'dilemmas');
  const dilemmasLimitReached = isAtDailyLimit(progress, 'dilemmas', user?.email);

  const dilemmaAnalyses = progress?.dilemma_analyses || [];

  const updateProgressMutation = useMutation({
    mutationFn: async ({ dilemma, choice, xpMultiplier = 1, analysis }) => {
      if (!progress) {
        const si = choice.score_impacts || {};
        const iLogic = Math.max(0, si.logic || 0);
        const iEmpathy = Math.max(0, si.empathy || 0);
        const iDiscipline = Math.max(0, si.discipline || 0);
        const iEmReg = Math.max(0, si.emotional_regulation || 0);
        const iIntegrity = Math.max(0, si.integrity || 0);
        const initialData = {
          completed_dilemmas: [dilemma.id],
          dilemma_analyses: analysis ? [{ dilemma_id: dilemma.id, ...analysis, completed_at: new Date().toISOString() }] : [],
          k_score: iLogic + iEmpathy + iDiscipline + iEmReg + iIntegrity,
          logic_score: iLogic,
          empathy_score: iEmpathy,
          discipline_score: iDiscipline,
          emotional_regulation_score: iEmReg,
          integrity_score: iIntegrity,
          curriculum_level: 1,
          streak_days: 1,
          last_activity_date: getLocalDateString(),
          ...buildDailyCountUpdate(null, 'dilemmas'),
        };
        return base44.entities.UserProgress.create(initialData);
      }

      // Always merge from DB record to avoid overwriting progress from other sessions
      const dbCompletedLessons = progress.completed_lessons || [];
      const dbCompletedDilemmas = progress.completed_dilemmas || [];
      const dbCompletedChallenges = progress.completed_challenges || [];
      const dbAnalyses = progress.dilemma_analyses || [];

      const newCompletedDilemmas = dbCompletedDilemmas.includes(dilemma.id)
        ? dbCompletedDilemmas
        : [...dbCompletedDilemmas, dilemma.id];
      const newAnalyses = analysis && !dbAnalyses.some(a => a.dilemma_id === dilemma.id)
        ? [...dbAnalyses, { dilemma_id: dilemma.id, ...analysis, completed_at: new Date().toISOString() }]
        : dbAnalyses;

      const scoreImpacts = choice.score_impacts || {};

      const newLogic = Math.max(0, (progress.logic_score || 0) + (scoreImpacts.logic || 0));
      const newEmpathy = Math.max(0, (progress.empathy_score || 0) + (scoreImpacts.empathy || 0));
      const newDiscipline = Math.max(0, (progress.discipline_score || 0) + (scoreImpacts.discipline || 0));
      const newEmotionalReg = Math.max(0, (progress.emotional_regulation_score || 0) + (scoreImpacts.emotional_regulation || 0));
      const newIntegrity = Math.max(0, (progress.integrity_score || 0) + (scoreImpacts.integrity || 0));

      const newCurriculumLevel = computeCurriculumLevel({
        currentCurriculumLevel: progress.curriculum_level || 1,
        allLessons,
        allDilemmas: dilemmas,
        allChallenges,
        completedLessons: dbCompletedLessons,
        completedDilemmas: newCompletedDilemmas,
        completedChallenges: dbCompletedChallenges,
      });

      const newKScore = computeKScore(newLogic, newEmpathy, newDiscipline, newEmotionalReg, newIntegrity);

      const streakUpdate = computeStreak(progress.last_activity_date, progress.streak_days);

      const updateData = {
        completed_lessons: dbCompletedLessons,
        completed_dilemmas: newCompletedDilemmas,
        completed_challenges: dbCompletedChallenges,
        dilemma_analyses: newAnalyses,
        k_score: newKScore,
        logic_score: newLogic,
        empathy_score: newEmpathy,
        discipline_score: newDiscipline,
        emotional_regulation_score: newEmotionalReg,
        integrity_score: newIntegrity,
        curriculum_level: newCurriculumLevel,
        ...streakUpdate,
        ...buildDailyCountUpdate(progress, 'dilemmas'),
      };

      return base44.entities.UserProgress.update(progress.id, updateData);
    },
    onMutate: async ({ dilemma, choice, xpMultiplier = 1, analysis }) => {
      await queryClient.cancelQueries({ queryKey: ['userProgress'] });
      const previousProgress = queryClient.getQueryData(['userProgress', user?.email]);

      queryClient.setQueryData(['userProgress', user?.email], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map(p => {
          if (p.created_by !== user?.email) return p;
          const scoreImpacts = choice.score_impacts || {};

          const newLogic = Math.max(0, (p.logic_score || 0) + (scoreImpacts.logic || 0));
          const newEmpathy = Math.max(0, (p.empathy_score || 0) + (scoreImpacts.empathy || 0));
          const newDiscipline = Math.max(0, (p.discipline_score || 0) + (scoreImpacts.discipline || 0));
          const newEmotionalReg = Math.max(0, (p.emotional_regulation_score || 0) + (scoreImpacts.emotional_regulation || 0));
          const newIntegrity = Math.max(0, (p.integrity_score || 0) + (scoreImpacts.integrity || 0));
          const newCurriculumLevel = Math.max(
            p.curriculum_level || 1,
            computeCurriculumLevel({
              currentCurriculumLevel: p.curriculum_level || 1,
              allLessons,
              allDilemmas: dilemmas,
              allChallenges,
              completedLessons: p.completed_lessons || [],
              completedDilemmas: [...(p.completed_dilemmas || []), dilemma.id],
              completedChallenges: p.completed_challenges || [],
            })
          );

          const newKScore = computeKScore(newLogic, newEmpathy, newDiscipline, newEmotionalReg, newIntegrity);

          const streakUpdate = computeStreak(p.last_activity_date, p.streak_days);

          return {
            ...p,
            completed_dilemmas: [...(p.completed_dilemmas || []), dilemma.id],
            dilemma_analyses: analysis ? [...(p.dilemma_analyses || []), { dilemma_id: dilemma.id, ...analysis, completed_at: new Date().toISOString() }] : p.dilemma_analyses,
            k_score: newKScore,
            logic_score: newLogic,
            empathy_score: newEmpathy,
            discipline_score: newDiscipline,
            emotional_regulation_score: newEmotionalReg,
            integrity_score: newIntegrity,
            curriculum_level: newCurriculumLevel,
            ...streakUpdate,
            ...buildDailyCountUpdate(p, 'dilemmas'),
          };
        });
      });

      return { previousProgress };
    },
    onError: (err, variables, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(['userProgress', user?.email], context.previousProgress);
      }
    },
    onSuccess: () => {
      setSelectedDilemma(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });

  // Always use the stored DB level — never derive it from content queries on render
  const curriculumLevel = progress?.curriculum_level || 1;
  const allLevels = Array.from({ length: 3 }, (_, i) => i + 1);

  const getDilemmasForLevel = (lvl) =>
    (dilemmas || []).filter(d => (d.curriculum_level || 1) === lvl);

  const DILEMMA_TAGS = [
    { value: 'all', label: 'All', emoji: '' },
    { value: 'personal', label: 'Personal', emoji: '👤' },
    { value: 'professional', label: 'Work / Academic', emoji: '💼' },
    { value: 'social', label: 'Social', emoji: '🤝' },
    { value: 'existential', label: 'Existential', emoji: '🌌' },
    { value: 'beginner', label: 'Beginner', emoji: '🌱' },
    { value: 'intermediate', label: 'Intermediate', emoji: '🔥' },
    { value: 'advanced', label: 'High Stakes', emoji: '⚡' },
  ];

  const matchesSearch = (d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.scenario?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q) ||
      d.difficulty?.toLowerCase().includes(q) ||
      (d.choices || []).some(c =>
        c.philosopher?.toLowerCase().includes(q) ||
        c.philosophy?.toLowerCase().includes(q)
      )
    );
  };

  const matchesTag = (d) => {
    if (activeTag === 'all') return true;
    return d.category === activeTag || d.difficulty === activeTag;
  };

  const filterDilemma = (d) => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    return matchesSearch(d) && matchesTag(d);
  };

  // Compute the dilemma-specific level: which level the user is currently on for dilemmas only
  // Start at 1, advance only when ALL dilemmas in a level are completed
  const computeDilemmaLevel = () => {
    if (!dilemmas) return 1;
    let lvl = 1;
    while (lvl < 3) {
      const inLevel = dilemmas.filter(d => (d.curriculum_level || 1) === lvl);
      if (inLevel.length === 0) { lvl++; continue; }
      const allDone = inLevel.every(d => completedDilemmas.includes(d.id));
      if (allDone) { lvl++; } else { break; }
    }
    return lvl;
  };
  const dilemmaLevel = computeDilemmaLevel();

  const LEVEL_META = {
    1: 'Level 1 — Foundations',
    2: 'Level 2 — Complexity & Stakes',
    3: 'Level 3 — Advanced Ethics',
  };

  const currentLevelDilemmas = getDilemmasForLevel(dilemmaLevel);
  const dilemmasCompletedInLevel = currentLevelDilemmas.filter(d => completedDilemmas.includes(d.id)).length;
  const dilemmasTotalInLevel = currentLevelDilemmas.length;
  const levelDone = dilemmasTotalInLevel > 0 && dilemmasCompletedInLevel === dilemmasTotalInLevel;

  // Detect level advancement and trigger celebration only once per level-up (persisted across mounts)
  useEffect(() => {
    if (!dilemmas || !user?.email) return;
    const storageKey = `dilemma_celebrated_level_${user.email}`;
    const celebratedLevel = parseInt(localStorage.getItem(storageKey) || '0', 10);

    if (prevDilemmaLevelRef.current === null) {
      // First mount — seed the ref from current level, no celebration
      prevDilemmaLevelRef.current = dilemmaLevel;
      // If localStorage is behind reality, sync it up silently
      if (celebratedLevel < dilemmaLevel) {
        localStorage.setItem(storageKey, String(dilemmaLevel));
      }
      return;
    }

    if (dilemmaLevel > prevDilemmaLevelRef.current && dilemmaLevel > celebratedLevel) {
      setCelebrateLevel(dilemmaLevel);
      localStorage.setItem(storageKey, String(dilemmaLevel));
    }
    prevDilemmaLevelRef.current = dilemmaLevel;
  }, [dilemmaLevel, dilemmas, user?.email]);

  if (dilemmasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <ScrollView className="min-h-screen">
      <div className="bg-gradient-to-br from-background via-emerald-50/20 dark:via-emerald-950/10 to-muted">
        <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Ethical Dilemmas</h1>
              <p className="text-muted-foreground text-sm">Train your moral reasoning</p>
            </div>

          </div>
        </motion.div>

        {/* Daily Limit */}
        {dilemmasLimitReached && (
          <DailyLimitBanner type="dilemmas" completed={dailyDilemmasCount} limit={DAILY_LIMIT} />
        )}
        {!dilemmasLimitReached && (
          <div className="flex items-center justify-end mb-3 -mt-2">
            <span className="text-xs text-muted-foreground">{dailyDilemmasCount}/{DAILY_LIMIT} dilemmas today</span>
          </div>
        )}

        {/* Search + Tag filter */}
        <SearchAndFilter
          search={search}
          onSearch={setSearch}
          tags={DILEMMA_TAGS}
          activeTag={activeTag}
          onTagChange={setActiveTag}
        />

        {/* Empty search state */}
        {search.trim() && allLevels.every(lvl => getDilemmasForLevel(lvl).filter(filterDilemma).length === 0) && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No dilemmas match "<span className="font-semibold text-foreground">{search}</span>"
          </div>
        )}

        {/* Previous levels toggle */}
        {dilemmaLevel > 1 && !search.trim() && activeTag === 'all' && (
          <div className="mb-4">
            <button
              onClick={() => setShowPreviousLevels(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-dashed border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-medium text-muted-foreground mb-2"
            >
              <span>View completed levels (1–{dilemmaLevel - 1})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPreviousLevels ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showPreviousLevels && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="space-y-4 mt-2">
                    {allLevels.filter(l => l < dilemmaLevel).map(lvl => {
                      const lvlDilemmas = getDilemmasForLevel(lvl);
                      if (lvlDilemmas.length === 0) return null;
                      return (
                        <div key={lvl} className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
                          <div className="px-4 py-2.5 bg-emerald-100/60 dark:bg-emerald-950/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-semibold text-foreground">{LEVEL_META[lvl] || `Level ${lvl}`}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{lvlDilemmas.length}/{lvlDilemmas.length} ✓</span>
                          </div>
                          <div className="p-3 space-y-3">
                            {lvlDilemmas.map(dilemma => (
                              <DilemmaCard key={dilemma.id} dilemma={dilemma} completed={true} onClick={() => setSelectedDilemma(dilemma)} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Level-separated dilemma sections */}
        <div className="space-y-6">
          {allLevels.filter(lvl => lvl >= dilemmaLevel).map(lvl => {
            const lvlDilemmas = getDilemmasForLevel(lvl);
            if (lvlDilemmas.length === 0) return null;
            const levelItems = lvlDilemmas.filter(filterDilemma);

            const isUnlocked = lvl <= dilemmaLevel;
            const isCompleted = lvl < dilemmaLevel;
            const isCurrent = lvl === dilemmaLevel;
            const completedCount = lvlDilemmas.filter(d => completedDilemmas.includes(d.id)).length;
            const totalCount = lvlDilemmas.length;
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const title = LEVEL_META[lvl] || `Level ${lvl}`;

            // In search mode, skip empty levels
            if ((search.trim() || activeTag !== 'all') && levelItems.length === 0) return null;

            return (
              <motion.div
                key={lvl}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (lvl - 1) * 0.05 }}
                className={`rounded-2xl border overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isCurrent
                    ? 'border-border bg-card shadow-sm'
                    : 'border-dashed border-border bg-muted/30'
                }`}
              >
                {/* Level header */}
                <div className={`px-4 py-3 flex items-center justify-between ${
                  isCompleted ? 'bg-emerald-100/60 dark:bg-emerald-950/40' : isCurrent ? 'bg-muted/50' : 'bg-muted/20'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
                      {isCompleted && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Completed</div>}
                      {isCurrent && <div className="text-xs text-muted-foreground">{completedCount}/{totalCount} dilemmas done</div>}
                      {!isUnlocked && <div className="text-xs text-muted-foreground">Complete Level {lvl - 1} to unlock</div>}
                    </div>
                  </div>
                  {isCurrent && totalCount > 0 && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      {pct}%
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {totalCount}/{totalCount} ✓
                    </span>
                  )}
                </div>

                {/* Progress bar for current level */}
                {isCurrent && totalCount > 0 && (
                  <div className="h-1 bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                  </div>
                )}

                {/* Dilemma list */}
                {isUnlocked ? (
                  <div className="p-3 space-y-3">
                    {(search.trim() || activeTag !== 'all' ? levelItems : lvlDilemmas).map((dilemma, index) => (
                      <motion.div key={dilemma.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                        <DilemmaCard
                          dilemma={dilemma}
                          completed={completedDilemmas.includes(dilemma.id)}
                          onClick={(!completedDilemmas.includes(dilemma.id) && dilemmasLimitReached) ? undefined : () => setSelectedDilemma(dilemma)}
                          dimmed={!completedDilemmas.includes(dilemma.id) && dilemmasLimitReached}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-center">
                    <Lock className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Complete all Level {lvl - 1} dilemmas to unlock</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Level Unlock Celebration */}
      <LevelUnlockCelebration
        show={!!celebrateLevel}
        unlockedLevel={celebrateLevel}
        onDone={() => setCelebrateLevel(null)}
      />

      {/* Modal */}
      <AnimatePresence>
        {selectedDilemma && (
          <DilemmaModal
            dilemma={selectedDilemma}
            onClose={() => setSelectedDilemma(null)}
            onComplete={(dilemma, choice, analysis, totalRounds) => updateProgressMutation.mutate({ dilemma, choice, xpMultiplier: totalRounds, analysis })}
            savedAnalysis={completedDilemmas.includes(selectedDilemma.id)
              ? dilemmaAnalyses.find(a => a.dilemma_id === selectedDilemma.id)
              : null}
          />
        )}
      </AnimatePresence>
      </div>
    </ScrollView>
  );
}
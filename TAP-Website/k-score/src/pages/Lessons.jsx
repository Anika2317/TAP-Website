import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Lock, ChevronDown } from 'lucide-react';
import SearchAndFilter from '@/components/shared/SearchAndFilter';
import LessonCard from '@/components/lessons/LessonCard';
import LessonModal from '@/components/lessons/LessonModal';
import LevelProgressBar from '@/components/curriculum/LevelProgressBar';
import { computeCurriculumLevel, isGlobalLevelUnlocked } from '@/components/curriculum/curriculumUtils';
import { computeKScore } from '@/lib/progressUtils';
import DailyLimitBanner from '@/components/shared/DailyLimitBanner';
import { isAtDailyLimit, buildDailyCountUpdate, getDailyCount, DAILY_LIMIT } from '@/components/shared/dailyLimit';
import ScrollView from '@/components/shared/ScrollView';
import { computeStreak, getLocalDateString } from '@/lib/progressUtils';

export default function Lessons() {
  const [user, setUser] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('neuroscience');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [showPreviousLevels, setShowPreviousLevels] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.list('order'),
    staleTime: 0,
  });

  const { data: allDilemmas } = useQuery({ queryKey: ['dilemmas'], queryFn: () => base44.entities.Dilemma.list() });
  const { data: allChallenges } = useQuery({ queryKey: ['challenges'], queryFn: () => base44.entities.Challenge.list() });

  const { data: progressList } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const progress = progressList?.[0];
  const completedLessons = progress?.completed_lessons || [];
  const completedDilemmas = progress?.completed_dilemmas || [];
  const completedChallenges = progress?.completed_challenges || [];
  const dailyLessonsCount = getDailyCount(progress, 'lessons');
  const lessonsLimitReached = isAtDailyLimit(progress, 'lessons', user?.email);

  const lessonReflections = progress?.lesson_reflections || [];

  const updateProgressMutation = useMutation({
    mutationFn: async ({ lesson, scoreBoost, reflection, depthLabel }) => {
      if (!progress) {
        const boost0 = scoreBoost ?? 5;
        const initLogic = lesson.primary_skill === 'logic' ? boost0 : 0;
        const initEmpathy = lesson.primary_skill === 'empathy' ? boost0 : 0;
        const initDiscipline = lesson.primary_skill === 'discipline' ? boost0 : 0;
        const initEmotionalReg = lesson.primary_skill === 'emotional_regulation' ? boost0 : 0;
        const initIntegrity = lesson.primary_skill === 'integrity' ? boost0 : 0;
        const initialData = {
          completed_lessons: [lesson.id],
          lesson_reflections: [{
            lesson_id: lesson.id,
            reflection: reflection || '',
            depth_label: depthLabel || '',
            completed_at: new Date().toISOString(),
          }],
          k_score: computeKScore(initLogic, initEmpathy, initDiscipline, initEmotionalReg, initIntegrity),
          logic_score: initLogic,
          empathy_score: initEmpathy,
          discipline_score: initDiscipline,
          emotional_regulation_score: initEmotionalReg,
          integrity_score: initIntegrity,
          curriculum_level: 1,
          streak_days: 1,
          last_activity_date: getLocalDateString(),
          ...buildDailyCountUpdate(null, 'lessons'),
        };
        return base44.entities.UserProgress.create(initialData);
      }

      // Always merge from DB record to avoid overwriting progress from other sessions
      const dbCompletedLessons = progress.completed_lessons || [];
      const dbCompletedDilemmas = progress.completed_dilemmas || [];
      const dbCompletedChallenges = progress.completed_challenges || [];
      const dbReflections = progress.lesson_reflections || [];

      const newCompletedLessons = dbCompletedLessons.includes(lesson.id)
        ? dbCompletedLessons
        : [...dbCompletedLessons, lesson.id];
      const newReflections = dbReflections.some(r => r.lesson_id === lesson.id)
        ? dbReflections
        : [...dbReflections, {
            lesson_id: lesson.id,
            reflection: reflection || '',
            depth_label: depthLabel || '',
            completed_at: new Date().toISOString(),
          }];
      const skillKey = lesson.primary_skill ? `${lesson.primary_skill}_score` : null;
      const boost = scoreBoost ?? 5;
      const newSkillScore = skillKey ? (progress[skillKey] || 0) + boost : null;

      const newCurriculumLevel = computeCurriculumLevel({
        currentCurriculumLevel: progress.curriculum_level || 1,
        allLessons: lessons,
        allDilemmas,
        allChallenges,
        completedLessons: newCompletedLessons,
        completedDilemmas: dbCompletedDilemmas,
        completedChallenges: dbCompletedChallenges,
      });

      const newLogic = (progress.logic_score || 0) + (skillKey === 'logic_score' ? boost : 0);
      const newEmpathy = (progress.empathy_score || 0) + (skillKey === 'empathy_score' ? boost : 0);
      const newDiscipline = (progress.discipline_score || 0) + (skillKey === 'discipline_score' ? boost : 0);
      const newEmotionalReg = (progress.emotional_regulation_score || 0) + (skillKey === 'emotional_regulation_score' ? boost : 0);
      const newIntegrity = (progress.integrity_score || 0) + (skillKey === 'integrity_score' ? boost : 0);
      const newKScore = computeKScore(newLogic, newEmpathy, newDiscipline, newEmotionalReg, newIntegrity);

      const streakUpdate = computeStreak(progress.last_activity_date, progress.streak_days);

      const updateData = {
        completed_lessons: newCompletedLessons,
        completed_dilemmas: dbCompletedDilemmas,
        completed_challenges: dbCompletedChallenges,
        lesson_reflections: newReflections,
        k_score: newKScore,
        logic_score: newLogic,
        empathy_score: newEmpathy,
        discipline_score: newDiscipline,
        emotional_regulation_score: newEmotionalReg,
        integrity_score: newIntegrity,
        curriculum_level: newCurriculumLevel,
        ...streakUpdate,
        ...buildDailyCountUpdate(progress, 'lessons'),
      };

      return base44.entities.UserProgress.update(progress.id, updateData);
    },
    onMutate: async ({ lesson, scoreBoost, reflection, depthLabel }) => {
      await queryClient.cancelQueries({ queryKey: ['userProgress'] });
      const previousProgress = queryClient.getQueryData(['userProgress', user?.email]);

      queryClient.setQueryData(['userProgress', user?.email], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map(p => {
          if (p.created_by !== user?.email) return p;
          const newCompletedLessons = [...(p.completed_lessons || []), lesson.id];
          const newReflections = [...(p.lesson_reflections || []), {
            lesson_id: lesson.id,
            reflection: reflection || '',
            depth_label: depthLabel || '',
            completed_at: new Date().toISOString(),
          }];

          const skillKey = lesson.primary_skill ? `${lesson.primary_skill}_score` : null;
          const boost = scoreBoost ?? 5;

          const newCurriculumLevel = Math.max(
            p.curriculum_level || 1,
            computeCurriculumLevel({
              currentCurriculumLevel: p.curriculum_level || 1,
              allLessons: lessons,
              allDilemmas,
              allChallenges,
              completedLessons: newCompletedLessons,
              completedDilemmas: p.completed_dilemmas || [],
              completedChallenges: p.completed_challenges || [],
            })
          );

          const newLogic = (p.logic_score || 0) + (skillKey === 'logic_score' ? boost : 0);
          const newEmpathy = (p.empathy_score || 0) + (skillKey === 'empathy_score' ? boost : 0);
          const newDiscipline = (p.discipline_score || 0) + (skillKey === 'discipline_score' ? boost : 0);
          const newEmotionalReg = (p.emotional_regulation_score || 0) + (skillKey === 'emotional_regulation_score' ? boost : 0);
          const newIntegrity = (p.integrity_score || 0) + (skillKey === 'integrity_score' ? boost : 0);
          const newKScore = computeKScore(newLogic, newEmpathy, newDiscipline, newEmotionalReg, newIntegrity);
          const streakUpdate = computeStreak(p.last_activity_date, p.streak_days);

          return {
            ...p,
            completed_lessons: newCompletedLessons,
            lesson_reflections: newReflections,
            k_score: newKScore,
            logic_score: newLogic,
            empathy_score: newEmpathy,
            discipline_score: newDiscipline,
            emotional_regulation_score: newEmotionalReg,
            integrity_score: newIntegrity,
            curriculum_level: newCurriculumLevel,
            ...streakUpdate,
            ...buildDailyCountUpdate(p, 'lessons'),
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
      setSelectedLesson(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });

  const allLevels = Array.from({ length: 3 }, (_, i) => i + 1);

  const LEVEL_META = {
    1: { title: 'Foundations of the Brain', neuroTitle: 'Level 1 — Foundations', philoTitle: 'Level 1 — Foundations' },
    2: { title: 'Behaviour & Social Neuroscience', neuroTitle: 'Level 2 — Behaviour & Emotion', philoTitle: 'Level 2 — Applied Thinking' },
    3: { title: 'Identity & Advanced Cognition', neuroTitle: 'Level 3 — Identity & Cognition', philoTitle: 'Level 3 — Advanced Ethics' },
  };

  const getLessonsForLevel = (lvl) =>
    (lessons || []).filter(l => (l.curriculum_level || 1) === lvl && l.section !== 'literary_masters' && l.category !== 'neuroscience');

  const getNeuroscienceForLevel = (lvl) =>
    (lessons || []).filter(l => (l.curriculum_level || 1) === lvl && l.category === 'neuroscience');

  const LESSON_TAGS = [
    { value: 'all', label: 'All', emoji: '' },
    { value: 'neuroscience', label: 'Neuroscience', emoji: '🔬' },
    { value: 'philosophy', label: 'Philosophy', emoji: '🏛️' },
  ];

  const isSearching = search.trim() !== '' || activeTag !== 'all';

  const matchesSearch = (lesson) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      lesson.title?.toLowerCase().includes(q) ||
      lesson.thinker?.toLowerCase().includes(q) ||
      lesson.key_insight?.toLowerCase().includes(q) ||
      lesson.category?.toLowerCase().includes(q)
    );
  };

  const matchesTag = (lesson) => {
    if (activeTag === 'all') return true;
    if (activeTag === 'neuroscience') return lesson.category === 'neuroscience';
    if (activeTag === 'philosophy') return lesson.category !== 'neuroscience' && lesson.section !== 'literary_masters';
    return true;
  };

  // Always returns ALL lessons for a level regardless of active tab
  const getAllLessonsForLevel = (lvl) =>
    (lessons || []).filter(l => (l.curriculum_level || 1) === lvl);

  // Compute lesson-specific level: advance only when ALL lessons in a level are completed
  const computeLessonLevel = () => {
    if (!lessons) return 1;
    let lvl = 1;
    while (lvl < 3) {
      const inLevel = (lessons || []).filter(l => (l.curriculum_level || 1) === lvl && l.section !== 'literary_masters');
      if (inLevel.length === 0) { lvl++; continue; }
      const allDone = inLevel.every(l => completedLessons.includes(l.id));
      if (allDone) { lvl++; } else { break; }
    }
    return lvl;
  };
  const lessonLevel = computeLessonLevel();

  // Per-tab counts for the progress bar — only count lessons visible in the active tab
  const currentTabLessonsInLevel = isSearching
    ? (lessons || []).filter(l => (l.curriculum_level || 1) === lessonLevel && l.section !== 'literary_masters')
    : (activeTab === 'neuroscience'
        ? (lessons || []).filter(l => (l.curriculum_level || 1) === lessonLevel && l.category === 'neuroscience')
        : (lessons || []).filter(l => (l.curriculum_level || 1) === lessonLevel && l.category !== 'neuroscience' && l.section !== 'literary_masters'));

  const lessonsCompletedInLevel = currentTabLessonsInLevel.filter(l => completedLessons.includes(l.id)).length;
  const lessonsTotalInLevel = currentTabLessonsInLevel.length;
  const levelLessonsDone = lessonsTotalInLevel > 0 && lessonsCompletedInLevel === lessonsTotalInLevel;

  if (lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  const tabConfig = {
    neuroscience: { label: 'Neuroscience', getLessons: getNeuroscienceForLevel },
    philosophy: { label: 'Philosophy', getLessons: getLessonsForLevel },
  };

  const currentTab = tabConfig[activeTab];

  return (
    <ScrollView className="min-h-screen">
      <div className="bg-background">
        <div className="max-w-lg mx-auto px-4 pt-6 pb-24">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
            <span className="text-xs text-muted-foreground bg-card border border-border px-2.5 py-1 rounded-full">
              {dailyLessonsCount}/{DAILY_LIMIT} today
            </span>
          </div>

          {/* Search + Tag filter */}
          <SearchAndFilter
            search={search}
            onSearch={setSearch}
            tags={LESSON_TAGS}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />

          {/* Tab switcher — hidden during search */}
          <div className={`flex bg-muted rounded-2xl p-1 mb-5 ${isSearching ? 'hidden' : ''}`} role="tablist" aria-label="Lesson categories">
            {Object.entries(tabConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 ${
                  activeTab === key ? 'bg-card text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-muted-foreground'
                }`}
                role="tab"
                aria-selected={activeTab === key}
                aria-label={`${cfg.label} lessons`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Daily Limit */}
          {lessonsLimitReached && (
            <DailyLimitBanner type="lessons" completed={dailyLessonsCount} limit={DAILY_LIMIT} />
          )}



          {isSearching ? (
            /* Unified search view across all sections */
            <div className="space-y-6">
              {allLevels.map(lvl => {
                const isUnlocked = lvl <= lessonLevel;
                const levelLessons = getAllLessonsForLevel(lvl).filter(l => matchesSearch(l) && matchesTag(l));
                if (levelLessons.length === 0) return null;
                return (
                  <div key={lvl}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                        Lvl {lvl}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {levelLessons.map(lesson => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          completed={completedLessons.includes(lesson.id)}
                          onClick={(!isUnlocked || (!completedLessons.includes(lesson.id) && lessonsLimitReached)) ? undefined : () => setSelectedLesson(lesson)}
                          dimmed={!isUnlocked || (!completedLessons.includes(lesson.id) && lessonsLimitReached)}
                          literary={lesson.section === 'literary_masters'}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {allLevels.every(lvl => getAllLessonsForLevel(lvl).filter(l => matchesSearch(l) && matchesTag(l)).length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No lessons match "<span className="font-semibold text-foreground">{search}</span>"
                </div>
              )}
            </div>
          ) : (
            /* Level-separated view — completed levels in dropdown, current+locked inline */
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                {/* Previous levels dropdown */}
                {lessonLevel > 1 && (
                  <div>
                    <button
                      onClick={() => setShowPreviousLevels(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-dashed border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-medium text-muted-foreground mb-2"
                    >
                      <span>View completed levels (1–{lessonLevel - 1})</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showPreviousLevels ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showPreviousLevels && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="space-y-4 mt-2">
                            {allLevels.filter(l => l < lessonLevel).map(lvl => {
                              const lvlLessons = currentTab.getLessons(lvl);
                              if (lvlLessons.length === 0) return null;
                              const meta = LEVEL_META[lvl] || {};
                              const levelTitle = activeTab === 'neuroscience' ? meta.neuroTitle : meta.philoTitle;
                              return (
                                <div key={lvl} className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
                                  <div className="px-4 py-2.5 bg-emerald-100/60 dark:bg-emerald-950/40 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-sm font-semibold text-foreground">{levelTitle}</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{lvlLessons.length}/{lvlLessons.length} ✓</span>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    {lvlLessons.map(lesson => (
                                      <LessonCard key={lesson.id} lesson={lesson} completed={true} onClick={() => setSelectedLesson(lesson)} literary={lesson.section === 'literary_masters'} />
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

                {allLevels.filter(lvl => lvl >= lessonLevel).map(lvl => {
                  const lvlLessons = currentTab.getLessons(lvl);
                  if (lvlLessons.length === 0) return null;

                  const isUnlocked = lvl <= lessonLevel;
                  const isCurrent = lvl === lessonLevel;
                  const completedCount = lvlLessons.filter(l => completedLessons.includes(l.id)).length;
                  const totalCount = lvlLessons.length;
                  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const meta = LEVEL_META[lvl] || {};
                  const levelTitle = activeTab === 'neuroscience' ? meta.neuroTitle : meta.philoTitle;

                  return (
                    <motion.div
                      key={lvl}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (lvl - 1) * 0.05 }}
                      className={`rounded-2xl border overflow-hidden ${
                        isCurrent
                          ? 'border-border bg-card shadow-sm'
                          : 'border-dashed border-border bg-muted/30'
                      }`}
                    >
                      {/* Level header */}
                      <div className={`px-4 py-3 flex items-center justify-between ${
                        isCurrent ? 'bg-muted/50' : 'bg-muted/20'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          {isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-foreground leading-tight">{levelTitle}</div>
                            {isCurrent && (
                              <div className="text-xs text-muted-foreground">{completedCount}/{totalCount} lessons done</div>
                            )}
                            {!isUnlocked && (
                              <div className="text-xs text-muted-foreground">Complete Level {lvl - 1} to unlock</div>
                            )}
                          </div>
                        </div>
                        {isCurrent && totalCount > 0 && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            {pct}%
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

                      {/* Lesson list */}
                      {isUnlocked ? (
                        <div className="p-3 space-y-2">
                          {lvlLessons.map(lesson => (
                            <LessonCard
                              key={lesson.id}
                              lesson={lesson}
                              completed={completedLessons.includes(lesson.id)}
                              onClick={(!completedLessons.includes(lesson.id) && lessonsLimitReached) ? undefined : () => setSelectedLesson(lesson)}
                              dimmed={!completedLessons.includes(lesson.id) && lessonsLimitReached}
                              literary={lesson.section === 'literary_masters'}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-5 text-center">
                          <Lock className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            Complete all Level {lvl - 1} lessons to unlock
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedLesson && (
            <LessonModal
              lesson={selectedLesson}
              onClose={() => setSelectedLesson(null)}
              onComplete={(lesson, { scoreBoost, xpOverride, reflection, depthLabel }) =>
                updateProgressMutation.mutate({ lesson, scoreBoost, xpOverride, reflection, depthLabel })}
              savedReflection={completedLessons.includes(selectedLesson.id)
                ? lessonReflections.find(r => r.lesson_id === selectedLesson.id)
                : null}
            />
          )}
        </AnimatePresence>
      </div>
    </ScrollView>
  );
}
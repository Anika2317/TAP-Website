import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ScrollView from '@/components/shared/ScrollView';
import { Target, Loader2, CheckCircle, CheckCircle2, Lock, ChevronDown } from 'lucide-react';
import LevelProgressBar from '@/components/curriculum/LevelProgressBar';
import { computeCurriculumLevel, isGlobalLevelUnlocked } from '@/components/curriculum/curriculumUtils';
import { computeKScore } from '@/lib/progressUtils';
import DailyLimitBanner from '@/components/shared/DailyLimitBanner';
import { isAtDailyLimit, buildDailyCountUpdate, getDailyCount, DAILY_LIMIT } from '@/components/shared/dailyLimit';
import { computeStreak, getLocalDateString } from '@/lib/progressUtils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import CompletedChallengeModal from '@/components/challenges/CompletedChallengeModal';
import { AnimatePresence } from 'framer-motion';

export default function Challenges() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [reviewChallenge, setReviewChallenge] = useState(null);
  const [showPreviousLevels, setShowPreviousLevels] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list(),
  });

  const { data: allLessons } = useQuery({ queryKey: ['lessons'], queryFn: () => base44.entities.Lesson.list('order') });
  const { data: allDilemmas } = useQuery({ queryKey: ['dilemmas'], queryFn: () => base44.entities.Dilemma.list() });

  const { data: progressList } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const progress = progressList?.[0];
  const completedChallenges = progress?.completed_challenges || [];
  const completedLessons = progress?.completed_lessons || [];
  const completedDilemmas = progress?.completed_dilemmas || [];
  const dailyChallengesCount = getDailyCount(progress, 'challenges');
  const challengesLimitReached = isAtDailyLimit(progress, 'challenges', user?.email);

  const updateProgressMutation = useMutation({
    mutationFn: async (challenge) => {
      if (!progress) {
        const sv0 = challenge.score_reward || 5;
        const initLogic = challenge.target_skill === 'logic' ? sv0 : 0;
        const initEmpathy = challenge.target_skill === 'empathy' ? sv0 : 0;
        const initDiscipline = challenge.target_skill === 'discipline' ? sv0 : 0;
        const initEmotionalReg = challenge.target_skill === 'emotional_regulation' ? sv0 : 0;
        const initIntegrity = challenge.target_skill === 'integrity' ? sv0 : 0;
        const initialData = {
          completed_challenges: [challenge.id],
          k_score: computeKScore(initLogic, initEmpathy, initDiscipline, initEmotionalReg, initIntegrity),
          logic_score: initLogic,
          empathy_score: initEmpathy,
          discipline_score: initDiscipline,
          emotional_regulation_score: initEmotionalReg,
          integrity_score: initIntegrity,
          curriculum_level: 1,
          streak_days: 1,
          last_activity_date: getLocalDateString(),
          ...buildDailyCountUpdate(null, 'challenges'),
        };
        return base44.entities.UserProgress.create(initialData);
      }

      // Always merge from DB record to avoid overwriting progress from other sessions
      const dbCompletedLessons = progress.completed_lessons || [];
      const dbCompletedDilemmas = progress.completed_dilemmas || [];
      const dbCompletedChallenges = progress.completed_challenges || [];

      const newCompletedChallenges = dbCompletedChallenges.includes(challenge.id)
        ? dbCompletedChallenges
        : [...dbCompletedChallenges, challenge.id];
      const skillKey = `${challenge.target_skill}_score`;
      const newSkillScore = (progress[skillKey] || 0) + (challenge.score_reward || 5);

      const newCurriculumLevel = computeCurriculumLevel({
        currentCurriculumLevel: progress.curriculum_level || 1,
        allLessons,
        allDilemmas,
        allChallenges: challenges,
        completedLessons: dbCompletedLessons,
        completedDilemmas: dbCompletedDilemmas,
        completedChallenges: newCompletedChallenges,
      });

      const newLogicScore = skillKey === 'logic_score' ? newSkillScore : (progress.logic_score || 0);
      const newEmpathyScore = skillKey === 'empathy_score' ? newSkillScore : (progress.empathy_score || 0);
      const newDisciplineScore = skillKey === 'discipline_score' ? newSkillScore : (progress.discipline_score || 0);
      const newEmotionalRegScore = skillKey === 'emotional_regulation_score' ? newSkillScore : (progress.emotional_regulation_score || 0);
      const newIntegrityScore = skillKey === 'integrity_score' ? newSkillScore : (progress.integrity_score || 0);
      const newKScore = computeKScore(newLogicScore, newEmpathyScore, newDisciplineScore, newEmotionalRegScore, newIntegrityScore);

      const streakUpdate = computeStreak(progress.last_activity_date, progress.streak_days);

      const updateData = {
        completed_lessons: dbCompletedLessons,
        completed_dilemmas: dbCompletedDilemmas,
        completed_challenges: newCompletedChallenges,
        k_score: newKScore,
        logic_score: newLogicScore,
        empathy_score: newEmpathyScore,
        discipline_score: newDisciplineScore,
        emotional_regulation_score: newEmotionalRegScore,
        integrity_score: newIntegrityScore,
        curriculum_level: newCurriculumLevel,
        ...streakUpdate,
        ...buildDailyCountUpdate(progress, 'challenges'),
      };

      return base44.entities.UserProgress.update(progress.id, updateData);
    },
    onMutate: async (challenge) => {
      await queryClient.cancelQueries({ queryKey: ['userProgress'] });
      const previousProgress = queryClient.getQueryData(['userProgress', user?.email]);

      queryClient.setQueryData(['userProgress', user?.email], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map(p => {
          if (p.created_by !== user?.email) return p;
          const skillKey = `${challenge.target_skill}_score`;
          const newSkillScore = (p[skillKey] || 0) + (challenge.score_reward || 5);

          const newCurriculumLevel = Math.max(
            p.curriculum_level || 1,
            computeCurriculumLevel({
              currentCurriculumLevel: p.curriculum_level || 1,
              allLessons,
              allDilemmas,
              allChallenges: challenges,
              completedLessons: p.completed_lessons || [],
              completedDilemmas: p.completed_dilemmas || [],
              completedChallenges: [...(p.completed_challenges || []), challenge.id],
            })
          );

          const optLogic = skillKey === 'logic_score' ? newSkillScore : (p.logic_score || 0);
          const optEmpathy = skillKey === 'empathy_score' ? newSkillScore : (p.empathy_score || 0);
          const optDiscipline = skillKey === 'discipline_score' ? newSkillScore : (p.discipline_score || 0);
          const optEmotionalReg = skillKey === 'emotional_regulation_score' ? newSkillScore : (p.emotional_regulation_score || 0);
          const optIntegrity = skillKey === 'integrity_score' ? newSkillScore : (p.integrity_score || 0);
          const newKScore = computeKScore(optLogic, optEmpathy, optDiscipline, optEmotionalReg, optIntegrity);

          const streakUpdate = computeStreak(p.last_activity_date, p.streak_days);

          return {
            ...p,
            completed_challenges: [...(p.completed_challenges || []), challenge.id],
            k_score: newKScore,
            logic_score: optLogic,
            empathy_score: optEmpathy,
            discipline_score: optDiscipline,
            emotional_regulation_score: optEmotionalReg,
            integrity_score: optIntegrity,
            curriculum_level: newCurriculumLevel,
            ...streakUpdate,
            ...buildDailyCountUpdate(p, 'challenges'),
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
      setConfirmDialog(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });

  const allLevels = Array.from({ length: 3 }, (_, i) => i + 1);

  const LEVEL_META = {
    1: 'Level 1 — Building Core Habits',
    2: 'Level 2 — Deepening Practice',
    3: 'Level 3 — Mastery Challenges',
  };

  const getChallengesForLevel = (lvl) =>
    (challenges || []).filter(c => (c.curriculum_level || 1) === lvl);

  const filterChallenge = (c) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return completedChallenges.includes(c.id);
    if (filter === 'new') return !completedChallenges.includes(c.id);
    return c.target_skill === filter;
  };

  // Compute challenge-specific level: advance only when ALL challenges in a level are completed
  const computeChallengeLevel = () => {
    if (!challenges) return 1;
    let lvl = 1;
    while (lvl < 3) {
      const inLevel = challenges.filter(c => (c.curriculum_level || 1) === lvl);
      if (inLevel.length === 0) { lvl++; continue; }
      const allDone = inLevel.every(c => completedChallenges.includes(c.id));
      if (allDone) { lvl++; } else { break; }
    }
    return lvl;
  };
  const challengeLevel = computeChallengeLevel();

  const currentLevelChallenges = getChallengesForLevel(challengeLevel);
  const challengesCompletedInLevel = currentLevelChallenges.filter(c => completedChallenges.includes(c.id)).length;
  const challengesTotalInLevel = currentLevelChallenges.length;
  const levelDone = challengesTotalInLevel > 0 && challengesCompletedInLevel === challengesTotalInLevel;

  if (challengesLoading) {
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
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Daily Challenges</h1>
              <p className="text-muted-foreground text-sm">Build better habits</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Limit */}
        {challengesLimitReached && (
          <DailyLimitBanner type="challenges" completed={dailyChallengesCount} limit={DAILY_LIMIT} />
        )}
        {!challengesLimitReached && (
          <div className="flex items-center justify-end mb-3 -mt-2">
            <span className="text-xs text-muted-foreground">{dailyChallengesCount}/{DAILY_LIMIT} challenges today</span>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 overflow-x-auto pb-2">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-card border border-border" role="tablist" aria-label="Challenge filters">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="logic">Logic</TabsTrigger>
              <TabsTrigger value="empathy">Empathy</TabsTrigger>
              <TabsTrigger value="discipline">Discipline</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* All levels — completed in dropdown, current+locked inline */}
        <div className="space-y-6">

          {/* Previous levels dropdown */}
          {challengeLevel > 1 && (
            <div>
              <button
                onClick={() => setShowPreviousLevels(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-dashed border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-medium text-muted-foreground"
              >
                <span>View completed levels (1–{challengeLevel - 1})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showPreviousLevels ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showPreviousLevels && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="space-y-4 mt-2">
                      {allLevels.filter(l => l < challengeLevel).map(lvl => {
                        const lvlChallenges = getChallengesForLevel(lvl);
                        if (lvlChallenges.length === 0) return null;
                        const completedCount = lvlChallenges.filter(c => completedChallenges.includes(c.id)).length;
                        const totalCount = lvlChallenges.length;
                        const title = LEVEL_META[lvl] || `Level ${lvl}`;
                        return (
                          <div key={lvl} className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
                            <div className="px-4 py-2.5 bg-emerald-100/60 dark:bg-emerald-950/40 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-semibold text-foreground">{title}</span>
                              </div>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{totalCount}/{totalCount} ✓</span>
                            </div>
                            <div className="p-3 space-y-3">
                              {lvlChallenges.map(challenge => (
                                <ChallengeCard
                                  key={challenge.id}
                                  challenge={challenge}
                                  completed={true}
                                  onClick={() => setReviewChallenge(challenge)}
                                />
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

          {allLevels.filter(lvl => lvl >= challengeLevel).map(lvl => {
            const lvlChallenges = getChallengesForLevel(lvl);
            if (lvlChallenges.length === 0) return null;
            const levelItems = lvlChallenges.filter(filterChallenge);

            const isUnlocked = lvl <= challengeLevel;
            const isCurrent = lvl === challengeLevel;
            const completedCount = lvlChallenges.filter(c => completedChallenges.includes(c.id)).length;
            const totalCount = lvlChallenges.length;
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const title = LEVEL_META[lvl] || `Level ${lvl}`;

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
                      <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
                      {isCurrent && <div className="text-xs text-muted-foreground">{completedCount}/{totalCount} challenges done</div>}
                      {!isUnlocked && <div className="text-xs text-muted-foreground">Complete Level {lvl - 1} to unlock</div>}
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

                {/* Challenge list */}
                {isUnlocked ? (
                  <div className="p-3 space-y-3">
                    {(filter !== 'all' ? levelItems : lvlChallenges).map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        completed={completedChallenges.includes(challenge.id)}
                        onClick={completedChallenges.includes(challenge.id)
                          ? () => setReviewChallenge(challenge)
                          : (!challengesLimitReached ? () => setConfirmDialog(challenge) : undefined)}
                        dimmed={!completedChallenges.includes(challenge.id) && challengesLimitReached}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-center">
                    <Lock className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Complete all Level {lvl - 1} challenges to unlock</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Review Modal for completed challenges */}
      <AnimatePresence>
        {reviewChallenge && (
          <CompletedChallengeModal challenge={reviewChallenge} onClose={() => setReviewChallenge(null)} />
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Complete Challenge?
            </DialogTitle>
            <DialogDescription>
              Did you complete "{confirmDialog?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">{confirmDialog?.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-700">+{confirmDialog?.score_reward} {confirmDialog?.target_skill?.replace('_', ' ')}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Not yet
            </Button>
            <Button 
              onClick={() => updateProgressMutation.mutate(confirmDialog)}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              Yes, I did it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </ScrollView>
  );
}
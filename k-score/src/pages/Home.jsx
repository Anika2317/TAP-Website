import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PreSurveyModal from '@/components/PreSurveyModal';
import { Link } from 'react-router-dom';
import KScoreCard from '@/components/dashboard/KScoreCard';
import SkillRadar from '@/components/dashboard/SkillRadar';
import StreakCard from '@/components/dashboard/StreakCard';
import QuickActions from '@/components/dashboard/QuickActions';
import DailyAffirmation from '@/components/dashboard/DailyAffirmation';
import { Loader2, Settings, Map, ChevronRight } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [surveyDismissed, setSurveyDismissed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: progressList, isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: affirmations } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => base44.entities.Affirmation.list(),
  });

  const { data: surveyList, isLoading: surveyLoading } = useQuery({
    queryKey: ['preSurvey', user?.email],
    queryFn: () => base44.entities.PreSurvey.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const saveSurveyMutation = useMutation({
    mutationFn: (data) => base44.entities.PreSurvey.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preSurvey'] });
      setSurveyDismissed(true);
    },
  });

  const surveyCompleted = surveyList && surveyList.length > 0;
  // Show survey if we know the user has no survey (surveyList loaded and empty)
  const showSurvey = !surveyDismissed && surveyList !== undefined && !surveyCompleted;

  const handleSurveyComplete = async (data) => {
    if (data) {
      await saveSurveyMutation.mutateAsync(data);
      if (data.display_name) {
        const existing = progressList?.[0];
        if (existing) {
          await base44.entities.UserProgress.update(existing.id, { display_name: data.display_name });
        } else {
          await base44.entities.UserProgress.create({ display_name: data.display_name, k_score: 0, xp: 0, level: 1, curriculum_level: 1, streak_days: 0 });
        }
        await queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      }
    }
    setSurveyDismissed(true);
  };

  const progress = progressList?.[0];
  // Pick once per day (stable across re-renders) instead of on every render
  const randomAffirmation = useMemo(() => {
    if (!affirmations?.length) return null;
    const d = new Date();
    const dayIndex = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    return affirmations[dayIndex % affirmations.length];
  }, [affirmations]);

  const firstName = user?.full_name?.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const journeyLevel = Math.min(progress?.curriculum_level || 1, 3);
  const journeyDone = (progress?.curriculum_level || 1) > 3;

  // Block rendering until we know auth + survey status
  if (!user || progressLoading || surveyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {showSurvey && (
          <PreSurveyModal onComplete={handleSurveyComplete} mandatory />
        )}
      </AnimatePresence>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,hsl(var(--primary)/0.10),transparent)]"
          aria-hidden="true"
        />
        <div className="relative max-w-lg mx-auto px-4 pt-8 pb-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{today}</p>
              <h1 className="text-[2rem] leading-tight font-medium text-foreground mt-1">
                {greeting}{firstName ? `, ${firstName}` : ''}
              </h1>
            </div>
            <Link
              to="/AccountSettings"
              aria-label="Account settings"
              className="shrink-0 rounded-full border border-border bg-card/70 backdrop-blur hover:bg-accent transition-colors w-11 h-11 flex items-center justify-center"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>

          {/* Dashboard */}
          <div className="space-y-4">
            <Link to="/Progress" aria-label="Open your progress profile" className="block rounded-[1.75rem]">
              <KScoreCard progress={progress} />
            </Link>

            <StreakCard progress={progress} />

            {/* Journey Banner */}
            <Link to="/Journey" className="block rounded-3xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="group bg-card border border-border rounded-3xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Your path</div>
                  <div className="text-foreground font-semibold mt-0.5">
                    {journeyDone ? 'Journey complete' : `Level ${journeyLevel} of 3`}
                  </div>
                  <div className="flex gap-1 mt-2" aria-hidden="true">
                    {[1, 2, 3].map((l) => (
                      <span
                        key={l}
                        className={`h-1 flex-1 rounded-full ${journeyDone || l < journeyLevel ? 'bg-primary' : l === journeyLevel ? 'bg-primary/40' : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </motion.div>
            </Link>

            <section className="pt-4">
              <h2 className="font-display text-xl font-medium text-foreground mb-3 px-1">Train your mind</h2>
              <QuickActions />
            </section>

            <div className="pt-2 space-y-4">
              <SkillRadar progress={progress} />
              <DailyAffirmation affirmation={randomAffirmation} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
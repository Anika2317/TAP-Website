import React, { useState, useEffect } from 'react';
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
import ScrollView from '@/components/shared/ScrollView';
import { Loader2, Settings, Map } from 'lucide-react';

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
  const randomAffirmation = affirmations?.length > 0
    ? affirmations[Math.floor(Math.random() * affirmations.length)]
    : null;

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
      <div className="bg-gradient-to-br from-background via-emerald-50/20 dark:via-emerald-950/10 to-muted">
        <div className="max-w-lg mx-auto px-4 py-8 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-muted-foreground mt-1">ME-Score</p>
            </div>
            <Link to="/AccountSettings" className="p-2 rounded-xl hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>

          {/* Dashboard */}
          <div className="space-y-6">
            <KScoreCard progress={progress} />
            <StreakCard progress={progress} />

            {/* Journey Banner */}
            <Link to="/Journey">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-800 dark:from-slate-950 to-slate-700 dark:to-slate-900 rounded-2xl p-4 flex items-center gap-4 shadow-md"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Your Path</div>
                  <div className="text-white font-bold">Level {Math.min(progress?.curriculum_level || 1, 10)} Journey</div>
                  <div className="text-slate-400 dark:text-slate-500 text-xs">View all 3 levels →</div>
                </div>
              </motion.div>
            </Link>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Train Your Mind</h2>
              <QuickActions />
            </div>

            <SkillRadar progress={progress} />
            <DailyAffirmation affirmation={randomAffirmation} />
          </div>

        </div>
      </div>
    </div>
  );
}
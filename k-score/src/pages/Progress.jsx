import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, BookOpen, Scale, Target, TrendingUp } from 'lucide-react';
import ExportPDFButton from '@/components/ExportPDFButton';
import BadgesSection from '@/components/profile/BadgesSection';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

const MAX_SCORE = 200;

function CustomTooltip({ active, payload }) {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-bold text-foreground">{d.label}</p>
        <p className="text-muted-foreground">{d.value} / {MAX_SCORE}</p>
      </div>
    );
  }
  return null;
}

export default function Progress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: progressList, isLoading } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
    refetchOnWindowFocus: true,
  });

  const { data: allProgress } = useQuery({
    queryKey: ['allUserProgress'],
    queryFn: () => base44.entities.UserProgress.list('-k_score', 200),
  });

  const p = progressList?.[0];
  const totalUsers = allProgress?.length || 0;
  const myRank = allProgress ? allProgress.findIndex(pr => pr.created_by === user?.email) + 1 : 0;

  const PILLAR_KEYS = [
    { key: 'logic_score', label: 'Logic' },
    { key: 'empathy_score', label: 'Empathy' },
    { key: 'discipline_score', label: 'Discipline' },
    { key: 'emotional_regulation_score', label: 'Self-Control' },
    { key: 'integrity_score', label: 'Integrity' },
  ];

  const radarData = PILLAR_KEYS.map(s => ({
    label: s.label,
    value: p?.[s.key] || 0,
    fullMark: MAX_SCORE,
  }));


  const totalActivities =
    (p?.completed_lessons?.length || 0) +
    (p?.completed_dilemmas?.length || 0) +
    (p?.completed_challenges?.length || 0);

  const kScore = p?.k_score || 0;
  const kScorePct = Math.round((kScore / 1000) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Progress Profile</h1>
              <p className="text-muted-foreground text-sm mt-1">Your 5 pillars of growth, visualized</p>
            </div>
            <ExportPDFButton progress={p} user={user} dilemmas={[]} />
          </div>
        </motion.div>

        {/* ME-Score summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-5 mb-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide">Overall ME-Score</p>
              <p className="text-white text-5xl font-bold mt-0.5">{kScore}</p>
              <p className="text-emerald-200 text-xs mt-1">out of 1000</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10">
                <span className="text-white font-bold text-lg">{kScorePct}%</span>
              </div>
            </div>
          </div>

          {/* ME-Score bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${kScorePct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>

          {/* Activity stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: BookOpen, label: 'Lessons', count: p?.completed_lessons?.length || 0 },
              { icon: Scale,    label: 'Dilemmas', count: p?.completed_dilemmas?.length || 0 },
              { icon: Target,   label: 'Challenges', count: p?.completed_challenges?.length || 0 },
            ].map(({ icon: Icon, label, count }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-2.5 text-center">
                <Icon className="w-4 h-4 text-white/70 mx-auto mb-1" />
                <p className="text-white font-bold text-lg leading-none">{count}</p>
                <p className="text-white/60 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-3xl p-5 mb-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-foreground">Pillar Radar</h2>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, MAX_SCORE]}
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickCount={4}
              />
              <Radar
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          {totalActivities === 0 && (
            <p className="text-center text-xs text-muted-foreground -mt-2">
              Complete lessons and dilemmas to grow your radar
            </p>
          )}
        </motion.div>

        {/* Badges */}
        <div className="mb-5">
          <BadgesSection progress={p} rank={myRank} totalUsers={totalUsers} />
        </div>

        {/* Level + XP footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-card border border-border rounded-3xl p-4 shadow-sm flex items-center justify-around"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{Math.min(p?.curriculum_level || 1, 5)}</p>
            <p className="text-xs text-muted-foreground">Curriculum Level</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">{p?.xp || 0}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{p?.streak_days || 0} 🔥</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalActivities}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
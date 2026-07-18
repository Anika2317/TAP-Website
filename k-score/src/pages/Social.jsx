import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Flame, Loader2, TrendingUp } from 'lucide-react';
import ScrollView from '@/components/shared/ScrollView';
import ChallengesSection from '@/components/social/ChallengesSection';

const SKILLS = ['logic', 'empathy', 'discipline', 'emotional_regulation', 'integrity'];

function skillSimilarity(a, b) {
  if (!a || !b) return 0;
  return SKILLS.reduce((sum, s) => sum + Math.abs((a[`${s}_score`] || 0) - (b[`${s}_score`] || 0)), 0);
}

// "Weekly" = updated in the last 7 days and has activity
function isActiveThisWeek(entry) {
  if (!entry.updated_date) return false;
  const updated = new Date(entry.updated_date);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return updated > weekAgo;
}

function RankBadge({ rank }) {
  const colors = { 1: 'bg-amber-400 text-white', 2: 'bg-slate-300 text-white', 3: 'bg-orange-400 text-white' };
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colors[rank] || 'bg-slate-100'}`}>
      <span className={`text-xs font-bold ${colors[rank] ? '' : 'text-slate-500'}`}>{rank}</span>
    </div>
  );
}

function UserRow({ entry, isMe, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border ${isMe ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950' : 'border-border bg-card'}`}
    >
      <RankBadge rank={entry.rank} />

      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">{entry.displayName.charAt(0).toUpperCase()}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">
          {entry.displayName}{isMe && <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400 font-normal">(you)</span>}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{entry.streak_days || 0}d</span>
          <span>Lv.{entry.curriculum_level || 1}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0 mr-1">
        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{entry.k_score || 0}</p>
        <p className="text-xs text-muted-foreground">ME-Score</p>
      </div>
    </motion.div>
  );
}

export default function Social() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allProgress, isLoading } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => base44.entities.UserProgress.list('-k_score', 500),
    enabled: !!user,
  });

  const dedupedProgress = allProgress || [];

  const HIDDEN_NAMES = ['TestIndie', 'Anika S', 'Anika', 'Anikw', 'Aparnw', 'Aparna1234', 'Anonymous'];

  const leaderboard = dedupedProgress
    .map(p => {
      const fallback = p.created_by ? p.created_by.split('@')[0] : null;
      return { ...p, displayName: p.display_name || fallback || null };
    })
    .filter(p => p.displayName && !HIDDEN_NAMES.includes(p.displayName))
    .reduce((acc, p) => {
      const existing = acc.find(e => e.displayName === p.displayName);
      if (!existing) { acc.push(p); }
      else if ((p.k_score || 0) > (existing.k_score || 0)) {
        acc[acc.indexOf(existing)] = p;
      }
      return acc;
    }, [])
    .sort((a, b) => (b.k_score || 0) - (a.k_score || 0))
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  const myRank = leaderboard.find(e => e.created_by === user?.email);

  // Weekly top = active this week, sorted by streak then k_score
  const weeklyTop = [...leaderboard]
    .filter(e => isActiveThisWeek(e) && (e.k_score || 0) > 0)
    .sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0) || (b.k_score || 0) - (a.k_score || 0))
    .slice(0, 5);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <ScrollView className="min-h-screen">
      <div className="bg-background pb-28">
        <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Global ME-Score rankings</p>
        </motion.div>

        {/* My rank banner */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 mb-5 flex items-center gap-4 shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-100 text-xs font-semibold">Your Global Rank</p>
              <p className="text-white text-2xl font-bold">#{myRank.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{myRank.k_score || 0}</p>
                  <p className="text-emerald-200 text-xs">ME-Score</p>
            </div>
          </motion.div>
        )}

        {/* Weekly Top Performers */}
        {weeklyTop.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 mb-5 shadow-sm"
            >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-foreground text-sm">Weekly Top Performers</h2>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Last 7 days</span>
            </div>
            <div className="space-y-2">
              {weeklyTop.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${['bg-amber-400 text-white','bg-slate-300 text-white','bg-orange-400 text-white','bg-slate-100 text-slate-500','bg-slate-100 text-slate-500'][i]}`}>{i+1}</span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{entry.displayName.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="flex-1 text-sm font-semibold text-foreground truncate">
                    {entry.displayName}
                    {entry.created_by === user?.email && <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">(you)</span>}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-bold">
                    <Flame className="w-3.5 h-3.5" />{entry.streak_days || 0}d
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 w-10 text-right">{entry.k_score || 0}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Global Leaderboard */}
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <UserRow
              key={entry.id}
              entry={entry}
              isMe={entry.created_by === user?.email}
              delay={i * 0.03}
            />
          ))}
          {leaderboard.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">No scores yet — be the first!</p>
          )}
        </div>
        </div>
      </div>
    </ScrollView>
  );
}
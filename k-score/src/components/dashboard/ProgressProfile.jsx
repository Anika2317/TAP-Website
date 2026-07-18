import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BookOpen, Scale, Target, TrendingUp } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

const SKILLS = [
  { key: 'logic_score',                label: 'Logic',          color: '#059669', bg: 'bg-emerald-100',   text: 'text-emerald-700',   bar: 'bg-emerald-500' },
  { key: 'empathy_score',              label: 'Empathy',        color: '#0d9488', bg: 'bg-teal-100',      text: 'text-teal-700',      bar: 'bg-teal-500' },
  { key: 'discipline_score',           label: 'Discipline',     color: '#10b981', bg: 'bg-emerald-100',   text: 'text-emerald-800',   bar: 'bg-emerald-600' },
  { key: 'emotional_regulation_score', label: 'Emotional Reg.', color: '#14b8a6', bg: 'bg-teal-100',      text: 'text-teal-800',      bar: 'bg-teal-600' },
  { key: 'integrity_score',            label: 'Integrity',      color: '#047857', bg: 'bg-emerald-100',   text: 'text-emerald-900',   bar: 'bg-emerald-700' },
];

function CustomTooltip({ active, payload }) {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-bold text-foreground">{d.label}</p>
        <p className="text-muted-foreground">{d.value} pts</p>
      </div>
    );
  }
  return null;
}

export default function ProgressProfile({ progress: p }) {
  const skillValues = SKILLS.map(s => p?.[s.key] || 0);
  const maxSkill = Math.max(...skillValues, 100);

  const radarData = SKILLS.map(s => ({
    label: s.label,
    value: p?.[s.key] || 0,
    fullMark: maxSkill,
  }));

  const totalActivities =
    (p?.completed_lessons?.length || 0) +
    (p?.completed_dilemmas?.length || 0) +
    (p?.completed_challenges?.length || 0);

  const kScore = p?.k_score || 0;

  return (
    <div className="space-y-4">
      {/* ME-Score card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide">Overall ME-Score</p>
            <p className="text-white text-4xl font-bold mt-0.5">{kScore}</p>
            <p className="text-emerald-200 text-xs mt-0.5">and growing</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: BookOpen, label: 'Lessons',    count: p?.completed_lessons?.length || 0 },
            { Icon: Scale,    label: 'Dilemmas',   count: p?.completed_dilemmas?.length || 0 },
            { Icon: Target,   label: 'Challenges', count: p?.completed_challenges?.length || 0 },
          ].map(({ Icon, label, count }) => (
            <div key={label} className="bg-white/10 rounded-xl p-2 text-center">
              <Icon className="w-3.5 h-3.5 text-white/70 mx-auto mb-0.5" />
              <p className="text-white font-bold text-base leading-none">{count}</p>
              <p className="text-white/60 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Radar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-foreground text-sm">Pillar Radar</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, maxSkill]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={4} />
            <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
        {totalActivities === 0 && (
          <p className="text-center text-xs text-muted-foreground -mt-2">Complete activities to grow your radar</p>
        )}
      </div>

    </div>
  );
}
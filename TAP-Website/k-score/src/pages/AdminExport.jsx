import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Download, Loader2, Database, ChevronDown, ChevronUp,
  BookOpen, Scale, BarChart2, MessageSquare, Target, FileText
} from 'lucide-react';
import { exportUserPDF } from '@/components/admin/UserPDFExport';
import ContentArchiveTab from '@/components/admin/ContentArchiveTab';
import { useQuery } from '@tanstack/react-query';

function buildMap(arr) {
  const m = {};
  (arr || []).forEach(x => { m[x.id] = x.title || x.id; });
  return m;
}

const SKILLS = [
  { key: 'logic_score', label: 'Logic', color: 'bg-blue-500' },
  { key: 'empathy_score', label: 'Empathy', color: 'bg-pink-500' },
  { key: 'discipline_score', label: 'Discipline', color: 'bg-amber-500' },
  { key: 'emotional_regulation_score', label: 'Emotional Reg.', color: 'bg-purple-500' },
  { key: 'integrity_score', label: 'Integrity', color: 'bg-emerald-500' },
];

function DimensionBar({ label, value, color }) {
  const pct = Math.min(100, Math.round(((value || 0) / 200) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value ?? 0}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function UserRow({ progress, survey, lessonMap, dilemmaMap, allChallenges }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleDownloadPDF = async (e) => {
    e.stopPropagation();
    setExporting(true);
    try {
      exportUserPDF({ progress, survey, lessonMap, dilemmaMap, allChallenges });
    } finally {
      setExporting(false);
    }
  };

  const completedLessonDetails = (progress.completed_lessons || []).map(id => ({
    id,
    title: lessonMap?.[id] || id,
    reflection: (progress.lesson_reflections || []).find(r => r.lesson_id === id),
  }));

  const completedChallengeDetails = (progress.completed_challenges || []).map(id => {
    const full = (allChallenges || []).find(ch => ch.id === id);
    return { id, title: full?.title || id, full };
  });

  const dilemmaAnalyses = progress.dilemma_analyses || [];
  const completedDilemmas = progress.completed_dilemmas || [];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition-colors"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(progress.display_name || '?')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{progress.display_name}</p>
            <p className="text-xs text-muted-foreground truncate">{progress.created_by}</p>
            {survey?.grade_level && <p className="text-xs text-indigo-500">{survey.grade_level}{survey.age ? ` · Age ${survey.age}` : ''}</p>}
            {progress._surveyOnly && <p className="text-[10px] text-amber-500">Survey submitted · no app activity yet</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-700">{progress.k_score ?? 0}</p>
            <p className="text-xs text-muted-foreground">ME-Score</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">Lv{progress.curriculum_level ?? 1}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-500 transition-colors flex-shrink-0"
            title="Download PDF report"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-5 pt-3 space-y-5">

          {/* Scores */}
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> Scores
            </p>
            <div className="space-y-1.5">
              {SKILLS.map(s => (
                <DimensionBar key={s.key} label={s.label} value={progress[s.key] ?? 0} color={s.color} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span>Streak: <b className="text-foreground">{progress.streak_days ?? 0}d</b></span>
              <span>Lessons: <b className="text-foreground">{completedLessonDetails.length}</b></span>
              <span>Dilemmas: <b className="text-foreground">{completedDilemmas.length}</b></span>
              <span>Challenges: <b className="text-foreground">{completedChallengeDetails.length}</b></span>
            </div>
          </div>

          {/* Pre-Survey */}
          {survey ? (
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Pre-Survey
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-muted rounded-lg px-2 py-1">Confidence: <b className="text-foreground">{survey.self_rated_ethical_confidence ?? '—'}/5</b></span>
                  <span className="bg-muted rounded-lg px-2 py-1">Style: <b className="text-foreground">{survey.ethical_reasoning_style?.replace(/_/g, ' ') ?? '—'}</b></span>
                  {survey.grade_level && <span className="bg-muted rounded-lg px-2 py-1">Grade: <b className="text-foreground">{survey.grade_level}</b></span>}
                  {survey.age && <span className="bg-muted rounded-lg px-2 py-1">Age: <b className="text-foreground">{survey.age}</b></span>}
                </div>
                {[
                  { label: 'Loyalty vs. Honesty', text: survey.scenario_1_response },
                  { label: 'Personal Benefit vs. Fairness', text: survey.scenario_2_response },
                  { label: 'Rules vs. Compassion', text: survey.scenario_3_response },
                ].map((s, i) => s.text ? (
                  <div key={i} className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">{s.label}</p>
                    <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">{s.text}</p>
                  </div>
                ) : null)}
                {(survey.consistency_score || survey.reciprocity_score || survey.deliberation_score) && (
                  <div className="flex flex-wrap gap-2 text-xs pt-1">
                    {survey.consistency_score && <span className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">Consistency: <b>{survey.consistency_score}/3</b></span>}
                    {survey.reciprocity_score && <span className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">Reciprocity: <b>{survey.reciprocity_score}/3</b></span>}
                    {survey.deliberation_score && <span className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">Deliberation: <b>{survey.deliberation_score}/3</b></span>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
              ⚠ No pre-survey submitted yet.
            </div>
          )}

          {/* Dilemmas */}
          {(dilemmaAnalyses.length > 0 || completedDilemmas.length > 0) && (
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Dilemmas ({completedDilemmas.length} completed)
              </p>
              {completedDilemmas.filter(id => !dilemmaAnalyses.find(a => a.dilemma_id === id)).length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Completed (no detailed analysis saved):</p>
                  <div className="flex flex-wrap gap-1">
                    {completedDilemmas.filter(id => !dilemmaAnalyses.find(a => a.dilemma_id === id)).map(id => (
                      <span key={id} className="text-[10px] bg-muted rounded px-2 py-0.5 text-muted-foreground">{dilemmaMap?.[id] || id}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {dilemmaAnalyses.map((a, i) => (
                  <div key={i} className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-2.5">
                    {a.dilemma_id && dilemmaMap?.[a.dilemma_id] && (
                      <p className="text-[10px] text-purple-400 font-medium mb-0.5">{dilemmaMap[a.dilemma_id]}</p>
                    )}
                    <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">{a.profile_label || '—'}</p>
                    {a.top_skill_label && <p className="text-xs text-purple-600 dark:text-purple-400">Top skill: {a.top_skill_label}</p>}
                    {a.profile_desc && <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-1 leading-relaxed italic">{a.profile_desc}</p>}
                    {a.philosophy_counts && Object.keys(a.philosophy_counts).length > 0 && (
                      <p className="text-[10px] text-purple-500 mt-1">
                        {Object.entries(a.philosophy_counts).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                    {a.choice_history?.length > 0 && (
                      <div className="space-y-1 mt-1.5">
                        <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide">Round-by-round choices</p>
                        {a.choice_history.map((h, ri) => (
                          <div key={ri} className="bg-white/60 dark:bg-purple-900/20 rounded-lg px-2 py-1.5">
                            <div className="flex gap-1.5 text-[10px]">
                              <span className="text-purple-400 font-bold flex-shrink-0">R{h.round}:</span>
                              <span className="text-purple-800 dark:text-purple-200 flex-1 leading-relaxed">{h.choice_text}</span>
                            </div>
                            <p className="text-[10px] text-purple-400 italic ml-5">{h.philosopher} · {h.philosophy}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {a.completed_at && <p className="text-[10px] text-purple-400 mt-1">{new Date(a.completed_at).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges */}
          {completedChallengeDetails.length > 0 && (
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Challenges ({completedChallengeDetails.length})
              </p>
              <div className="space-y-1.5">
                {completedChallengeDetails.map((c, i) => (
                  <div key={i} className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-2.5">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{c.title}</p>
                    {c.full?.target_skill && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Skill: {c.full.target_skill.replace(/_/g,' ')} · {c.full.difficulty || ''}{c.full.time_commitment ? ` · ${c.full.time_commitment}` : ''}</p>}
                    {c.full?.description && <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">{c.full.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          {completedLessonDetails.length > 0 && (
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Lessons ({completedLessonDetails.length})
              </p>
              <div className="space-y-1.5">
                {completedLessonDetails.map((lesson, i) => (
                  <div key={i} className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-2.5">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{lesson.title}</p>
                      {lesson.reflection?.completed_at && (
                        <p className="text-[10px] text-emerald-400 flex-shrink-0 ml-2">{new Date(lesson.reflection.completed_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    {lesson.reflection?.depth_label && (
                      <p className="text-[10px] text-emerald-500 mt-0.5">Depth: {lesson.reflection.depth_label}</p>
                    )}
                    {lesson.reflection?.reflection ? (
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 italic mt-1 leading-relaxed">"{lesson.reflection.reflection}"</p>
                    ) : (
                      <p className="text-[10px] text-emerald-400 mt-0.5 italic">No reflection submitted</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default function AdminExport() {
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const enabled = !!user && user.role === 'admin';

  const { data: allProgressRaw = [], isLoading: progressLoading } = useQuery({
    queryKey: ['allProgressAdmin'],
    queryFn: () => base44.entities.UserProgress.list('-updated_date', 500),
    enabled,
  });

  const { data: allSurveys = [], isLoading: surveyLoading } = useQuery({
    queryKey: ['allSurveysAdmin'],
    queryFn: () => base44.entities.PreSurvey.list('-created_date', 500),
    enabled,
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.list(),
    enabled,
  });

  const { data: allDilemmas = [] } = useQuery({
    queryKey: ['dilemmas'],
    queryFn: () => base44.entities.Dilemma.list(),
    enabled,
  });

  const { data: allChallenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list(),
    enabled,
  });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
    </div>
  );

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  // Build surveyMap: best survey per email (prefer completed, then most recent)
  const surveyMap = {};
  allSurveys.forEach(s => {
    const ex = surveyMap[s.created_by];
    if (!ex) { surveyMap[s.created_by] = s; return; }
    if (!ex.completed && s.completed) { surveyMap[s.created_by] = s; return; }
    if (ex.completed && !s.completed) return;
    if (new Date(s.created_date) > new Date(ex.created_date)) surveyMap[s.created_by] = s;
  });

  // Group ALL progress records by email — sort raw by updated_date ascending so the MOST RECENT record wins for scores
  const sortedRaw = [...allProgressRaw].sort((a, b) => new Date(a.updated_date || 0) - new Date(b.updated_date || 0));

  const progressByEmail = {};
  sortedRaw.forEach(p => {
    const email = p.created_by?.trim();
    const displayFallback = p.display_name?.trim() || surveyMap[p.created_by]?.display_name?.trim();
    const key = email || displayFallback || `unknown-${p.id}`;

    if (!progressByEmail[key]) {
      progressByEmail[key] = {
        ...p,
        completed_lessons: [...(p.completed_lessons || [])],
        completed_dilemmas: [...(p.completed_dilemmas || [])],
        completed_challenges: [...(p.completed_challenges || [])],
        lesson_reflections: [...(p.lesson_reflections || [])],
        dilemma_analyses: [...(p.dilemma_analyses || [])],
        display_name: displayFallback || (email ? email.split('@')[0] : 'Unknown'),
      };
    } else {
      const ex = progressByEmail[key];

      // Union completed arrays (no duplicates) — accumulate all completed items across records
      const lIds = new Set(ex.completed_lessons);
      p.completed_lessons?.forEach(id => lIds.add(id));
      ex.completed_lessons = [...lIds];

      const dIds = new Set(ex.completed_dilemmas);
      p.completed_dilemmas?.forEach(id => dIds.add(id));
      ex.completed_dilemmas = [...dIds];

      const cIds = new Set(ex.completed_challenges);
      p.completed_challenges?.forEach(id => cIds.add(id));
      ex.completed_challenges = [...cIds];

      // Merge reflections — add any not already present by lesson_id
      const existingLessonReflIds = new Set(ex.lesson_reflections.map(r => r.lesson_id).filter(Boolean));
      (p.lesson_reflections || []).forEach(r => {
        if (r.lesson_id && !existingLessonReflIds.has(r.lesson_id)) {
          ex.lesson_reflections.push(r);
          existingLessonReflIds.add(r.lesson_id);
        }
      });

      // Merge dilemma analyses — add any not already present by dilemma_id
      const existingAnalysisIds = new Set(ex.dilemma_analyses.map(a => a.dilemma_id).filter(Boolean));
      (p.dilemma_analyses || []).forEach(a => {
        if (a.dilemma_id && !existingAnalysisIds.has(a.dilemma_id)) {
          ex.dilemma_analyses.push(a);
          existingAnalysisIds.add(a.dilemma_id);
        }
      });

      // Use scores from the MOST RECENT record (since we sorted ascending, later records overwrite)
      ex.k_score = p.k_score ?? ex.k_score;
      ex.streak_days = Math.max(ex.streak_days || 0, p.streak_days || 0);
      ex.curriculum_level = p.curriculum_level ?? ex.curriculum_level;
      ex.logic_score = p.logic_score ?? ex.logic_score;
      ex.empathy_score = p.empathy_score ?? ex.empathy_score;
      ex.discipline_score = p.discipline_score ?? ex.discipline_score;
      ex.emotional_regulation_score = p.emotional_regulation_score ?? ex.emotional_regulation_score;
      ex.integrity_score = p.integrity_score ?? ex.integrity_score;
      ex.updated_date = p.updated_date ?? ex.updated_date;

      if (p.display_name?.trim()) {
        ex.display_name = p.display_name.trim();
      } else if (!ex.display_name && displayFallback) {
        ex.display_name = displayFallback;
      }
    }
  });

  const progressUsers = Object.values(progressByEmail);
  const progressEmails = new Set(progressUsers.map(p => p.created_by));

  // Survey-only users: submitted survey but have no progress record at all
  const surveyOnlyUsers = [];
  const seenSurveyEmails = new Set();
  allSurveys.filter(s => s.completed && !progressEmails.has(s.created_by)).forEach(s => {
    if (!seenSurveyEmails.has(s.created_by)) {
      seenSurveyEmails.add(s.created_by);
      surveyOnlyUsers.push({
        id: `survey-${s.id}`,
        display_name: s.display_name || s.created_by?.split('@')[0] || 'Unknown',
        created_by: s.created_by,
        k_score: 0, curriculum_level: 1, xp: 0, streak_days: 0,
        completed_lessons: [], completed_dilemmas: [], completed_challenges: [],
        lesson_reflections: [], dilemma_analyses: [],
        _surveyOnly: true,
      });
    }
  });

  // Only hide known test accounts — Anonymous/Unknown are real participants and must remain visible
  const HIDDEN_NAMES = ['TestIndie', 'Anika S', 'Anika', 'Anikw', 'Aparnw', 'Aparna1234'];

  // Filter test accounts then sort by most recent activity, then highest score
  const allProgress = [...progressUsers, ...surveyOnlyUsers]
    .filter(p => !HIDDEN_NAMES.includes(p.display_name?.trim()))
    .sort((a, b) => {
      const aDate = new Date(a.updated_date || 0);
      const bDate = new Date(b.updated_date || 0);
      if (bDate - aDate !== 0) return bDate - aDate;
      return (b.k_score || 0) - (a.k_score || 0);
    });

  const lessonMap = buildMap(allLessons);
  const dilemmaMap = buildMap(allDilemmas);
  const challengeMap = buildMap(allChallenges);

  // Flat lists for Dilemmas & Lessons tabs
  const allDilemmaAnalyses = allProgress.flatMap(p =>
    (p.dilemma_analyses || []).map(a => ({
      ...a,
      user: p.display_name,
      email: p.created_by,
      dilemmaTitle: dilemmaMap[a.dilemma_id] || a.dilemma_id,
    }))
  ).sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));

  const allReflections = allProgress.flatMap(p =>
    (p.lesson_reflections || []).map(r => ({
      ...r,
      user: p.display_name,
      email: p.created_by,
      lessonTitle: lessonMap[r.lesson_id] || r.lesson_id,
    }))
  ).sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));

  const completedSurveys = allSurveys.filter(s => s.completed);
  const avgScore = allProgress.length
    ? Math.round(allProgress.reduce((s, p) => s + (p.k_score || 0), 0) / allProgress.length)
    : 0;

  const isLoading = progressLoading || surveyLoading;

  const handleExportProgressDB = () => {
    setDownloading(true);
    try {
      const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const levels = [1, 2, 3, 4, 5];

      const headers = [
        'Email', 'Display Name', 'Grade', 'Age',
        'Curriculum Level', 'ME-Score',
        'Logic', 'Empathy', 'Discipline', 'Emotional Reg', 'Integrity',
        'Total Lessons Done', 'Total Dilemmas Done', 'Total Challenges Done',
        ...levels.map(l => `Lessons Lv${l}`),
        ...levels.map(l => `Dilemmas Lv${l}`),
        'Streak Days', 'Last Activity',
        'Survey Confidence (1-5)', 'Survey Ethical Curiosity (1-5)',
        'Survey Self-Reflective Curiosity (1-5)', 'Survey Intellectual Curiosity (1-5)',
        'Survey Reasoning Style',
        'Consistency (1-3)', 'Reciprocity (1-3)', 'Deliberation (1-3)',
      ];

      // Build lookup: lesson/dilemma id → curriculum_level
      const lessonLevelMap = {};
      allLessons.forEach(l => { lessonLevelMap[l.id] = l.curriculum_level || 1; });
      const dilemmaLevelMap = {};
      allDilemmas.forEach(d => { dilemmaLevelMap[d.id] = d.curriculum_level || 1; });

      const rows = allProgress.map(p => {
        const s = surveyMap[p.created_by] || {};
        const completedL = p.completed_lessons || [];
        const completedD = p.completed_dilemmas || [];
        const completedC = p.completed_challenges || [];

        const lessonsByLevel = levels.map(l => completedL.filter(id => lessonLevelMap[id] === l).length);
        const dilemmasByLevel = levels.map(l => completedD.filter(id => dilemmaLevelMap[id] === l).length);

        return [
          p.created_by, p.display_name, s.grade_level || '', s.age || '',
          p.curriculum_level || 1, p.k_score || 0,
          p.logic_score || 0, p.empathy_score || 0, p.discipline_score || 0,
          p.emotional_regulation_score || 0, p.integrity_score || 0,
          completedL.length, completedD.length, completedC.length,
          ...lessonsByLevel,
          ...dilemmasByLevel,
          p.streak_days || 0, p.last_activity_date || '',
          s.self_rated_ethical_confidence || '', s.ethical_curiosity || '',
          s.self_reflective_curiosity || '', s.intellectual_curiosity || '',
          s.ethical_reasoning_style || '',
          s.consistency_score || '', s.reciprocity_score || '', s.deliberation_score || '',
        ].map(escape).join(',');
      });

      const csv = [headers.map(escape).join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-db-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleExport = async () => {
    setDownloading(true);
    try {
      const headers = [
        'Email','Display Name','Grade','Age','ME-Score','Level','Streak',
        'Lessons','Dilemmas','Challenges',
        'Logic','Empathy','Discipline','Emotional Reg','Integrity',
        'Survey Confidence','Survey Style',
        'Scenario 1','Scenario 2','Scenario 3',
        'Consistency','Reciprocity','Deliberation'
      ];
      const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = allProgress.map(p => {
        const s = surveyMap[p.created_by] || {};
        return [
          p.created_by, p.display_name, s.grade_level || '', s.age || '',
          p.k_score || 0, p.curriculum_level || 1, p.streak_days || 0,
          (p.completed_lessons || []).length,
          (p.completed_dilemmas || []).length,
          (p.completed_challenges || []).length,
          p.logic_score || 0, p.empathy_score || 0, p.discipline_score || 0,
          p.emotional_regulation_score || 0, p.integrity_score || 0,
          s.self_rated_ethical_confidence || '', s.ethical_reasoning_style || '',
          s.scenario_1_response || '', s.scenario_2_response || '', s.scenario_3_response || '',
          s.consistency_score || '', s.reciprocity_score || '', s.deliberation_score || ''
        ].map(escape).join(',');
      });
      const csv = [headers.map(escape).join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Research Dashboard</h1>
              <p className="text-muted-foreground text-sm">Admin · ME-Score Study</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{allProgress.length}</p>
            <p className="text-xs text-muted-foreground">Participants</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{completedSurveys.length}</p>
            <p className="text-xs text-muted-foreground">Surveys done</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Dilemmas', val: allProgress.reduce((s, p) => s + (p.completed_dilemmas?.length || 0), 0) },
            { label: 'Lessons', val: allProgress.reduce((s, p) => s + (p.completed_lessons?.length || 0), 0) },
            { label: 'Challenges', val: allProgress.reduce((s, p) => s + (p.completed_challenges?.length || 0), 0) },
            { label: 'Avg Score', val: avgScore, color: 'text-emerald-600' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-3 text-center">
              <p className={`text-xl font-bold ${color || 'text-foreground'}`}>{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="w-full mb-5 bg-muted border border-border grid grid-cols-6">
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
            <TabsTrigger value="surveys" className="text-xs">Surveys</TabsTrigger>
            <TabsTrigger value="dilemmas" className="text-xs">Dilemmas</TabsTrigger>
            <TabsTrigger value="lessons" className="text-xs">Lessons</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : allProgress.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No users yet.</p>
            ) : (
              allProgress.map(p => (
                <UserRow
                  key={p.id}
                  progress={p}
                  survey={surveyMap[p.created_by]}
                  lessonMap={lessonMap}
                  dilemmaMap={dilemmaMap}
                  challengeMap={challengeMap}
                  allChallenges={allChallenges}
                />
              ))
            )}
          </TabsContent>

          {/* SURVEYS TAB */}
          <TabsContent value="surveys" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : completedSurveys.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No surveys yet.</p>
            ) : (
              completedSurveys.map(s => {
                const prog = progressUsers.find(p => p.created_by === s.created_by);
                return (
                  <div key={s.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{s.display_name || prog?.display_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{s.created_by}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs justify-end">
                        {s.grade_level && <span className="bg-muted rounded px-2 py-0.5">{s.grade_level}</span>}
                        {s.age && <span className="bg-muted rounded px-2 py-0.5">Age {s.age}</span>}
                        {s.self_rated_ethical_confidence && <span className="bg-muted rounded px-2 py-0.5">Conf: {s.self_rated_ethical_confidence}/5</span>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Style: <span className="text-foreground font-medium">{s.ethical_reasoning_style?.replace(/_/g, ' ') || '—'}</span></p>
                    {[
                      { label: 'Loyalty vs. Honesty', text: s.scenario_1_response },
                      { label: 'Personal Benefit vs. Fairness', text: s.scenario_2_response },
                      { label: 'Rules vs. Compassion', text: s.scenario_3_response },
                    ].map((sc, i) => sc.text ? (
                      <div key={i} className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1">{sc.label}</p>
                        <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">{sc.text}</p>
                      </div>
                    ) : null)}
                    {(s.consistency_score || s.reciprocity_score || s.deliberation_score) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {s.consistency_score && <span className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">Consistency: <b>{s.consistency_score}/3</b></span>}
                        {s.reciprocity_score && <span className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">Reciprocity: <b>{s.reciprocity_score}/3</b></span>}
                        {s.deliberation_score && <span className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">Deliberation: <b>{s.deliberation_score}/3</b></span>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* DILEMMAS TAB */}
          <TabsContent value="dilemmas" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : allDilemmaAnalyses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No dilemma data yet.</p>
            ) : (
              allDilemmaAnalyses.map((a, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{a.user}</p>
                      <p className="text-[10px] text-muted-foreground">{a.email}</p>
                      {a.dilemmaTitle && <p className="text-xs text-purple-500 font-medium mt-0.5">{a.dilemmaTitle}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      {a.profile_label && <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">{a.profile_label}</p>}
                      {a.completed_at && <p className="text-[10px] text-muted-foreground">{new Date(a.completed_at).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  {a.top_skill_label && <p className="text-xs text-muted-foreground mb-1">Top skill: <span className="text-foreground font-medium">{a.top_skill_label}</span></p>}
                  {a.profile_desc && <p className="text-xs text-muted-foreground italic mb-2 leading-relaxed">{a.profile_desc}</p>}
                  {a.philosophy_counts && Object.keys(a.philosophy_counts).length > 0 && (
                    <p className="text-[10px] text-purple-500 mb-2">
                      {Object.entries(a.philosophy_counts).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                  {a.choice_history?.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide mb-1">Round-by-round choices</p>
                      {a.choice_history.map((h, ri) => (
                        <div key={ri} className="bg-purple-50 dark:bg-purple-950/20 rounded-lg px-2 py-1.5 mb-1">
                          <div className="flex gap-1.5 text-[10px]">
                            <span className="text-purple-400 font-bold flex-shrink-0">R{h.round}:</span>
                            <span className="text-purple-800 dark:text-purple-200 flex-1 leading-relaxed">{h.choice_text}</span>
                          </div>
                          <p className="text-[10px] text-purple-400 italic ml-5">{h.philosopher} · {h.philosophy}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg px-2 py-1.5">
                      <p className="text-[10px] text-purple-500 font-medium mb-0.5">Summary (completed before per-round tracking)</p>
                      {a.philosophy_counts && Object.keys(a.philosophy_counts).length > 0 && (
                        <p className="text-[10px] text-purple-700 dark:text-purple-300">Philosophies: {Object.entries(a.philosophy_counts).sort((x,y)=>y[1]-x[1]).map(([k,v])=>`${k} (×${v})`).join(', ')}</p>
                      )}
                      {a.top_skill_label && <p className="text-[10px] text-purple-600">Dominant skill: {a.top_skill_label}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* LESSONS TAB */}
          <TabsContent value="lessons" className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : allReflections.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No lesson reflections yet.</p>
            ) : (
              allReflections.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{r.user}</p>
                      <p className="text-[10px] text-muted-foreground">{r.email}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{r.lessonTitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      {r.depth_label && <p className="text-xs font-semibold text-emerald-700">{r.depth_label}</p>}
                      {r.completed_at && <p className="text-[10px] text-muted-foreground">{new Date(r.completed_at).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  {r.reflection ? (
                    <p className="text-xs text-foreground leading-relaxed italic bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-2.5">"{r.reflection}"</p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No reflection submitted.</p>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* CONTENT ARCHIVE TAB */}
          <TabsContent value="content">
            <ContentArchiveTab allLessons={allLessons} allDilemmas={allDilemmas} allChallenges={allChallenges} />
          </TabsContent>

          {/* EXPORT TAB */}
          <TabsContent value="export" className="space-y-4">

            {/* Full Progress DB Export */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div>
                <h2 className="font-bold text-foreground text-sm mb-0.5">Full Progress Database</h2>
                <p className="text-xs text-muted-foreground">One row per user · optimized for curriculum-level analysis</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {[
                  'Email, display name, age, grade',
                  'Curriculum level (1–10) + ME-Score',
                  'All 5 skill dimension scores',
                  'Lessons / dilemmas / challenges completed (counts)',
                  'Lessons completed per curriculum level (Lv1–5)',
                  'Dilemmas completed per curriculum level (Lv1–5)',
                  'Streak days + last activity date',
                  'Pre-survey baseline scores (confidence, curiosity)',
                  'Admin ratings: Consistency, Reciprocity, Deliberation',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleExportProgressDB}
                disabled={downloading}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl gap-2"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? 'Generating...' : 'Download Progress DB (CSV)'}
              </Button>
            </div>

            {/* Research Summary Export (existing) */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div>
                <h2 className="font-bold text-foreground text-sm mb-0.5">Research Summary</h2>
                <p className="text-xs text-muted-foreground">Includes verbatim scenario responses + admin ratings</p>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {[
                  'User email + display name, age, grade',
                  'ME-Score + 5 dimension scores',
                  'Curriculum level, streak days',
                  'Completed counts (lessons, dilemmas, challenges)',
                  'Pre-survey scenario responses (verbatim)',
                  'Admin ratings: Consistency, Reciprocity, Deliberation (1–3)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleExport}
                disabled={downloading}
                variant="outline"
                className="w-full h-11 font-semibold rounded-2xl gap-2"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? 'Generating CSV...' : 'Download Research CSV'}
              </Button>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-4">
              <h2 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 text-sm">Scoring Rubric</h2>
              <div className="space-y-2 text-xs">
                {[
                  { d: 'Consistency', desc: '1 = Contradicts values · 2 = Partial · 3 = Full alignment' },
                  { d: 'Reciprocity', desc: '1 = Self only · 2 = One other · 3 = Multiple stakeholders' },
                  { d: 'Deliberation', desc: '1 = Gut reaction · 2 = Some reasoning · 3 = Principled' },
                ].map(({ d, desc }) => (
                  <div key={d}>
                    <p className="font-semibold text-indigo-800 dark:text-indigo-300">{d}</p>
                    <p className="text-indigo-600 dark:text-indigo-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
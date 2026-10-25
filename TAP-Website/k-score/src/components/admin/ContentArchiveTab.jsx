import React, { useState } from 'react';
import { Download, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function buildArchive(allLessons, allDilemmas, allChallenges) {
  const archive = {};
  LEVELS.forEach(lvl => {
    const lessons = (allLessons || [])
      .filter(l => (l.curriculum_level || 1) === lvl)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(l => ({
        id: l.id,
        title: l.title,
        thinker: l.thinker,
        category: l.category,
        section: l.section,
        primary_skill: l.primary_skill,
        duration_minutes: l.duration_minutes,
        xp_reward: l.xp_reward,
        content: l.content,
        key_insight: l.key_insight,
        reflection_question: l.reflection_question,
      }));

    const dilemmas = (allDilemmas || [])
      .filter(d => (d.curriculum_level || 1) === lvl)
      .map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        difficulty: d.difficulty,
        xp_reward: d.xp_reward,
        scenario: d.scenario,
        choices: (d.choices || []).map(c => ({
          text: c.text,
          philosopher: c.philosopher,
          philosophy: c.philosophy,
          explanation: c.explanation,
          score_impacts: c.score_impacts,
        })),
      }));

    const challenges = (allChallenges || [])
      .filter(c => (c.curriculum_level || 1) === lvl)
      .map(c => ({
        id: c.id,
        title: c.title,
        target_skill: c.target_skill,
        difficulty: c.difficulty,
        time_commitment: c.time_commitment,
        xp_reward: c.xp_reward,
        score_reward: c.score_reward,
        description: c.description,
        science_backing: c.science_backing,
      }));

    if (lessons.length || dilemmas.length || challenges.length) {
      archive[`level_${lvl}`] = { level: lvl, lessons, dilemmas, challenges };
    }
  });
  return archive;
}

function CollapsibleSection({ title, count, color, children }) {
  const [open, setOpen] = useState(false);
  if (!count) return null;
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <span className={`text-xs font-bold ${color}`}>{title} ({count})</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="p-3 space-y-4">{children}</div>}
    </div>
  );
}

function LessonEntry({ lesson }) {
  return (
    <div className="border-l-2 border-emerald-400 pl-3 space-y-1.5">
      <p className="text-xs font-bold text-foreground">{lesson.title}</p>
      <p className="text-[10px] text-muted-foreground">Thinker: {lesson.thinker} · Category: {lesson.category} · Section: {lesson.section} · Skill: {lesson.primary_skill} · {lesson.duration_minutes}min</p>
      <div className="bg-muted/50 rounded-lg p-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Full Content</p>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{lesson.content}</pre>
      </div>
      {lesson.key_insight && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Key Insight</p>
          <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">{lesson.key_insight}</p>
        </div>
      )}
      {lesson.reflection_question && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Reflection Question</p>
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">{lesson.reflection_question}</p>
        </div>
      )}
    </div>
  );
}

function DilemmaEntry({ dilemma }) {
  return (
    <div className="border-l-2 border-purple-400 pl-3 space-y-1.5">
      <p className="text-xs font-bold text-foreground">{dilemma.title}</p>
      <p className="text-[10px] text-muted-foreground">Category: {dilemma.category} · Difficulty: {dilemma.difficulty}</p>
      <div className="bg-muted/50 rounded-lg p-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Scenario</p>
        <p className="text-xs text-foreground leading-relaxed">{dilemma.scenario}</p>
      </div>
      <div className="space-y-2">
        {(dilemma.choices || []).map((c, i) => (
          <div key={i} className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-2">
            <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-0.5">Choice {i + 1} · {c.philosopher} · {c.philosophy}</p>
            <p className="text-xs font-medium text-purple-900 dark:text-purple-200 mb-1">"{c.text}"</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">{c.explanation}</p>
            {c.score_impacts && (
              <p className="text-[10px] text-purple-400 mt-1">
                Score impacts: {Object.entries(c.score_impacts).map(([k, v]) => `${k.replace('_', ' ')}: ${v > 0 ? '+' : ''}${v}`).join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengeEntry({ challenge }) {
  return (
    <div className="border-l-2 border-amber-400 pl-3 space-y-1.5">
      <p className="text-xs font-bold text-foreground">{challenge.title}</p>
      <p className="text-[10px] text-muted-foreground">Skill: {challenge.target_skill?.replace('_', ' ')} · Difficulty: {challenge.difficulty} · Time: {challenge.time_commitment}</p>
      <div className="bg-muted/50 rounded-lg p-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Instructions</p>
        <p className="text-xs text-foreground leading-relaxed">{challenge.description}</p>
      </div>
      {challenge.science_backing && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2">
          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Science Backing</p>
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{challenge.science_backing}</p>
        </div>
      )}
    </div>
  );
}

export default function ContentArchiveTab({ allLessons, allDilemmas, allChallenges }) {
  const [copied, setCopied] = useState(false);

  const archive = buildArchive(allLessons, allDilemmas, allChallenges);
  const jsonStr = JSON.stringify(archive, null, 2);

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-archive-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const totalLessons = (allLessons || []).length;
  const totalDilemmas = (allDilemmas || []).length;
  const totalChallenges = (allChallenges || []).length;

  return (
    <div className="space-y-4">
      {/* Header + export buttons */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div>
          <h2 className="font-bold text-foreground text-sm mb-0.5">Verbatim Content Archive</h2>
          <p className="text-xs text-muted-foreground">
            Complete word-for-word export of all {totalLessons} lessons, {totalDilemmas} dilemmas, and {totalChallenges} challenges — organized by curriculum level.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadJSON} className="flex-1 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Download JSON
          </Button>
          <Button onClick={handleCopy} variant="outline" className="flex-1 h-10 font-semibold rounded-xl gap-2 text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">{totalLessons} Lessons</span>
          <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">{totalDilemmas} Dilemmas</span>
          <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">{totalChallenges} Challenges</span>
        </div>
      </div>

      {/* Level-by-level readable view */}
      {Object.values(archive).map(({ level, lessons, dilemmas, challenges }) => (
        <div key={level} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-border">
            <h3 className="font-bold text-foreground text-sm">Level {level}</h3>
            <p className="text-[10px] text-muted-foreground">{lessons.length} lessons · {dilemmas.length} dilemmas · {challenges.length} challenges</p>
          </div>
          <div className="p-3">
            <CollapsibleSection title="Lessons" count={lessons.length} color="text-emerald-700 dark:text-emerald-400">
              {lessons.map(l => <LessonEntry key={l.id} lesson={l} />)}
            </CollapsibleSection>
            <CollapsibleSection title="Dilemmas" count={dilemmas.length} color="text-purple-700 dark:text-purple-400">
              {dilemmas.map(d => <DilemmaEntry key={d.id} dilemma={d} />)}
            </CollapsibleSection>
            <CollapsibleSection title="Challenges" count={challenges.length} color="text-amber-700 dark:text-amber-400">
              {challenges.map(c => <ChallengeEntry key={c.id} challenge={c} />)}
            </CollapsibleSection>
          </div>
        </div>
      ))}
    </div>
  );
}
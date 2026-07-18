import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ClipboardList } from 'lucide-react';

const SCENARIOS = [
  {
    id: 1,
    label: 'Scenario 1 — Loyalty vs. Honesty',
    prompt: "Your close friend is applying for a position at your school or workplace, and you happen to be on the selection committee. You know that another candidate is genuinely more qualified — but your friend has no idea you have any influence. What do you do? Walk through your thinking.",
    placeholder: 'Write whatever comes to mind first, then explain your reasoning...',
  },
  {
    id: 2,
    label: 'Scenario 2 — Personal Benefit vs. Fairness',
    prompt: "You find out there's a completely legal shortcut that saves you a lot of money — maybe a tax loophole, a scholarship you technically qualify for but weren't really meant for, or a store price error in your favor. Using it is allowed, but you know it's not really fair. Do you take it? Why or why not?",
    placeholder: 'Write whatever comes to mind first, then explain your reasoning...',
  },
  {
    id: 3,
    label: 'Scenario 3 — Rules vs. Compassion',
    prompt: "You're in charge of enforcing a strict rule — maybe a school policy, a team rule, or a workplace guideline that you helped create. A person who has always followed the rules asks for an exception for a personal reason they won't fully explain. Granting it could set a precedent. What do you do?",
    placeholder: 'Write whatever comes to mind first, then explain your reasoning...',
  },
];

const REASONING_STYLES = [
  { value: 'gut_feeling', label: '🔥 Go with my gut — I trust my instincts' },
  { value: 'think_it_through', label: '🧠 Think it through carefully every time' },
  { value: 'depends_on_situation', label: '⚖️ It depends on the situation' },
  { value: 'ask_others', label: '💬 Talk it over with people I trust' },
];

// steps: 0=intro+name, 1=baseline Qs, 2-4=scenarios, 5=done
export default function PreSurveyModal({ onComplete, mandatory = false }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [reasoningStyle, setReasoningStyle] = useState('');
  const [ethicalCuriosity, setEthicalCuriosity] = useState(null);
  const [selfReflectiveCuriosity, setSelfReflectiveCuriosity] = useState(null);
  const [intellectualCuriosity, setIntellectualCuriosity] = useState(null);
  const [responses, setResponses] = useState({ s1: '', s2: '', s3: '' });
  const [submitting, setSubmitting] = useState(false);

  const TOTAL_STEPS = 5; // 0,1,2,3,4 → done at 5
  const scenarioStep = step - 1; // steps 2,3,4 = scenarios 0,1,2
  const isScenarioStep = step >= 2 && step <= 4;
  const responseKeys = ['s1', 's2', 's3'];
  const currentKey = responseKeys[scenarioStep - 1];
  const currentScenario = SCENARIOS[scenarioStep - 1];

  const canProceed = (() => {
    if (step === 0) return displayName.trim().length >= 2 && age.toString().trim().length > 0 && gradeLevel.trim().length >= 2;
    if (step === 1) return confidence !== null && reasoningStyle !== '' && ethicalCuriosity !== null && selfReflectiveCuriosity !== null && intellectualCuriosity !== null;
    if (isScenarioStep) return responses[currentKey]?.trim().length > 20;
    return true;
  })();

  const handleSubmit = async () => {
    setSubmitting(true);
    await onComplete({
      display_name: displayName.trim(),
      age: age ? parseInt(age) : undefined,
      grade_level: gradeLevel.trim() || undefined,
      self_rated_ethical_confidence: confidence,
      ethical_reasoning_style: reasoningStyle,
      ethical_curiosity: ethicalCuriosity,
      self_reflective_curiosity: selfReflectiveCuriosity,
      intellectual_curiosity: intellectualCuriosity,
      scenario_1_response: responses.s1,
      scenario_2_response: responses.s2,
      scenario_3_response: responses.s3,
      completed: true,
    });
    // Track survey completion for research analytics
    base44.analytics.track({
      eventName: 'pre_survey_completed',
      properties: {
        grade_level: gradeLevel.trim() || 'not_provided',
        self_rated_ethical_confidence: confidence,
        ethical_reasoning_style: reasoningStyle,
        scenario_1_word_count: responses.s1.trim().split(/\s+/).length,
        scenario_2_word_count: responses.s2.trim().split(/\s+/).length,
        scenario_3_word_count: responses.s3.trim().split(/\s+/).length,
        age_provided: !!age,
      }
    });
    setStep(5);
    setSubmitting(false);
  };

  const progressPct = step === 0 ? 0 : Math.round((step / 4) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '92svh', paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', minHeight: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Baseline Survey</h2>
              <p className="text-xs text-muted-foreground">Research Study</p>
            </div>
          </div>

          {/* Progress bar */}
          {step > 0 && step < 5 && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Step {step} of 4</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          )}

          {/* Navigation buttons — only show for non-final steps */}
          {step < 5 && (
            <div className="flex gap-2 mb-3">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-none px-3 h-9">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              {step < 4 && (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed}
                  className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                >
                  {step === 0 ? 'Begin Survey' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || submitting}
                  className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit & See Results'}
                </Button>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 0 — Intro + name */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <p className="text-foreground text-sm font-medium leading-relaxed">
                  Before you begin, we need a quick baseline — this helps us understand your starting point.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 space-y-1 text-xs text-indigo-800 dark:text-indigo-200">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">This survey captures</p>
                  <p>• A display name for the leaderboard</p>
                  <p>• Your baseline ethical reasoning style</p>
                  <p>• Your responses to 3 real-world scenarios</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Your display name *</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="How should you appear on the leaderboard?"
                    className="w-full rounded-xl border border-border bg-background text-sm text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-muted-foreground"
                    style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground mt-0.5">Visible on the leaderboard.</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-foreground block mb-1">Age *</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="e.g. 16"
                      min={10} max={25}
                      required
                      className="w-full rounded-xl border border-border bg-background text-sm text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-muted-foreground"
                      style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-foreground block mb-1">Grade / Year *</label>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={e => setGradeLevel(e.target.value)}
                      placeholder="e.g. Grade 11"
                      required
                      className="w-full rounded-xl border border-border bg-background text-sm text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-muted-foreground"
                      style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1 — Baseline Qs */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">How confident are you in your ethical decision-making right now?</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setConfidence(n)}
                        className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${confidence === n ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'border-border bg-background text-muted-foreground hover:border-indigo-300'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>Not at all</span>
                    <span>Very confident</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">How interested are you in questions about right and wrong, fairness, and ethical decision making?</p>
                  <p className="text-xs text-muted-foreground mb-2">Maps to Dilemmas · Ventromedial prefrontal cortex</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setEthicalCuriosity(n)}
                        className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${ethicalCuriosity === n ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'border-border bg-background text-muted-foreground hover:border-indigo-300'}`}
                      >{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>Not at all</span><span>Extremely interested</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">How much do you enjoy reflecting on your own thinking, emotions, and personal growth?</p>
                  <p className="text-xs text-muted-foreground mb-2">Maps to Lessons & Reflections · Default mode network</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setSelfReflectiveCuriosity(n)}
                        className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${selfReflectiveCuriosity === n ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'border-border bg-background text-muted-foreground hover:border-indigo-300'}`}
                      >{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>Not at all</span><span>Very much</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">How interested are you in understanding how the human mind and brain work?</p>
                  <p className="text-xs text-muted-foreground mb-2">Maps to Neuroscience & Philosophy · Dorsolateral prefrontal cortex</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setIntellectualCuriosity(n)}
                        className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${intellectualCuriosity === n ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'border-border bg-background text-muted-foreground hover:border-indigo-300'}`}
                      >{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>Not at all</span><span>Extremely interested</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">When faced with a tough ethical decision, you usually…</p>
                  <div className="space-y-2">
                    {REASONING_STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setReasoningStyle(s.value)}
                        className={`w-full text-left px-3 py-2 rounded-xl border-2 text-sm transition-all ${reasoningStyle === s.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 font-medium' : 'border-border bg-background text-foreground hover:border-indigo-300'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEPS 2-4 — Scenarios */}
            {isScenarioStep && (
              <motion.div key={`scenario-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  {currentScenario.label}
                </div>
                <p className="text-foreground text-sm leading-relaxed bg-muted rounded-xl p-3">
                  {currentScenario.prompt}
                </p>
                <textarea
                  value={responses[currentKey]}
                  onChange={e => setResponses(prev => ({ ...prev, [currentKey]: e.target.value }))}
                  placeholder={currentScenario.placeholder}
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-background text-sm text-foreground p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-muted-foreground"
                  style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
                />
                {responses[currentKey]?.trim().length > 0 && responses[currentKey]?.trim().length <= 20 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">Please share a bit more about your thinking...</p>
                )}
              </motion.div>
            )}

            {/* STEP 5 — Done */}
            {step === 5 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pb-4">
                <div className="flex flex-col items-center text-center space-y-2 pt-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="text-2xl text-white">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">You're in, {displayName}!</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your responses have been saved. Thank you for participating in this research study.
                  </p>
                </div>

                {/* App Overview */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Welcome to</p>
                    <h2 className="text-2xl font-black text-white">ME-Score</h2>
                    <p className="text-slate-400 text-sm mt-1">Your Moral Ethics Intelligence Platform</p>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed text-center">
                    ME-Score trains you to think, decide, and reason like history's greatest ethical minds — through real scenarios, philosophy, and practical challenges.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-purple-900/50 border border-purple-700/40 rounded-xl p-3">
                      <p className="text-sm font-semibold text-purple-300 mb-1">⚖️ Dilemmas</p>
                      <p className="text-xs text-purple-400">Multi-round ethical scenarios that evolve with your choices</p>
                    </div>
                    <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl p-3">
                      <p className="text-sm font-semibold text-emerald-300 mb-1">📖 Lessons</p>
                      <p className="text-xs text-emerald-400">Wisdom from philosophy, psychology & literary masters</p>
                    </div>
                    <div className="bg-amber-900/50 border border-amber-700/40 rounded-xl p-3">
                      <p className="text-sm font-semibold text-amber-300 mb-1">🎯 Challenges</p>
                      <p className="text-xs text-amber-400">Real-world exercises that build character & discipline</p>
                    </div>
                    <div className="bg-blue-900/50 border border-blue-700/40 rounded-xl p-3">
                      <p className="text-sm font-semibold text-blue-300 mb-1">📊 ME-Score</p>
                      <p className="text-xs text-blue-400">Track growth across 5 dimensions: Logic, Empathy, Integrity, Discipline & Emotional Regulation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 text-xs text-indigo-700 dark:text-indigo-300 text-center">
                  Your survey responses are confidential and used only for research purposes.
                </div>

                <Button onClick={() => onComplete(null)} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base rounded-2xl">
                  Enter ME-Score →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </motion.div>
  );
}
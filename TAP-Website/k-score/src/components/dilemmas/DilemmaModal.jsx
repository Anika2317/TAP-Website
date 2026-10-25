import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackButton } from '@/hooks/useBackButton';
import { X, Scale, User, Lightbulb, Zap, Brain, BarChart2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

// Each round adds a complication to the scenario
function getRoundComplication(dilemma, roundIndex, previousChoice) {
  const complications = dilemma.complications || [];
  if (complications[roundIndex]) return complications[roundIndex];
  // Fallback generic complications based on previous choice
  const fallbacks = [
    `New information comes in — the situation is more complicated than it seemed. Does your choice still feel right?`,
    `Someone you trust strongly disagrees with what you did. They have a point.`,
    `You find out there are consequences you didn't see coming. The stakes are higher now.`,
    `Things are heating up. Others are paying attention to how you handle this.`,
    `You're running out of time. You need to decide again, quickly.`,
  ];
  return fallbacks[roundIndex % fallbacks.length];
}

function generateAnalysis(dilemma, choiceHistory) {
  // Tally dominant philosophical tendencies from choices
  const philosophyCounts = {};
  const skillTotals = {};

  choiceHistory.forEach(({ choice }) => {
    if (choice.philosophy) {
      philosophyCounts[choice.philosophy] = (philosophyCounts[choice.philosophy] || 0) + 1;
    }
    if (choice.score_impacts) {
      Object.entries(choice.score_impacts).forEach(([skill, val]) => {
        skillTotals[skill] = (skillTotals[skill] || 0) + val;
      });
    }
  });

  const topPhilosophy = Object.entries(philosophyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
  const topSkill = Object.entries(skillTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'balanced';

  const profileMap = {
    'Utilitarianism': { label: 'Outcome-Focused', desc: 'You tend to choose what leads to the best results for the most people. You\'re practical and willing to make tough calls when the outcome justifies it.' },
    'Deontology': { label: 'Rule-Driven', desc: 'You stick to your principles no matter what happens. You believe some things are simply right or wrong, regardless of the outcome.' },
    'Virtue Ethics': { label: 'Character-Led', desc: 'You ask "what would a good person do?" rather than calculating what leads to the best result. You let your values guide you.' },
    'Socratic Method': { label: 'Question-First', desc: 'You prefer to question and explore rather than jump to answers. You value honesty and careful thinking over certainty.' },
    'Rawls': { label: 'Fairness-First', desc: 'You care deeply about fairness. You tend to choose what you\'d still think was right if you didn\'t know where you\'d end up in the situation.' },
    default: { label: 'Independent Thinker', desc: 'You draw from different ways of thinking depending on the situation. You don\'t stick to one approach — you adapt.' },
  };

  const profile = profileMap[topPhilosophy] || profileMap.default;

  const skillLabels = {
    logic: 'Logic',
    empathy: 'Empathy',
    integrity: 'Integrity',
    discipline: 'Discipline',
    emotional_regulation: 'Emotional Regulation',
  };

  const topSkillLabel = skillLabels[topSkill] || topSkill;

  return { profile, topSkillLabel, philosophyCounts, skillTotals };
}

const ROUNDS_PER_DILEMMA = 5;

export default function DilemmaModal({ dilemma, onClose, onComplete, savedAnalysis }) {
  const [round, setRound] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isGeneratingComplication, setIsGeneratingComplication] = useState(false);
  const [dynamicRounds, setDynamicRounds] = useState({});
  const finalHistoryRef = useRef([]);

  // Lock body scroll on mobile
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Handle back button
  useBackButton(onClose);

  const totalRounds = Math.min(ROUNDS_PER_DILEMMA, dilemma.choices?.length || 3);
  const isLastRound = round >= totalRounds - 1;
  const currentChoices = round > 0 && dynamicRounds[round]?.choices ? dynamicRounds[round].choices : (dilemma.choices || []);
  const complication = round > 0 ? dynamicRounds[round]?.complication : null;

  const handleChoiceSelect = async (index) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(index);
    setShowExplanation(true);

    if (!isLastRound) {
      setIsGeneratingComplication(true);
      const chosenText = currentChoices[index]?.text;
      // Build history summary for context
      const historyContext = choiceHistory.map((h, i) => `Round ${i+1}: chose "${h.choice.text}"`).join('\n');
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are running a philosophical/ethical dilemma exercise.

Dilemma: "${dilemma.title}"
Original scenario: "${dilemma.scenario}"
${historyContext ? `Previous choices:\n${historyContext}\n` : ''}Round ${round + 1}: user chose "${chosenText}"

Generate the NEXT round (round ${round + 2} of ${totalRounds}).

Return a JSON object with:
1. "complication": 2-3 sentence paragraph that flows from the user's choice — a new development/twist written in second person ("You discover...", "Days later..."). No questions. Vivid and morally escalating.
2. "choices": array of exactly 4 choice objects, each tailored to the new complication. Each choice must have:
   - "text": 1 sentence action the user takes (starts with a verb, e.g. "Stand firm and...")
   - "philosopher": philosopher name
   - "philosophy": philosophy name (Utilitarianism / Deontology / Virtue Ethics / Rawls / Socratic Method)
   - "explanation": 1-2 sentences explaining the philosophical reasoning
   - "score_impacts": object with keys logic, empathy, discipline, emotional_regulation, integrity — each a number between -5 and 10

The choices must feel like genuine responses to the complication, not generic options.`,
          response_json_schema: {
            type: 'object',
            properties: {
              complication: { type: 'string' },
              choices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    philosopher: { type: 'string' },
                    philosophy: { type: 'string' },
                    explanation: { type: 'string' },
                    score_impacts: {
                      type: 'object',
                      properties: {
                        logic: { type: 'number' },
                        empathy: { type: 'number' },
                        discipline: { type: 'number' },
                        emotional_regulation: { type: 'number' },
                        integrity: { type: 'number' },
                      }
                    }
                  }
                }
              }
            }
          }
        });
        setDynamicRounds(prev => ({
          ...prev,
          [round + 1]: {
            complication: result.complication || getRoundComplication(dilemma, round, currentChoices[index]),
            choices: result.choices?.length ? result.choices : currentChoices,
          }
        }));
      } catch (e) {
        setDynamicRounds(prev => ({
          ...prev,
          [round + 1]: {
            complication: getRoundComplication(dilemma, round, currentChoices[index]),
            choices: currentChoices,
          }
        }));
      }
      setIsGeneratingComplication(false);
    }
  };

  const handleNextRound = () => {
    const choice = currentChoices[selectedChoice];
    setChoiceHistory(prev => [...prev, { round, choice }]);
    setRound(r => r + 1);
    setSelectedChoice(null);
    setShowExplanation(false);
    // complication stays set from the async call so it's ready when the next round renders
  };

  const handleFinish = () => {
    const choice = currentChoices[selectedChoice];
    const finalHistory = [...choiceHistory, { round, choice }];
    finalHistoryRef.current = finalHistory;
    setChoiceHistory(finalHistory);
    setShowAnalysis(true);
  };

  const handleComplete = () => {
    // Use ref to guarantee we have the final history including last round
    const history = finalHistoryRef.current.length > 0 ? finalHistoryRef.current : choiceHistory;

    // Average the score impacts across all rounds so completing a dilemma gives
    // a single balanced score bump — not a 5x multiplied total.
    const sumImpacts = {};
    history.forEach(({ choice }) => {
      Object.entries(choice.score_impacts || {}).forEach(([k, v]) => {
        sumImpacts[k] = (sumImpacts[k] || 0) + v;
      });
    });
    const roundCount = history.length || 1;
    const averagedImpacts = {};
    Object.entries(sumImpacts).forEach(([k, v]) => {
      averagedImpacts[k] = Math.round(v / roundCount);
    });
    const aggregatedChoice = { score_impacts: averagedImpacts };
    const analysis = generateAnalysis(dilemma, history);
    const actualRounds = history.length;
    onComplete(dilemma, aggregatedChoice, {
      profile_label: analysis.profile.label,
      profile_desc: analysis.profile.desc,
      top_skill_label: analysis.topSkillLabel,
      philosophy_counts: analysis.philosophyCounts,
      skill_totals: analysis.skillTotals,
      choice_history: history.map(({ round, choice }) => ({
        round: round + 1,
        choice_text: choice.text,
        philosopher: choice.philosopher,
        philosophy: choice.philosophy,
      })),
    }, actualRounds);
  };

  // REVIEW MODE — show saved analysis for already-completed dilemma
  if (savedAnalysis && !showAnalysis) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} style={{ touchAction: 'none' }} />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden" style={{ maxHeight: '75dvh', height: '75dvh' }}>
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-3 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-xs text-foreground leading-tight">{dilemma.title}</h2>
                <p className="text-xs text-purple-600 dark:text-purple-400">Your moral profile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            <div className="p-3 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{dilemma.scenario}</p>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-3">
                <p className="text-[10px] text-purple-500 font-medium mb-0.5">YOUR ETHICAL PROFILE</p>
                <h3 className="text-base font-bold text-purple-900 mb-1">{savedAnalysis.profile_label}</h3>
                <p className="text-slate-700 text-xs leading-relaxed">{savedAnalysis.profile_desc}</p>
              </div>
              {savedAnalysis.top_skill_label && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800 rounded-xl p-2.5">
                  <p className="text-[10px] text-amber-600 font-medium mb-0.5">STRONGEST DIMENSION</p>
                  <p className="text-sm font-semibold text-amber-900">{savedAnalysis.top_skill_label}</p>
                </div>
              )}
              {savedAnalysis.philosophy_counts && Object.keys(savedAnalysis.philosophy_counts).length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 font-medium mb-2">PHILOSOPHICAL TENDENCIES</p>
                  <div className="space-y-1.5">
                    {Object.entries(savedAnalysis.philosophy_counts).sort((a, b) => b[1] - a[1]).map(([phil, count]) => {
                      const total = Object.values(savedAnalysis.philosophy_counts).reduce((s, v) => s + v, 0);
                      return (
                        <div key={phil}>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-slate-700 font-medium">{phil}</span>
                            <span className="text-slate-400">{count}/{total}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {savedAnalysis.skill_totals && Object.keys(savedAnalysis.skill_totals).length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 font-medium mb-1.5">ME-SCORE IMPACT</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(savedAnalysis.skill_totals).filter(([, v]) => v !== 0).map(([skill, value]) => (
                      <span key={skill} className={`text-[10px] px-2 py-1 rounded-full font-medium ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {skill.replace('_', ' ')}: {value > 0 ? '+' : ''}{value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {savedAnalysis.completed_at && (
                <p className="text-xs text-slate-400 text-center">{new Date(savedAnalysis.completed_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-border p-3 bg-card" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
            <button onClick={onClose} className="w-full h-11 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (showAnalysis) {
    const history = finalHistoryRef.current.length > 0 ? finalHistoryRef.current : choiceHistory;
    const analysis = generateAnalysis(dilemma, history);
    const earnedXp = (dilemma.xp_reward || 10) * history.length;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} style={{ touchAction: 'none' }} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
          style={{ maxHeight: '75dvh', height: '75dvh' }}
        >
        <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          <div className="sticky top-0 bg-card border-b border-border px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-xs text-foreground">Your Moral Profile</h2>
                <p className="text-xs text-purple-600 dark:text-purple-400">Analysis complete</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close dilemma"
            >
              <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-3"
            >
              <p className="text-[10px] text-purple-500 font-medium mb-0.5">YOUR ETHICAL PROFILE</p>
              <h3 className="text-base font-bold text-purple-900 mb-1">{analysis.profile.label}</h3>
              <p className="text-slate-700 text-xs leading-relaxed">{analysis.profile.desc}</p>
              <p className="text-[10px] text-purple-400 mt-1">{history.length} rounds completed</p>
            </motion.div>

            {/* Top strength */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-50 border border-amber-100 rounded-xl p-2.5"
            >
              <p className="text-[10px] text-amber-600 font-medium mb-0.5">STRONGEST DIMENSION</p>
              <p className="text-sm font-semibold text-amber-900">{analysis.topSkillLabel}</p>
            </motion.div>

            {/* Philosophy breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-[10px] text-slate-500 font-medium mb-2">PHILOSOPHICAL TENDENCIES</p>
              <div className="space-y-1.5">
                {Object.entries(analysis.philosophyCounts).sort((a, b) => b[1] - a[1]).map(([phil, count]) => (
                  <div key={phil}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-700 font-medium">{phil}</span>
                      <span className="text-slate-400">{count}/{history.length}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / choiceHistory.length) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Round-by-round recap */}
            {history.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <p className="text-[10px] text-slate-500 font-medium mb-1.5">YOUR CHOICES</p>
                <div className="space-y-1.5">
                  {history.map(({ round: r, choice: c }, i) => (
                    <div key={i} className="bg-purple-50 dark:bg-purple-950/20 rounded-lg px-2.5 py-2">
                      <div className="flex gap-1.5 text-[10px]">
                        <span className="text-purple-400 font-bold flex-shrink-0">R{r + 1}:</span>
                        <span className="text-purple-800 dark:text-purple-200 flex-1 leading-relaxed">{c.text}</span>
                      </div>
                      <p className="text-[10px] text-purple-400 italic ml-5">{c.philosopher} · {c.philosophy}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Score impacts */}
            {Object.keys(analysis.skillTotals).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-[10px] text-slate-500 font-medium mb-1.5">ME-SCORE IMPACT</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(analysis.skillTotals).filter(([, v]) => v !== 0).map(([skill, value]) => (
                    <span key={skill} className={`text-[10px] px-2 py-1 rounded-full font-medium ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {skill.replace('_', ' ')}: {value > 0 ? '+' : ''}{value}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* Sticky footer for analysis */}
        <div className="flex-shrink-0 border-t border-border p-3 bg-card" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          <Button onClick={handleComplete} className="w-full h-11 text-sm font-semibold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Brain className="w-4 h-4 mr-2" />
            Save My Analysis
          </Button>
        </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} style={{ touchAction: 'none' }} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '75dvh', height: '75dvh' }}
        >
        {/* Header */}
        <div className="border-b border-border px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-xs text-foreground leading-tight">{dilemma.title}</h2>
              <p className="text-xs text-purple-600 capitalize">{dilemma.category} dilemma</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Round {round + 1}/{totalRounds}</span>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1.5"
              aria-label="Close dilemma"
            >
              <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 px-3 py-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < round ? 'bg-purple-500' : i === round ? 'bg-purple-300' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="px-3 pt-2 pb-2" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', flex: '1 1 0', minHeight: 0, overscrollBehavior: 'contain' }}>
          {/* Scenario */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`scenario-${round}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2"
            >
              <h3 className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                {round === 0 ? 'The Scenario' : `Round ${round + 1} — Evolves`}
              </h3>
              {round === 0 ? (
                <p className="text-xs text-foreground leading-relaxed">{dilemma.scenario}</p>
              ) : (
                <div className="bg-muted border border-border rounded-lg p-2">
                  {complication ? (
                    <p className="text-xs text-foreground leading-relaxed">{complication}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin flex-shrink-0" />
                      <p className="text-slate-400 italic text-xs">The story deepens…</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Choices */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`choices-${round}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1.5 mb-2"
            >
              <h3 className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                {round === 0 ? 'What Would You Do?' : 'How Do You Respond?'}
              </h3>

              {currentChoices.map((choice, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectedChoice === null && handleChoiceSelect(index)}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: selectedChoice === null ? 'pointer' : 'default', userSelect: 'none' }}
                  className={`relative p-2 rounded-lg border-2 transition-all active:scale-[0.99] ${
                    selectedChoice === index
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : selectedChoice !== null
                      ? 'border-border bg-muted opacity-40'
                      : 'border-border bg-card hover:border-purple-300'
                      }`}
                      >
                      <p className="text-xs font-medium text-foreground">{choice.text}</p>

                      <AnimatePresence>
                      {showExplanation && selectedChoice === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 pt-1.5 border-t border-purple-200"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <User className="w-2.5 h-2.5 text-purple-600" />
                          <span className="text-[10px] font-semibold text-purple-700">{choice.philosopher}</span>
                          <span className="text-[10px] text-purple-500">• {choice.philosophy}</span>
                        </div>
                        <div className="flex items-start gap-1 p-1.5 rounded-lg bg-card">
                          <Lightbulb className="w-2.5 h-2.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{choice.explanation}</p>
                        </div>
                        {choice.score_impacts && (
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {Object.entries(choice.score_impacts).map(([skill, value]) =>
                              value !== 0 ? (
                                <span key={skill} className={`text-[9px] px-1 py-0.5 rounded-full ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {skill.replace('_', ' ')}: {value > 0 ? '+' : ''}{value}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}
                      </motion.div>
                      )}
                      </AnimatePresence>
                      </div>
                      ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky bottom action button */}
        <div className="flex-shrink-0 border-t border-border bg-card px-3 py-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}>
          <AnimatePresence mode="wait">
            {showExplanation && (
              <motion.div key={`footer-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {isLastRound ? (
                  <Button onClick={handleFinish} className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600">
                    <BarChart2 className="w-4 h-4 mr-1.5" /> See My Analysis
                  </Button>
                ) : (
                  <Button onClick={handleNextRound} className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600">
                    {isGeneratingComplication ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Preparing Round {round + 2}…</span>
                    ) : (
                      <span>Continue to Round {round + 2} →</span>
                    )}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
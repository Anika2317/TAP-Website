import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackButton } from '@/hooks/useBackButton';
import {
  X, BookOpen, MessageCircle, ChevronRight, ChevronLeft,
  Brain, Feather, CheckCircle2, XCircle, HelpCircle, Sparkles, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import LiteraryReadStep from './LiteraryReadStep';

const depthOptions = [
  { label: "Just skimmed it", description: "I read it but it didn't sink in", scoreMultiplier: 0.5 },
  { label: "Got it", description: "The idea makes sense to me", scoreMultiplier: 1.0 },
  { label: "It clicked", description: "This connects to my life", scoreMultiplier: 1.5 },
  { label: "Changed my thinking", description: "This shifted how I see something", scoreMultiplier: 2.0 },
];

const STEPS = { READ: 'read', QUIZ: 'quiz', REFLECT: 'reflect', DEPTH: 'depth' };
const STEP_ORDER = [STEPS.READ, STEPS.QUIZ, STEPS.REFLECT, STEPS.DEPTH];

export default function LessonModal({ lesson, onClose, onComplete, savedReflection }) {
  // If lesson is already completed with a saved reflection, start in review mode
  const [reviewMode] = useState(!!savedReflection);

  // Lock body scroll on mobile
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const [step, setStep] = useState(STEPS.READ);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [selectedDepth, setSelectedDepth] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Handle back button
  useBackButton(onClose);

  const isLiterary = lesson.section === 'literary_masters';
  // Score boost: based on the lesson's defined xp_reward (default 15), scaled by depth and quiz bonus
  const baseScore = lesson.xp_reward || 15;
  const quizBonus = quizCorrect ? 1.2 : 1.0;
  const finalScoreBoost = selectedDepth ? Math.max(1, Math.round(baseScore * selectedDepth.scoreMultiplier * quizBonus)) : 1;

  const currentStepIndex = STEP_ORDER.indexOf(step);

  const stepLabels = ['Read', 'Quiz', 'Reflect', 'Depth'];

  const loadQuiz = async () => {
    setQuizLoading(true);
    setStep(STEPS.QUIZ);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this lesson about "${lesson.title}" by ${lesson.thinker}:

${lesson.content}

Create ONE multiple-choice comprehension question that tests deep understanding (not just recall). 
Return JSON with: question (string), options (array of 4 strings), correctIndex (0-3), explanation (why the correct answer is right, 1-2 sentences).`,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correctIndex: { type: "number" },
            explanation: { type: "string" }
          }
        }
      });
      setQuiz(result);
    } catch {
      // If quiz fails, skip to reflect
      setStep(STEPS.REFLECT);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerSelect = (idx) => {
    if (quizAnswered) return;
    setSelectedAnswer(idx);
    setQuizAnswered(true);
    setQuizCorrect(idx === quiz.correctIndex);
  };

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(lesson, { scoreBoost: finalScoreBoost, reflection: reflectionAnswer, depthLabel: selectedDepth?.label });
    setCompleting(false);
  };

  // REVIEW MODE — show completed lesson + saved reflection
  if (reviewMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} style={{ touchAction: 'none' }} />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden" style={{ maxHeight: '75dvh', height: '75dvh' }}>
            {/* Header */}
            <div className="border-b border-slate-100 px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full hover:bg-slate-100"
                  aria-label="Close lesson review"
                >
                  <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
              <div className="p-3 space-y-3">
                {lesson.key_insight && (
                  <div className="px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-800 leading-snug">{lesson.key_insight}</p>
                  </div>
                )}

                {/* Lesson content */}
                <div className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-p:my-1.5 text-slate-700">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>

                {/* Saved reflection */}
                {savedReflection?.reflection && (
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Quote className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">Your Reflection</span>
                      {savedReflection.depth_label && (
                        <span className="ml-auto text-[10px] text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded-full">{savedReflection.depth_label}</span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-800 italic leading-relaxed">"{savedReflection.reflection}"</p>
                    {savedReflection.completed_at && (
                      <p className="text-[10px] text-indigo-400 mt-1">{new Date(savedReflection.completed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                )}

                {/* Reflection question reminder */}
                {lesson.reflection_question && (
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Reflection prompt</span>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{lesson.reflection_question}"</p>
                  </div>
                )}
              </div>
            </div>

          <div className="flex-shrink-0 border-t border-slate-100 p-3 bg-white" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
            <button onClick={onClose} className="w-full h-11 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </button>
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} style={{ touchAction: 'none' }} />
      <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
      style={{ maxHeight: '75dvh', height: '75dvh' }}
      >
          {/* Header */}
        <div className="bg-white border-b border-slate-100 px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600">
                {isLiterary ? <Feather className="w-4 h-4 text-white" /> : <BookOpen className="w-4 h-4 text-white" />}
              </div>
              <div>
                <h2 className="font-semibold text-xs text-slate-900 leading-tight">{lesson.title}</h2>
                <p className="text-xs text-emerald-700">by {lesson.thinker}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1.5">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-0.5">
            {STEP_ORDER.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStepIndex
                      ? 'bg-emerald-600 text-white'
                      : i === currentStepIndex
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle2 className="w-2.5 h-2.5" /> : i + 1}
                  </div>
                  <span className={`text-[8px] mt-0.5 ${
                    i === currentStepIndex
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-400'
                  }`}>{stepLabels[i]}</span>
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-2 transition-all ${
                    i < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action Buttons at Top */}
        <div className="px-3 py-2 border-b border-slate-100">
          {/* Back to lesson button for quiz and reflect steps */}
          {(step === STEPS.QUIZ || step === STEPS.REFLECT) && (
            <button
              onClick={() => setStep(STEPS.READ)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 mb-2 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to lesson
            </button>
          )}
          <AnimatePresence mode="wait">
            {step === STEPS.READ && !isLiterary && (
              <motion.div key="btn-read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button onClick={loadQuiz} className="w-full h-9 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                  Done reading — Take Quiz <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </motion.div>
            )}
            {step === STEPS.QUIZ && quizAnswered && (
              <motion.div key="btn-quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button onClick={() => setStep(STEPS.REFLECT)} className="w-full h-9 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                  Next: Reflect <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </motion.div>
            )}
            {step === STEPS.REFLECT && (
              <motion.div key="btn-reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button onClick={() => setStep(STEPS.DEPTH)} disabled={reflectionAnswer.trim().length < 5} className="w-full h-9 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                  <Brain className="w-3.5 h-3.5 mr-1.5" /> How much did this land?
                </Button>
              </motion.div>
            )}
            {step === STEPS.DEPTH && selectedDepth && (
              <motion.div key="btn-depth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-center gap-3 mb-1.5 text-xs text-slate-500">
                  <span><span className="font-bold text-emerald-700">+{finalScoreBoost}</span> ME-Score</span>
                  {quizCorrect && <span className="text-green-600 font-medium">+20%</span>}
                </div>
                <Button onClick={handleComplete} disabled={completing} className="w-full h-9 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                  {completing ? <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 mr-1.5" />}
                  Claim Reward
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', flex: '1 1 0', minHeight: 0, overscrollBehavior: 'contain' }}>
          <AnimatePresence mode="wait">

            {/* STEP 1: READ */}
            {step === STEPS.READ && (
              <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isLiterary ? (
                  <LiteraryReadStep lesson={lesson} onFinish={loadQuiz} />
                ) : (
                  <div className="p-3">
                    {lesson.key_insight && (
                      <div className="mb-2 px-2 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-xs font-semibold text-emerald-800 leading-snug">{lesson.key_insight}</p>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-p:my-1 prose-h2:text-sm prose-h3:text-xs prose-ul:my-1 prose-li:my-0.5 text-slate-700 text-xs">
                      <ReactMarkdown>{lesson.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: QUIZ */}
            {step === STEPS.QUIZ && (
              <motion.div key="quiz" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="p-3">
                {quizLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-10 h-10 rounded-full border-4 border-t-transparent border-emerald-500"
                    />
                    <p className="text-sm text-slate-500">Building your quiz…</p>
                  </div>
                ) : quiz ? (
                  <>
                    <div className="mb-2 p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Quiz</span>
                      </div>
                      <p className="font-semibold text-xs leading-snug text-slate-800">{quiz.question}</p>
                    </div>

                    <div className="space-y-1.5 mb-2">
                      {quiz.options.map((opt, i) => {
                        const isSelected = selectedAnswer === i;
                        const isCorrect = i === quiz.correctIndex;
                        let style = 'border-slate-200 bg-white';
                        if (quizAnswered) {
                          if (isCorrect) style = 'border-green-500 bg-green-50';
                          else if (isSelected) style = 'border-red-400 bg-red-50';
                        } else if (isSelected) {
                          style = 'border-emerald-500 bg-emerald-50';
                        }
                        return (
                          <motion.button
                            key={i}
                            whileHover={!quizAnswered ? { scale: 1.01 } : {}}
                            whileTap={!quizAnswered ? { scale: 0.99 } : {}}
                            onClick={() => handleAnswerSelect(i)}
                            disabled={quizAnswered}
                            className={`w-full text-left p-2 rounded-xl border-2 transition-all flex items-center gap-2 ${style} ${!quizAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              quizAnswered && isCorrect ? 'bg-green-500 text-white' :
                              quizAnswered && isSelected ? 'bg-red-400 text-white' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {quizAnswered && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                               quizAnswered && isSelected ? <XCircle className="w-3.5 h-3.5" /> :
                               String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-xs font-medium text-slate-700">{opt}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {quizAnswered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-2 rounded-xl border ${quizCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                        >
                          <p className={`font-semibold mb-0.5 text-xs ${quizCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {quizCorrect ? 'Correct!' : 'Not quite —'}
                          </p>
                          <p className={`text-xs ${quizCorrect ? 'text-green-600' : 'text-red-600'}`}>{quiz.explanation}</p>
                          {quizCorrect && <p className="text-xs text-green-600 mt-0.5 font-medium">+20% ME-Score bonus!</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : null}
              </motion.div>
            )}

            {/* STEP 3: REFLECT */}
            {step === STEPS.REFLECT && (
              <motion.div key="reflect" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="p-3">
                <div className="mb-2 p-2 rounded-xl border bg-emerald-50 border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <h3 className="font-semibold text-xs text-emerald-800">Reflection</h3>
                  </div>
                  <p className="italic text-xs text-emerald-700">"{lesson.reflection_question}"</p>
                </div>

                <Textarea
                  placeholder="Write your honest answer here…"
                  value={reflectionAnswer}
                  onChange={(e) => setReflectionAnswer(e.target.value)}
                  className="min-h-[90px] rounded-xl mb-1.5 text-xs"
                />
                <p className={`text-xs ${reflectionAnswer.trim().length < 5 ? 'text-slate-400' : 'text-green-500 font-medium'}`}>
                  {reflectionAnswer.trim().length < 5 ? `${Math.max(0, 5 - reflectionAnswer.trim().length)} more characters needed` : 'Ready to continue'}
                </p>
              </motion.div>
            )}

            {/* STEP 4: DEPTH */}
            {step === STEPS.DEPTH && (
              <motion.div key="depth" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="p-3">
                <h3 className="text-sm font-bold mb-0.5 text-slate-900">How much did this sink in?</h3>
                <p className="text-xs mb-2 text-slate-500">Be honest — it affects your score.</p>

                <div className="space-y-1.5">
                  {depthOptions.map((opt, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedDepth(opt)}
                      className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDepth === opt
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-slate-800">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.description}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">×{opt.scoreMultiplier}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
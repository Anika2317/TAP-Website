import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Feather, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

function splitIntoCards(content) {
  // Split by markdown headings (##) or double newline + bold, or just paragraphs
  const sections = content.split(/\n(?=##|\n\*\*|>\s)/g).filter(s => s.trim());
  
  // Group into chunks of ~300 chars max, but keep logical sections together
  const cards = [];
  let current = '';
  
  for (const section of sections) {
    if (current.length + section.length > 350 && current.length > 80) {
      cards.push(current.trim());
      current = section;
    } else {
      current += (current ? '\n\n' : '') + section;
    }
  }
  if (current.trim()) cards.push(current.trim());
  
  // Ensure we have at least 3 cards
  if (cards.length < 2) {
    const lines = content.split('\n\n').filter(l => l.trim());
    const half = Math.ceil(lines.length / 2);
    return [lines.slice(0, half).join('\n\n'), lines.slice(half).join('\n\n')].filter(Boolean);
  }
  
  return cards;
}

function renderCard(text) {
  // Render simple markdown-ish formatting
  return text
    .replace(/##\s+(.+)/g, '<h3 class="text-lg font-bold text-slate-900 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-600">$1</em>')
    .replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-3 border-amber-400 pl-3 my-2 italic text-slate-700 text-base">$1</blockquote>')
    .replace(/^(\d+)\.\s+\*\*(.+?)\*\*\s*—\s*(.+)$/gm, '<div class="flex gap-2 mb-1"><span class="font-bold text-emerald-700">$1.</span><span><strong>$2</strong> — $3</span></div>')
    .replace(/^-\s+(.+)$/gm, '<div class="flex gap-2 mb-1 text-sm"><span class="text-emerald-600 mt-0.5">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>');
}

export default function LiteraryReadStep({ lesson, onFinish }) {
  const cards = splitIntoCards(lesson.content);
  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (cardIndex < cards.length - 1) {
      setDirection(1);
      setCardIndex(i => i + 1);
    } else {
      onFinish();
    }
  };

  const goPrev = () => {
    if (cardIndex > 0) {
      setDirection(-1);
      setCardIndex(i => i - 1);
    }
  };

  const isLast = cardIndex === cards.length - 1;

  return (
    <div className="p-5">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-5">
        {cards.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === cardIndex ? 20 : 6, opacity: i <= cardIndex ? 1 : 0.3 }}
            className={`h-1.5 rounded-full ${i <= cardIndex ? 'bg-amber-500' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="overflow-hidden mb-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={cardIndex}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Decorative header for first card */}
            {cardIndex === 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Feather className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Literary Wisdom</span>
              </div>
            )}

            <div
              className="text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderCard(cards[cardIndex]) }}
            />

            {/* Key insight on last card */}
            {isLast && lesson.key_insight && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Key Insight</span>
                </div>
                <p className="text-sm text-amber-800 italic">"{lesson.key_insight}"</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={cardIndex === 0}
          className="w-11 h-11 rounded-2xl border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>

        <Button
          onClick={goNext}
          className={`flex-1 h-11 font-semibold rounded-2xl text-sm ${
            isLast
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
          }`}
        >
          {isLast ? (
            <>
              <Sparkles className="w-4 h-4 mr-1" />
              I've read this — Take Quiz
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400 mt-2">{cardIndex + 1} of {cards.length}</p>
    </div>
  );
}
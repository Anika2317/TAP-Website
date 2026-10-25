import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Quote, Brain, Heart, Target, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const skillIcons = {
  logic: Brain,
  empathy: Heart,
  discipline: Target,
  emotional_regulation: Sparkles,
  integrity: Shield,
};

const skillGradients = {
  logic: 'from-navy-700 to-slate-800',
  empathy: 'from-emerald-500 to-teal-600',
  discipline: 'from-slate-600 to-slate-800',
  emotional_regulation: 'from-teal-500 to-emerald-700',
  integrity: 'from-emerald-600 to-teal-700',
};

const skillBgGradients = {
  logic: 'from-slate-50 to-slate-100',
  empathy: 'from-emerald-50 to-teal-50',
  discipline: 'from-slate-50 to-slate-100',
  emotional_regulation: 'from-teal-50 to-emerald-50',
  integrity: 'from-emerald-50 to-teal-50',
};

export default function Affirmations() {
  const [filter, setFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: affirmations, isLoading } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => base44.entities.Affirmation.list(),
  });

  const filteredAffirmations = affirmations?.filter(a => 
    filter === 'all' || a.target_skill === filter
  );

  const currentAffirmation = filteredAffirmations?.[currentIndex];

  const goNext = () => {
    if (filteredAffirmations?.length) {
      setCurrentIndex((prev) => (prev + 1) % filteredAffirmations.length);
    }
  };

  const goPrev = () => {
    if (filteredAffirmations?.length) {
      setCurrentIndex((prev) => (prev - 1 + filteredAffirmations.length) % filteredAffirmations.length);
    }
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 dark:text-emerald-400" />
      </div>
    );
  }

  const Icon = currentAffirmation ? skillIcons[currentAffirmation.target_skill] : Sparkles;
  const gradient = currentAffirmation ? skillGradients[currentAffirmation.target_skill] : 'from-emerald-500 to-teal-600';
  const bgGradient = currentAffirmation ? skillBgGradients[currentAffirmation.target_skill] : 'from-emerald-50 to-teal-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-50/20 dark:via-emerald-950/10 to-muted">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Affirmations</h1>
              <p className="text-muted-foreground text-sm">Science-backed neural rewiring</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="logic">Logic</TabsTrigger>
              <TabsTrigger value="empathy">Empathy</TabsTrigger>
              <TabsTrigger value="discipline">Discipline</TabsTrigger>
              <TabsTrigger value="integrity">Integrity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Affirmation Card */}
        {filteredAffirmations?.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No affirmations found</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`relative overflow-hidden rounded-3xl bg-card p-8 border border-border min-h-[300px] flex flex-col justify-center`}
              >
                {/* Decorative elements */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full opacity-10`} />
                <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full opacity-10`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 mx-auto`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Quote */}
                  <div className="text-center mb-6">
                    <Quote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-xl font-medium text-foreground leading-relaxed">
                      {currentAffirmation?.text}
                    </p>
                  </div>

                  {/* Science Note */}
                  {currentAffirmation?.science_note && (
                    <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 mt-6 border border-border">
                      <p className="text-sm text-muted-foreground">
                        {currentAffirmation.science_note}
                      </p>
                    </div>
                  )}

                  {/* Source */}
                  {currentAffirmation?.source && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      — {currentAffirmation.source}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={goPrev}
                className="w-12 h-12 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} / {filteredAffirmations?.length}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                className="w-12 h-12 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-5 rounded-2xl bg-card border border-border"
            >
              <h3 className="font-semibold text-foreground mb-3">How to Use Affirmations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Read aloud with conviction</li>
                <li>• Repeat 3 times in the morning</li>
                <li>• Visualize while speaking</li>
                <li>• Practice daily for 21+ days</li>
              </ul>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
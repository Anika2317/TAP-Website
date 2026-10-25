import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import DilemmaModal from '@/components/dilemmas/DilemmaModal';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  declined: { label: 'Declined', icon: XCircle, color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' },
};

export default function ChallengesSection({ user }) {
  const queryClient = useQueryClient();
  const [activeChallenge, setActiveChallenge] = useState(null); // { challenge, dilemma }
  const [tab, setTab] = useState('received');

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['dilemma_challenges', user?.email],
    queryFn: () => base44.entities.DilemmaChallenge.list('-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: dilemmas } = useQuery({
    queryKey: ['dilemmas'],
    queryFn: () => base44.entities.Dilemma.list(),
  });

  const updateChallengeMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.DilemmaChallenge.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dilemma_challenges'] }),
  });

  const received = (challenges || []).filter(c => c.recipient_email === user?.email);
  const sent = (challenges || []).filter(c => c.sender_email === user?.email);

  const pendingCount = received.filter(c => c.status === 'pending').length;

  const handleAccept = (challenge) => {
    const dilemma = (dilemmas || []).find(d => d.id === challenge.dilemma_id);
    if (dilemma) setActiveChallenge({ challenge, dilemma });
  };

  const handleChallengeComplete = async (challenge) => {
    await updateChallengeMutation.mutateAsync({ id: challenge.id, status: 'completed' });
    setActiveChallenge(null);
  };

  if (isLoading) return null;

  const list = tab === 'received' ? received : sent;

  return (
    <>
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border">
          <Swords className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-foreground text-sm flex-1">Dilemma Challenges</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">{pendingCount} new</span>
          )}
        </div>

        {/* Tab toggle */}
        <div className="flex border-b border-border">
          {['received', 'sent'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                tab === t ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-muted-foreground'
              }`}
            >
              {t === 'received' ? `Received (${received.length})` : `Sent (${sent.length})`}
            </button>
          ))}
        </div>

        <div className="p-3 space-y-2">
          {list.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-5">
              {tab === 'received' ? 'No challenges received yet.' : 'No challenges sent yet.'}
            </p>
          ) : (
            list.map((c, i) => {
              const cfg = statusConfig[c.status] || statusConfig.pending;
              const Icon = cfg.icon;
              const canAccept = tab === 'received' && c.status === 'pending';
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-border ${canAccept ? 'cursor-pointer hover:border-emerald-300 transition-colors' : ''}`}
                  onClick={canAccept ? () => handleAccept(c) : undefined}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Swords className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.dilemma_title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tab === 'received' ? `From ${c.sender_name || c.sender_email}` : `To ${c.recipient_email}`}
                    </p>
                    {c.message && <p className="text-xs text-muted-foreground italic mt-0.5 truncate">"{c.message}"</p>}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                  {canAccept && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Dilemma Modal for accepting challenge */}
      <AnimatePresence>
        {activeChallenge && (
          <DilemmaModal
            dilemma={activeChallenge.dilemma}
            onClose={() => setActiveChallenge(null)}
            onComplete={(dilemma, choice, analysis) => handleChallengeComplete(activeChallenge.challenge)}
            savedAnalysis={null}
          />
        )}
      </AnimatePresence>
    </>
  );
}
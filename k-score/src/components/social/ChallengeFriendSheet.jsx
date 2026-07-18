import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

export default function ChallengeFriendSheet({ user, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDilemma, setSelectedDilemma] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { data: dilemmas } = useQuery({
    queryKey: ['dilemmas'],
    queryFn: () => base44.entities.Dilemma.list(),
  });

  const { data: progressList } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const progress = progressList?.[0];
  const completedDilemmas = progress?.completed_dilemmas || [];
  const curriculumLevel = progress?.curriculum_level || 1;

  // Only show unlocked dilemmas
  const availableDilemmas = (dilemmas || []).filter(d => (d.curriculum_level || 1) <= curriculumLevel);

  const handleSend = async () => {
    setError('');
    if (!recipientEmail.trim() || !selectedDilemma) {
      setError('Please enter a friend\'s email and select a dilemma.');
      return;
    }
    if (recipientEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setError('You can\'t challenge yourself!');
      return;
    }
    setSending(true);
    const senderName = progress?.display_name || user?.full_name || user?.email?.split('@')[0] || 'A friend';
    await base44.entities.DilemmaChallenge.create({
      dilemma_id: selectedDilemma.id,
      dilemma_title: selectedDilemma.title,
      sender_email: user.email,
      sender_name: senderName,
      recipient_email: recipientEmail.trim().toLowerCase(),
      message: message.trim(),
      status: 'pending',
    });
    setSending(false);
    setSent(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl p-6 pb-10 z-10"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-foreground">Challenge a Friend</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">Challenge Sent!</h3>
              <p className="text-muted-foreground text-sm">Your friend will see the challenge on their Social page.</p>
              <Button className="mt-5 w-full" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Friend's email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Friend's Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Pick dilemma */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Choose a Dilemma</label>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {availableDilemmas.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDilemma(d)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                        selectedDilemma?.id === d.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-semibold'
                          : 'border-border bg-background text-foreground hover:border-emerald-300'
                      }`}
                    >
                      <span className="block font-medium truncate">{d.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">{d.category} · Lv.{d.curriculum_level || 1}</span>
                    </button>
                  ))}
                  {availableDilemmas.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Complete some dilemmas first to unlock challenges.</p>
                  )}
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Think you can handle this one?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {error && <p className="text-destructive text-xs">{error}</p>}

              <Button
                className="w-full"
                onClick={handleSend}
                disabled={sending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Challenge'}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
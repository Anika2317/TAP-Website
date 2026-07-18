import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

const SKILLS = [
  { key: 'logic_score', label: 'Logic' },
  { key: 'empathy_score', label: 'Empathy' },
  { key: 'discipline_score', label: 'Discipline' },
  { key: 'emotional_regulation_score', label: 'Emotional Regulation' },
  { key: 'integrity_score', label: 'Integrity' },
];

export default function ExportPDFButton({ progress, user, dilemmas }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210;
      let y = 20;

      const line = (text, x, size = 10, style = 'normal', color = [30, 30, 30]) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        doc.text(text, x, y);
      };

      const hr = (col = [200, 200, 200]) => {
        doc.setDrawColor(...col);
        doc.line(15, y, W - 15, y);
        y += 5;
      };

      const section = (title) => {
        y += 4;
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(15, y - 5, W - 30, 10, 2, 2, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(title, 20, y + 1);
        y += 10;
      };

      // Header
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, W, 35, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('ME-Score · Ethical Reasoning Profile', 15, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${user?.full_name || 'User'} · Generated ${new Date().toLocaleDateString()}`, 15, 28);
      y = 45;

      // ME-Score
      section('ME-Score Overview');
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, y, W - 30, 22, 3, 3, 'F');
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(String(progress?.k_score || 0), 25, y + 16);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('/ 1000 Overall ME-Score', 55, y + 10);
      doc.text(`Level ${progress?.curriculum_level || 1}  ·  ${progress?.xp || 0} XP  ·  ${progress?.streak_days || 0} day streak`, 55, y + 17);
      y += 28;

      // Skills
      section('5 Pillar Scores');
      SKILLS.forEach(s => {
        const score = progress?.[s.key] || 0;
        const pct = score / 200;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(s.label, 20, y + 4);
        doc.setTextColor(16, 185, 129);
        doc.text(`${score}/200`, W - 40, y + 4);
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(65, y, 100, 5, 1, 1, 'F');
        doc.setFillColor(16, 185, 129);
        if (pct > 0) doc.roundedRect(65, y, 100 * pct, 5, 1, 1, 'F');
        y += 9;
      });

      // Activity counts
      y += 2;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, W - 30, 14, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Lessons completed: ${progress?.completed_lessons?.length || 0}`, 22, y + 6);
      doc.text(`Dilemmas completed: ${progress?.completed_dilemmas?.length || 0}`, 80, y + 6);
      doc.text(`Challenges completed: ${progress?.completed_challenges?.length || 0}`, 145, y + 6);
      y += 18;

      // Dilemma analyses
      const analyses = progress?.dilemma_analyses || [];
      if (analyses.length > 0) {
        section('Dilemma Analysis History');
        analyses.forEach((a, i) => {
          if (y > 250) { doc.addPage(); y = 20; }
          const dilemma = dilemmas?.find(d => d.id === a.dilemma_id);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 30, 30);
          doc.text(`${i + 1}. ${dilemma?.title || 'Dilemma'}`, 20, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          if (a.profile_label) {
            doc.text(`Profile: ${a.profile_label}`, 25, y);
            y += 5;
          }
          if (a.top_skill_label) {
            doc.text(`Dominant trait: ${a.top_skill_label}`, 25, y);
            y += 5;
          }
          if (a.completed_at) {
            doc.text(`Completed: ${new Date(a.completed_at).toLocaleDateString()}`, 25, y);
            y += 5;
          }
          y += 3;
          doc.setDrawColor(220, 220, 220);
          doc.line(20, y, W - 20, y);
          y += 4;
        });
      }

      // Footer
      if (y > 260) { doc.addPage(); y = 20; }
      y += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by ME-Score · For personal reflection and research use', 15, y);

      doc.save(`ethical-profile-${user?.full_name?.replace(/ /g, '-') || 'report'}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generate}
      disabled={loading}
      variant="outline"
      className="gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? 'Generating PDF...' : 'Export PDF Report'}
    </Button>
  );
}
import { jsPDF } from 'jspdf';

const SKILLS = [
  { key: 'logic_score', label: 'Logic' },
  { key: 'empathy_score', label: 'Empathy' },
  { key: 'discipline_score', label: 'Discipline' },
  { key: 'emotional_regulation_score', label: 'Emotional Reg.' },
  { key: 'integrity_score', label: 'Integrity' },
];

export function exportUserPDF({ progress, survey, lessonMap, dilemmaMap, allChallenges }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 16;
  const contentW = W - margin * 2;
  let y = 18;

  const line = (text, fontSize = 10, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    doc.text(text, margin, y);
    y += fontSize * 0.45;
  };

  const checkPage = (needed = 12) => {
    if (y + needed > 280) { doc.addPage(); y = 18; }
  };

  const divider = () => {
    checkPage(6);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, W - margin, y);
    y += 5;
  };

  // Header block
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, y - 4, contentW, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(progress.display_name || 'Participant', margin + 4, y + 6);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(progress.created_by || '', margin + 4, y + 13);
  if (survey?.grade_level) doc.text(`Grade: ${survey.grade_level}${survey.age ? `  ·  Age: ${survey.age}` : ''}`, W - margin - 4, y + 13, { align: 'right' });
  y += 26;

  // Generated date
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
  y += 8;

  divider();

  // ME-Score + level row
  line('Overall Performance', 11, true);
  y += 3;
  const statBoxes = [
    { label: 'ME-Score', val: progress.k_score ?? 0 },
    { label: 'Level', val: `Lv${progress.curriculum_level ?? 1}` },
    { label: 'Streak', val: `${progress.streak_days ?? 0}d` },
    { label: 'Lessons', val: (progress.completed_lessons || []).length },
    { label: 'Dilemmas', val: (progress.completed_dilemmas || []).length },
    { label: 'Challenges', val: (progress.completed_challenges || []).length },
  ];
  const boxW = contentW / 3 - 2;
  const boxH = 14;
  statBoxes.forEach((b, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = margin + col * (boxW + 3);
    const by = y + row * (boxH + 3);
    checkPage(boxH + 3);
    doc.setFillColor(245, 247, 255);
    doc.roundedRect(bx, by, boxW, boxH, 2, 2, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(String(b.val), bx + boxW / 2, by + 8, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(b.label, bx + boxW / 2, by + 12, { align: 'center' });
  });
  y += (Math.ceil(statBoxes.length / 3)) * (boxH + 3) + 5;

  divider();

  // Skill scores
  line('Skill Dimension Scores', 11, true);
  y += 4;
  SKILLS.forEach(s => {
    checkPage(8);
    const val = progress[s.key] ?? 0;
    const pct = Math.min(1, val / 200);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, margin, y);
    doc.text(String(val), W - margin, y, { align: 'right' });
    // Track bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(margin + 38, y - 4, contentW - 46, 5, 1, 1, 'F');
    doc.setFillColor(79, 200, 140);
    if (pct > 0) doc.roundedRect(margin + 38, y - 4, (contentW - 46) * pct, 5, 1, 1, 'F');
    y += 8;
  });

  divider();

  // Pre-Survey
  if (survey) {
    checkPage(14);
    line('Pre-Survey Baseline', 11, true);
    y += 3;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const surveyMeta = [
      `Ethical Confidence: ${survey.self_rated_ethical_confidence ?? '—'}/5`,
      `Reasoning Style: ${survey.ethical_reasoning_style?.replace(/_/g, ' ') ?? '—'}`,
      survey.grade_level ? `Grade: ${survey.grade_level}` : null,
      survey.age ? `Age: ${survey.age}` : null,
    ].filter(Boolean).join('   ·   ');
    doc.text(surveyMeta, margin, y);
    y += 7;

    const scenarios = [
      { label: 'Loyalty vs. Honesty', text: survey.scenario_1_response },
      { label: 'Personal Benefit vs. Fairness', text: survey.scenario_2_response },
      { label: 'Rules vs. Compassion', text: survey.scenario_3_response },
    ];
    scenarios.forEach(sc => {
      if (!sc.text) return;
      checkPage(20);
      doc.setFillColor(238, 242, 255);
      const wrapped = doc.splitTextToSize(sc.text, contentW - 8);
      const blockH = wrapped.length * 5 + 10;
      doc.roundedRect(margin, y, contentW, blockH, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(sc.label.toUpperCase(), margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 48, 163);
      doc.text(wrapped, margin + 4, y + 12);
      y += blockH + 4;
    });

    if (survey.consistency_score || survey.reciprocity_score || survey.deliberation_score) {
      checkPage(10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const ratings = [
        survey.consistency_score ? `Consistency: ${survey.consistency_score}/3` : null,
        survey.reciprocity_score ? `Reciprocity: ${survey.reciprocity_score}/3` : null,
        survey.deliberation_score ? `Deliberation: ${survey.deliberation_score}/3` : null,
      ].filter(Boolean).join('   ·   ');
      doc.text(ratings, margin, y);
      y += 8;
    }

    divider();
  }

  // Dilemma analyses
  const dilemmaAnalyses = progress.dilemma_analyses || [];
  if (dilemmaAnalyses.length > 0) {
    checkPage(14);
    line('Dilemma Analyses', 11, true);
    y += 4;
    dilemmaAnalyses.forEach(a => {
      checkPage(24);
      doc.setFillColor(248, 245, 255);
      const titleText = a.dilemma_id && dilemmaMap?.[a.dilemma_id] ? dilemmaMap[a.dilemma_id] : 'Dilemma';
      const descWrapped = a.profile_desc ? doc.splitTextToSize(a.profile_desc, contentW - 8) : [];
      const blockH = 24 + descWrapped.length * 4.5;
      doc.roundedRect(margin, y, contentW, blockH, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(126, 34, 206);
      doc.text(titleText, margin + 4, y + 6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(88, 28, 135);
      doc.text(a.profile_label || '—', margin + 4, y + 13);
      if (a.top_skill_label) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 70, 193);
        doc.text(`Top skill: ${a.top_skill_label}`, margin + 4, y + 19);
      }
      if (descWrapped.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(88, 28, 135);
        doc.text(descWrapped, margin + 4, y + 25);
      }
      if (a.completed_at) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(new Date(a.completed_at).toLocaleDateString(), W - margin - 4, y + 6, { align: 'right' });
      }
      y += blockH + 4;
    });
    divider();
  }

  // Lesson reflections
  const completedLessonDetails = (progress.completed_lessons || []).map(id => ({
    id,
    title: lessonMap?.[id] || id,
    reflection: (progress.lesson_reflections || []).find(r => r.lesson_id === id),
  }));

  if (completedLessonDetails.length > 0) {
    checkPage(14);
    line('Completed Lessons & Reflections', 11, true);
    y += 4;
    completedLessonDetails.forEach(lesson => {
      checkPage(20);
      doc.setFillColor(240, 253, 244);
      const reflText = lesson.reflection?.reflection;
      const wrapped = reflText ? doc.splitTextToSize(`"${reflText}"`, contentW - 8) : [];
      const blockH = wrapped.length > 0 ? 18 + wrapped.length * 4.5 : 14;
      doc.roundedRect(margin, y, contentW, blockH, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text(lesson.title, margin + 4, y + 7);
      if (lesson.reflection?.depth_label) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(21, 128, 61);
        doc.text(`Depth: ${lesson.reflection.depth_label}`, margin + 4, y + 13);
      }
      if (lesson.reflection?.completed_at) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(new Date(lesson.reflection.completed_at).toLocaleDateString(), W - margin - 4, y + 7, { align: 'right' });
      }
      if (wrapped.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(20, 83, 45);
        doc.text(wrapped, margin + 4, y + 19);
      }
      y += blockH + 4;
    });
    divider();
  }

  // Completed challenges
  const completedChallengeDetails = (progress.completed_challenges || []).map(id => {
    const full = (allChallenges || []).find(ch => ch.id === id);
    return { id, title: full?.title || id, full };
  });

  if (completedChallengeDetails.length > 0) {
    checkPage(14);
    line('Completed Challenges', 11, true);
    y += 4;
    completedChallengeDetails.forEach(c => {
      checkPage(16);
      doc.setFillColor(255, 251, 235);
      const blockH = c.full?.description ? 20 : 14;
      const descWrapped = c.full?.description ? doc.splitTextToSize(c.full.description, contentW - 8) : [];
      const totalH = 14 + descWrapped.length * 4.5;
      doc.roundedRect(margin, y, contentW, totalH, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text(c.title, margin + 4, y + 7);
      if (c.full?.target_skill) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 83, 9);
        const meta = [
          c.full.target_skill.replace(/_/g, ' '),
          c.full.difficulty,
          c.full.time_commitment,
        ].filter(Boolean).join(' · ');
        doc.text(meta, margin + 4, y + 13);
      }
      if (descWrapped.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 53, 15);
        doc.text(descWrapped, margin + 4, y + 19);
      }
      y += totalH + 4;
    });
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text(`ME-Score Progress Report  ·  ${progress.display_name || ''}  ·  Page ${i} of ${totalPages}`, W / 2, 292, { align: 'center' });
  }

  const safeName = (progress.display_name || 'user').replace(/[^a-z0-9]/gi, '_');
  doc.save(`${safeName}_progress_report.pdf`);
}
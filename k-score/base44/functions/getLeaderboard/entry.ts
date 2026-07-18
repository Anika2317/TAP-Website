import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch all UserProgress records using service role (bypasses RLS)
  const allProgress = await base44.asServiceRole.entities.UserProgress.list('-k_score', 500);

  // Deduplicate by email — merge all records per user
  const progressByEmail = {};
  for (const p of allProgress) {
    const email = p.created_by;
    if (!progressByEmail[email]) {
      progressByEmail[email] = { ...p };
    } else {
      const existing = progressByEmail[email];
      progressByEmail[email] = {
        ...existing,
        k_score: Math.max(existing.k_score || 0, p.k_score || 0),
        display_name: existing.display_name || p.display_name,
        streak_days: Math.max(existing.streak_days || 0, p.streak_days || 0),
        curriculum_level: Math.max(existing.curriculum_level || 1, p.curriculum_level || 1),
        logic_score: Math.max(existing.logic_score || 0, p.logic_score || 0),
        empathy_score: Math.max(existing.empathy_score || 0, p.empathy_score || 0),
        discipline_score: Math.max(existing.discipline_score || 0, p.discipline_score || 0),
        emotional_regulation_score: Math.max(existing.emotional_regulation_score || 0, p.emotional_regulation_score || 0),
        integrity_score: Math.max(existing.integrity_score || 0, p.integrity_score || 0),
        updated_date: existing.updated_date > p.updated_date ? existing.updated_date : p.updated_date,
      };
    }
  }

  const dedupedProgress = Object.values(progressByEmail);
  return Response.json({ progress: dedupedProgress });
});
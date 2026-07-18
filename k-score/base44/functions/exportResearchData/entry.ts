import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [allProgress, allSurveys] = await Promise.all([
      base44.asServiceRole.entities.UserProgress.list('-k_score', 500),
      base44.asServiceRole.entities.PreSurvey.list('-created_date', 500),
    ]);

    // Build a survey map by created_by
    const surveyMap = {};
    for (const s of (allSurveys || [])) {
      surveyMap[s.created_by] = s;
    }

    // CSV headers
    const headers = [
      'user_email',
      'display_name',
      'age',
      'grade_level',
      'k_score',
      'logic_score',
      'empathy_score',
      'discipline_score',
      'emotional_regulation_score',
      'integrity_score',
      'curriculum_level',
      'xp',
      'streak_days',
      'completed_lessons_count',
      'completed_dilemmas_count',
      'completed_challenges_count',
      'dilemma_analyses_count',
      'survey_completed',
      'baseline_ethical_confidence',
      'baseline_reasoning_style',
      'survey_scenario_1',
      'survey_scenario_2',
      'survey_scenario_3',
      'consistency_score',
      'reciprocity_score',
      'deliberation_score',
      'consistency_notes',
      'reciprocity_notes',
      'deliberation_notes',
    ];

    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const str = String(v).replace(/\n/g, ' ').replace(/\r/g, '');
      if (str.includes(',') || str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const rows = (allProgress || []).map(p => {
      const survey = surveyMap[p.created_by] || {};
      return [
        escape(p.created_by),
        escape(p.display_name || survey.display_name || ''),
        escape(survey.age || ''),
        escape(survey.grade_level || ''),
        escape(p.k_score || 0),
        escape(p.logic_score || 0),
        escape(p.empathy_score || 0),
        escape(p.discipline_score || 0),
        escape(p.emotional_regulation_score || 0),
        escape(p.integrity_score || 0),
        escape(p.curriculum_level || 1),
        escape(p.xp || 0),
        escape(p.streak_days || 0),
        escape((p.completed_lessons || []).length),
        escape((p.completed_dilemmas || []).length),
        escape((p.completed_challenges || []).length),
        escape((p.dilemma_analyses || []).length),
        escape(survey.completed ? 'yes' : 'no'),
        escape(survey.self_rated_ethical_confidence || ''),
        escape(survey.ethical_reasoning_style || ''),
        escape(survey.scenario_1_response || ''),
        escape(survey.scenario_2_response || ''),
        escape(survey.scenario_3_response || ''),
        escape(survey.consistency_score || ''),
        escape(survey.reciprocity_score || ''),
        escape(survey.deliberation_score || ''),
        escape(survey.consistency_notes || ''),
        escape(survey.reciprocity_notes || ''),
        escape(survey.deliberation_notes || ''),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=research-export.csv',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
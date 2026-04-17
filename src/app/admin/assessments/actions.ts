"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ALL_SCORE_KEYS, type Faculty, type ExamType, type ScoreKey } from "@/lib/assessment";

// ── Create a new assessment record ───────────────────────────────────────────

export async function createAssessment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      student_name:      (formData.get("student_name") as string).trim(),
      semester:          formData.get("semester") as string,
      performance_level: (formData.get("performance_level") as string) || null,
      degree_program:    (formData.get("degree_program") as string) || null,
      notes:             (formData.get("notes") as string) || null,
      created_by:        user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) redirect("/admin/assessments?error=" + encodeURIComponent(error.message));
  redirect(`/admin/assessments/${data.id}`);
}

// ── Save (upsert) one faculty's scores for one exam type ─────────────────────

export async function saveScores(payload: {
  assessmentId: string;
  faculty: Faculty;
  examType: ExamType;
  scores: Partial<Record<ScoreKey, number>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  function clean(key: ScoreKey): number | null {
    const val = payload.scores[key];
    return val !== undefined && !isNaN(val) ? val : null;
  }

  const { error } = await supabase
    .from("assessment_scores")
    .upsert(
      {
        assessment_id:            payload.assessmentId,
        faculty:                  payload.faculty,
        exam_type:                payload.examType,
        submitted_at:             new Date().toISOString(),
        submitted_by:             user?.id ?? null,
        s_technique:              clean("s_technique"),
        s_hand_limb_position:     clean("s_hand_limb_position"),
        s_posture:                clean("s_posture"),
        s_physical_motion:        clean("s_physical_motion"),
        s_rolling_sustain:        clean("s_rolling_sustain"),
        p_tone_intonation:        clean("p_tone_intonation"),
        p_touch:                  clean("p_touch"),
        p_sense_of_pulse:         clean("p_sense_of_pulse"),
        p_rhythmic_pitch_accuracy: clean("p_rhythmic_pitch_accuracy"),
        p_overall_sound_concept:  clean("p_overall_sound_concept"),
        m_expression:             clean("m_expression"),
        m_interpretation:         clean("m_interpretation"),
        m_creativity:             clean("m_creativity"),
        m_communication:          clean("m_communication"),
        m_reading:                clean("m_reading"),
      },
      { onConflict: "assessment_id,faculty,exam_type" }
    );

  if (error) throw new Error(error.message);
}

// ── Delete an assessment (cascades to scores) ─────────────────────────────────

export async function deleteAssessment(id: string) {
  const supabase = await createClient();
  await supabase.from("assessments").delete().eq("id", id);
  redirect("/admin/assessments");
}

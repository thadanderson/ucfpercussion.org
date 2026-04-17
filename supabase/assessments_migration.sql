-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id),
  semester        text NOT NULL DEFAULT 'Spring 2026',
  student_name    text NOT NULL,
  performance_level text,
  degree_program  text,
  notes           text
);

CREATE TABLE IF NOT EXISTS assessment_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  faculty         text NOT NULL CHECK (faculty IN ('anderson', 'gay', 'moore')),
  exam_type       text NOT NULL CHECK (exam_type IN ('barrier', 'jury')),
  submitted_at    timestamptz DEFAULT now(),
  submitted_by    uuid REFERENCES auth.users(id),

  -- Technique section (each 0–10)
  s_technique             numeric(4,1),
  s_hand_limb_position    numeric(4,1),
  s_posture               numeric(4,1),
  s_physical_motion       numeric(4,1),
  s_rolling_sustain       numeric(4,1),

  -- Performance section
  p_tone_intonation       numeric(4,1),
  p_touch                 numeric(4,1),
  p_sense_of_pulse        numeric(4,1),
  p_rhythmic_pitch_accuracy numeric(4,1),
  p_overall_sound_concept numeric(4,1),

  -- Musicianship section
  m_expression            numeric(4,1),
  m_interpretation        numeric(4,1),
  m_creativity            numeric(4,1),
  m_communication         numeric(4,1),
  m_reading               numeric(4,1),

  UNIQUE (assessment_id, faculty, exam_type)
);

ALTER TABLE assessments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_assessments"
  ON assessments FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_all_assessment_scores"
  ON assessment_scores FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

// Shared constants and utilities for the performance assessment feature.

export const FACULTY = ["anderson", "gay", "moore"] as const;
export type Faculty = (typeof FACULTY)[number];
export const FACULTY_LABELS: Record<Faculty, string> = {
  anderson: "Anderson",
  gay: "Gay",
  moore: "Moore",
};

export const EXAM_TYPES = ["barrier", "jury"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];
export const EXAM_LABELS: Record<ExamType, string> = {
  barrier: "Technical Barrier",
  jury: "Performance Jury",
};

export const CRITERIA = {
  technique: [
    { key: "s_technique" as const,          label: "Technique" },
    { key: "s_hand_limb_position" as const, label: "Hand/Limb Position" },
    { key: "s_posture" as const,            label: "Posture" },
    { key: "s_physical_motion" as const,    label: "Physical Motion & Gesture" },
    { key: "s_rolling_sustain" as const,    label: "Rolling, Sustain, & Pedaling" },
  ],
  performance: [
    { key: "p_tone_intonation" as const,        label: "Tone & Intonation" },
    { key: "p_touch" as const,                  label: "Touch" },
    { key: "p_sense_of_pulse" as const,         label: "Sense of Pulse" },
    { key: "p_rhythmic_pitch_accuracy" as const, label: "Rhythmic & Pitch Accuracy" },
    { key: "p_overall_sound_concept" as const,  label: "Overall Sound Concept" },
  ],
  musicianship: [
    { key: "m_expression" as const,     label: "Expression (contrast, dynamics, phrasing)" },
    { key: "m_interpretation" as const, label: "Interpretation (style, articulation)" },
    { key: "m_creativity" as const,     label: "Creativity (improvisation, musical line, ideas)" },
    { key: "m_communication" as const,  label: "Communication of Elements (form, transitions)" },
    { key: "m_reading" as const,        label: "Reading" },
  ],
} as const;

export type ScoreKey =
  | "s_technique" | "s_hand_limb_position" | "s_posture" | "s_physical_motion" | "s_rolling_sustain"
  | "p_tone_intonation" | "p_touch" | "p_sense_of_pulse" | "p_rhythmic_pitch_accuracy" | "p_overall_sound_concept"
  | "m_expression" | "m_interpretation" | "m_creativity" | "m_communication" | "m_reading";

export const ALL_SCORE_KEYS: ScoreKey[] = [
  "s_technique", "s_hand_limb_position", "s_posture", "s_physical_motion", "s_rolling_sustain",
  "p_tone_intonation", "p_touch", "p_sense_of_pulse", "p_rhythmic_pitch_accuracy", "p_overall_sound_concept",
  "m_expression", "m_interpretation", "m_creativity", "m_communication", "m_reading",
];

export type ScoreMap = Partial<Record<ScoreKey, number | null>>;

export function sectionTotal(scores: ScoreMap, section: keyof typeof CRITERIA): number {
  return CRITERIA[section].reduce((sum, c) => sum + (scores[c.key] ?? 0), 0);
}

export function grandTotal(scores: ScoreMap): number {
  return (
    sectionTotal(scores, "technique") +
    sectionTotal(scores, "performance") +
    sectionTotal(scores, "musicianship")
  );
}

// PAR: 0 = Does Not Meet, 1 = Meets, 2 = Exceeds
export function computePAR(sectionTotalValue: number): 0 | 1 | 2 {
  if (sectionTotalValue >= 45) return 2;
  if (sectionTotalValue >= 37.5) return 1;
  return 0;
}

export const PAR_LABELS = ["Does Not Meet", "Meets", "Exceeds"] as const;
export const PAR_COLORS = [
  "text-red-600",
  "text-yellow-600",
  "text-green-600",
] as const;

// Grade scale for 150-point total
export function computeLetterGrade(total: number): string {
  if (total >= 141) return "A";
  if (total >= 135) return "A−";
  if (total >= 130) return "B+";
  if (total >= 126) return "B";
  if (total >= 120) return "B−";
  if (total >= 115) return "C+";
  if (total >= 111) return "C";
  if (total >= 105) return "C−";
  if (total >= 100) return "D+";
  if (total >= 96)  return "D";
  if (total >= 90)  return "D−";
  return "F";
}

export const PERFORMANCE_LEVELS = [
  "MVP 1211", "MVP 1411", "MVP 2421", "MVP 3431", "MVP 4441", "MVP 5451", "MVP 6461",
];

export const DEGREE_PROGRAMS = [
  "Bachelor of Arts (BA)",
  "Bachelor of Music Education (BME)",
  "Bachelor of Music (BM)",
  "Master of Arts (MA)",
  "Bachelor of Music, Jazz Studies (BM)",
];

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FACULTY, FACULTY_LABELS, EXAM_LABELS, CRITERIA,
  sectionTotal, grandTotal, computePAR, computeLetterGrade,
  PAR_LABELS, PAR_COLORS,
  type Faculty, type ExamType, type ScoreMap,
} from "@/lib/assessment";
import { deleteAssessment } from "../actions";
import type { Database } from "@/types/database";

type AssessmentScore = Database["public"]["Tables"]["assessment_scores"]["Row"];

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Assessment Results" };

const SECTION_LABELS: Record<keyof typeof CRITERIA, string> = {
  technique:   "Technique",
  performance: "Performance",
  musicianship: "Musicianship",
};

function avg(vals: (number | null | undefined)[]): number | null {
  const nums = vals.filter((v): v is number => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function rowToMap(row: AssessmentScore | undefined): ScoreMap {
  if (!row) return {};
  const result: ScoreMap = {};
  for (const section of Object.values(CRITERIA)) {
    for (const { key } of section) {
      result[key] = (row[key as keyof AssessmentScore] as number | null) ?? null;
    }
  }
  return result;
}

function fmtScore(val: number | null | undefined): string {
  return val !== null && val !== undefined ? val.toFixed(1) : "—";
}

export default async function AssessmentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: assessment }, { data: scores }] = await Promise.all([
    supabase.from("assessments").select("*").eq("id", id).single(),
    supabase.from("assessment_scores").select("*").eq("assessment_id", id),
  ]);

  if (!assessment) notFound();

  const scoreRows = scores ?? [];

  // Index: faculty → exam_type → row
  function getRow(f: Faculty, e: ExamType): AssessmentScore | undefined {
    return scoreRows.find((r) => r.faculty === f && r.exam_type === e);
  }

  // Build maps per faculty per exam
  function maps(examType: ExamType): Record<Faculty, ScoreMap> {
    return Object.fromEntries(
      FACULTY.map((f) => [f, rowToMap(getRow(f, examType))])
    ) as Record<Faculty, ScoreMap>;
  }

  const barrierMaps = maps("barrier");
  const juryMaps    = maps("jury");

  // Average across submitted faculty
  function avgMap(examType: ExamType): ScoreMap {
    const m = examType === "barrier" ? barrierMaps : juryMaps;
    const result: ScoreMap = {};
    for (const section of Object.values(CRITERIA)) {
      for (const { key } of section) {
        result[key] = avg(FACULTY.map((f) => m[f][key] ?? null));
      }
    }
    return result;
  }

  const barrierAvg = avgMap("barrier");
  const juryAvg    = avgMap("jury");

  // PAR: per faculty (from their jury scores) + average
  function parForFaculty(f: Faculty) {
    const m = juryMaps[f];
    return {
      technique:   computePAR(sectionTotal(m, "technique")),
      tone:        computePAR(sectionTotal(m, "performance")),
      expression:  computePAR(sectionTotal(m, "musicianship")),
    };
  }
  function parAvg() {
    const avgJury = juryAvg;
    return {
      technique:  computePAR(sectionTotal(avgJury, "technique")),
      tone:       computePAR(sectionTotal(avgJury, "performance")),
      expression: computePAR(sectionTotal(avgJury, "musicianship")),
    };
  }

  // Score grid for one exam type
  function ScoreGrid({ examType }: { examType: ExamType }) {
    const facultyMaps = examType === "barrier" ? barrierMaps : juryMaps;
    const avgM        = examType === "barrier" ? barrierAvg : juryAvg;
    const total       = grandTotal(avgM);
    const grade       = total > 0 ? computeLetterGrade(total) : null;

    return (
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-800 mb-3">{EXAM_LABELS[examType]}</h2>
        <div className="bg-white border border-gray-200 rounded overflow-hidden text-sm">
          {/* Header */}
          <div className="grid grid-cols-[1fr_repeat(4,80px)] bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-2 font-semibold text-gray-600">Criterion</div>
            {FACULTY.map((f) => (
              <div key={f} className="px-2 py-2 text-center font-semibold text-gray-600">
                {FACULTY_LABELS[f]}
              </div>
            ))}
            <div className="px-2 py-2 text-center font-semibold text-gray-600">Avg</div>
          </div>

          {/* Sections */}
          {(Object.entries(CRITERIA) as [keyof typeof CRITERIA, typeof CRITERIA[keyof typeof CRITERIA]][]).map(
            ([sKey, criteria]) => {
              const secAvg = sectionTotal(avgM, sKey);
              return (
                <div key={sKey}>
                  {/* Section header */}
                  <div className="grid grid-cols-[1fr_repeat(4,80px)] bg-gray-50/70 border-y border-gray-100">
                    <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                      {SECTION_LABELS[sKey]}
                    </div>
                    {FACULTY.map((f) => {
                      const st = sectionTotal(facultyMaps[f], sKey);
                      return (
                        <div key={f} className="px-2 py-1.5 text-center text-xs text-gray-400">
                          {fmtScore(st || null)}
                        </div>
                      );
                    })}
                    <div className="px-2 py-1.5 text-center text-xs font-semibold text-gray-600">
                      {fmtScore(secAvg || null)} / 50
                    </div>
                  </div>
                  {/* Criteria rows */}
                  {criteria.map(({ key, label }) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_repeat(4,80px)] border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <div className="px-4 py-2 text-gray-700">{label}</div>
                      {FACULTY.map((f) => (
                        <div key={f} className="px-2 py-2 text-center text-gray-500">
                          {fmtScore(facultyMaps[f][key])}
                        </div>
                      ))}
                      <div className="px-2 py-2 text-center font-medium text-gray-700">
                        {fmtScore(avgM[key])}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
          )}

          {/* Total row */}
          <div className="grid grid-cols-[1fr_repeat(4,80px)] bg-gray-900 text-white">
            <div className="px-4 py-3 font-bold text-sm">Total (150)</div>
            {FACULTY.map((f) => {
              const t = grandTotal(facultyMaps[f]);
              return (
                <div key={f} className="px-2 py-3 text-center font-semibold text-gray-300">
                  {t > 0 ? t.toFixed(1) : "—"}
                </div>
              );
            })}
            <div className="px-2 py-3 text-center font-bold text-ucf-gold">
              {total > 0 ? total.toFixed(1) : "—"}
            </div>
          </div>
        </div>

        {grade && (
          <div className="mt-2 text-right text-sm text-gray-500">
            Average grade: <span className="font-bold text-gray-800 text-base">{grade}</span>
          </div>
        )}
      </div>
    );
  }

  // PAR table
  const parRows = [
    { label: "Technique",  key: "technique" as const },
    { label: "Tone",       key: "tone" as const },
    { label: "Expression", key: "expression" as const },
  ];
  const avg_par = parAvg();

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/assessments" className="text-sm text-gray-500 hover:text-gray-700">
              ← Assessments
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{assessment.student_name}</h1>
          <p className="text-sm text-gray-500 mt-1 flex gap-4">
            <span>{assessment.semester}</span>
            {assessment.performance_level && <span>{assessment.performance_level}</span>}
            {assessment.degree_program && <span>{assessment.degree_program}</span>}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/admin/assessments/${id}/score`}
            className="text-sm font-semibold bg-ucf-gold hover:bg-yellow-400 text-ucf-black px-4 py-2 rounded transition-colors"
          >
            Enter Scores
          </Link>
          <form action={deleteAssessment.bind(null, id)}>
            <button
              type="submit"
              onClick={(e) => {
                if (!confirm("Delete this assessment and all scores? This cannot be undone.")) {
                  e.preventDefault();
                }
              }}
              className="text-sm text-red-600 hover:text-red-800 font-semibold px-3 py-2 rounded border border-red-200 hover:border-red-400 transition-colors"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Score grids */}
      <ScoreGrid examType="barrier" />
      <ScoreGrid examType="jury" />

      {/* PAR Section */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-800 mb-1">Performance Assessment Rubric</h2>
        <p className="text-xs text-gray-400 mb-3">
          Auto-derived from Performance Jury section averages. 0–37.5 = Does Not Meet · 37.5–45 = Meets · 45–50 = Exceeds
        </p>
        <div className="bg-white border border-gray-200 rounded overflow-hidden text-sm">
          <div className="grid grid-cols-[1fr_repeat(4,100px)] bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-2 font-semibold text-gray-600">Category</div>
            {FACULTY.map((f) => (
              <div key={f} className="px-2 py-2 text-center font-semibold text-gray-600">
                {FACULTY_LABELS[f]}
              </div>
            ))}
            <div className="px-2 py-2 text-center font-semibold text-gray-600">Avg</div>
          </div>
          {parRows.map(({ label, key }) => (
            <div key={key} className="grid grid-cols-[1fr_repeat(4,100px)] border-b border-gray-100 hover:bg-gray-50/50">
              <div className="px-4 py-3 font-medium text-gray-700">{label}</div>
              {FACULTY.map((f) => {
                const par = parForFaculty(f)[key];
                return (
                  <div key={f} className={`px-2 py-3 text-center text-xs font-semibold ${PAR_COLORS[par]}`}>
                    {PAR_LABELS[par]}
                  </div>
                );
              })}
              <div className={`px-2 py-3 text-center text-xs font-bold ${PAR_COLORS[avg_par[key]]}`}>
                {PAR_LABELS[avg_par[key]]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Export PAR Data for this semester</p>
        <div className="flex flex-wrap gap-2">
          {FACULTY.map((f) => (
            <a
              key={f}
              href={`/admin/assessments/export?faculty=${f}&semester=${encodeURIComponent(assessment.semester)}`}
              className="text-xs font-semibold uppercase tracking-wide bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-2 rounded transition-colors"
            >
              ↓ {FACULTY_LABELS[f]} PAR — {assessment.semester}
            </a>
          ))}
          <a
            href={`/admin/assessments/export?faculty=average&semester=${encodeURIComponent(assessment.semester)}`}
            className="text-xs font-semibold uppercase tracking-wide bg-ucf-gold hover:bg-yellow-400 text-ucf-black px-3 py-2 rounded transition-colors"
          >
            ↓ Average PAR — {assessment.semester}
          </a>
        </div>
      </div>
    </div>
  );
}

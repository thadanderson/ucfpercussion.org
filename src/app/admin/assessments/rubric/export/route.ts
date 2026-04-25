import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  FACULTY, FACULTY_LABELS, CRITERIA,
  sectionTotal, grandTotal, computePAR, computeLetterGrade, PAR_LABELS,
  type Faculty, type ScoreMap, type ScoreKey,
} from "@/lib/assessment";
import type { Database } from "@/types/database";

type AssessmentScore = Database["public"]["Tables"]["assessment_scores"]["Row"];
type Assessment = Database["public"]["Tables"]["assessments"]["Row"];

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

function avgNullable(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function escapeCsv(val: string | number | null | undefined): string {
  const s = val === null || val === undefined ? "" : String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

// Computed section totals + PAR + grand total + grade for one score row
function computeStats(m: ScoreMap) {
  const tech  = sectionTotal(m, "technique");
  const perf  = sectionTotal(m, "performance");
  const musi  = sectionTotal(m, "musicianship");
  const grand = grandTotal(m);
  return {
    techTotal:  tech,
    perfTotal:  perf,
    musiTotal:  musi,
    grandTotal: grand,
    techPAR:    computePAR(tech),
    perfPAR:    computePAR(perf),
    musiPAR:    computePAR(musi),
    grade:      computeLetterGrade(grand),
  };
}

// Columns for a single-faculty or average view
function singleFacultyColumns(
  label: string,
  fields: Set<string>,
): string[] {
  const cols: string[] = [];
  if (fields.has("totals")) {
    cols.push(`${label} — Technique Total`, `${label} — Performance Total`, `${label} — Musicianship Total`);
  }
  if (fields.has("grand_total")) cols.push(`${label} — Grand Total`);
  if (fields.has("par")) {
    cols.push(`${label} — Technique PAR`, `${label} — Performance PAR`, `${label} — Musicianship PAR`);
  }
  if (fields.has("grade")) cols.push(`${label} — Letter Grade`);
  return cols;
}

function singleFacultyValues(
  stats: ReturnType<typeof computeStats> | null,
  fields: Set<string>,
): (string | number | null)[] {
  if (!stats) {
    const count =
      (fields.has("totals") ? 3 : 0) +
      (fields.has("grand_total") ? 1 : 0) +
      (fields.has("par") ? 3 : 0) +
      (fields.has("grade") ? 1 : 0);
    return Array(count).fill(null);
  }
  const vals: (string | number | null)[] = [];
  if (fields.has("totals")) {
    vals.push(stats.techTotal.toFixed(1), stats.perfTotal.toFixed(1), stats.musiTotal.toFixed(1));
  }
  if (fields.has("grand_total")) vals.push(stats.grandTotal.toFixed(1));
  if (fields.has("par")) {
    vals.push(PAR_LABELS[stats.techPAR], PAR_LABELS[stats.perfPAR], PAR_LABELS[stats.musiPAR]);
  }
  if (fields.has("grade")) vals.push(stats.grade);
  return vals;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const facultyParam = url.searchParams.get("faculty") ?? "average";
  const semester     = url.searchParams.get("semester") ?? "";
  const fieldsParam  = url.searchParams.get("fields") ?? "name,semester,level,degree,par";
  const fields       = new Set(fieldsParam.split(",").map((s) => s.trim()).filter(Boolean));

  const validFaculty = [...FACULTY, "average", "all"];
  if (!validFaculty.includes(facultyParam)) {
    return NextResponse.json({ error: "Invalid faculty param" }, { status: 400 });
  }

  // Fetch assessments
  let query = supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: true });
  if (semester) query = query.eq("semester", semester);

  const { data: assessments, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const assessmentIds = (assessments ?? []).map((a) => a.id);

  // Fetch jury scores
  const { data: allScores } = await supabase
    .from("assessment_scores")
    .select("*")
    .in("assessment_id", assessmentIds.length ? assessmentIds : [""])
    .eq("exam_type", "jury");

  // ── Build header ─────────────────────────────────────────────────────────

  const identityCols: string[] = [];
  if (fields.has("name"))     identityCols.push("Student Name");
  if (fields.has("semester")) identityCols.push("Semester");
  if (fields.has("level"))    identityCols.push("Performance Level");
  if (fields.has("degree"))   identityCols.push("Degree Program");

  let scoreCols: string[] = [];

  if (facultyParam === "all") {
    for (const f of FACULTY) {
      scoreCols.push(...singleFacultyColumns(FACULTY_LABELS[f], fields));
    }
    scoreCols.push(...singleFacultyColumns("Average", fields));
  } else {
    const label = facultyParam === "average"
      ? "Average"
      : FACULTY_LABELS[facultyParam as Faculty];
    scoreCols = singleFacultyColumns(label, fields);
  }

  const header = [...identityCols, ...scoreCols].map(escapeCsv).join(",");
  const rows: string[] = [header];

  // ── Build rows ───────────────────────────────────────────────────────────

  for (const assessment of assessments ?? []) {
    const juryScores = (allScores ?? []).filter(
      (s) => s.assessment_id === assessment.id
    );

    const identityVals: (string | null)[] = [];
    if (fields.has("name"))     identityVals.push(assessment.student_name);
    if (fields.has("semester")) identityVals.push(assessment.semester);
    if (fields.has("level"))    identityVals.push(assessment.performance_level ?? null);
    if (fields.has("degree"))   identityVals.push(assessment.degree_program ?? null);

    let scoreVals: (string | number | null)[] = [];

    if (facultyParam === "all") {
      const perFacultyStats = FACULTY.map((f) => {
        const row = juryScores.find((s) => s.faculty === f);
        return row ? computeStats(rowToMap(row)) : null;
      });

      for (let i = 0; i < FACULTY.length; i++) {
        scoreVals.push(...singleFacultyValues(perFacultyStats[i], fields));
      }

      // Average stats
      const avgStats = (() => {
        const techTotals  = FACULTY.map((f) => sectionTotal(rowToMap(juryScores.find((s) => s.faculty === f)), "technique"));
        const perfTotals  = FACULTY.map((f) => sectionTotal(rowToMap(juryScores.find((s) => s.faculty === f)), "performance"));
        const musiTotals  = FACULTY.map((f) => sectionTotal(rowToMap(juryScores.find((s) => s.faculty === f)), "musicianship"));
        const avgTech = avgNullable(techTotals);
        const avgPerf = avgNullable(perfTotals);
        const avgMusi = avgNullable(musiTotals);
        if (avgTech === null) return null;
        const avgGrand = avgTech + avgPerf! + avgMusi!;
        return {
          techTotal: avgTech, perfTotal: avgPerf!, musiTotal: avgMusi!,
          grandTotal: avgGrand,
          techPAR:  computePAR(avgTech),
          perfPAR:  computePAR(avgPerf!),
          musiPAR:  computePAR(avgMusi!),
          grade:    computeLetterGrade(avgGrand),
        };
      })();
      scoreVals.push(...singleFacultyValues(avgStats, fields));

    } else if (facultyParam === "average") {
      const techTotals = FACULTY.map((f) => sectionTotal(rowToMap(juryScores.find((s) => s.faculty === f)), "technique"));
      const perfTotals = FACULTY.map((f) => sectionTotal(rowToMap(juryScores.find((s) => s.faculty === f)), "performance"));
      const musiTotals = FACULTY.map((f) => sectionTotal(rowToMap(juryScores.find((s) => s.faculty === f)), "musicianship"));
      const avgTech = avgNullable(techTotals);
      const avgPerf = avgNullable(perfTotals);
      const avgMusi = avgNullable(musiTotals);
      const avgStats = avgTech !== null ? {
        techTotal: avgTech, perfTotal: avgPerf!, musiTotal: avgMusi!,
        grandTotal: avgTech + avgPerf! + avgMusi!,
        techPAR:  computePAR(avgTech),
        perfPAR:  computePAR(avgPerf!),
        musiPAR:  computePAR(avgMusi!),
        grade:    computeLetterGrade(avgTech + avgPerf! + avgMusi!),
      } : null;
      scoreVals = singleFacultyValues(avgStats, fields);

    } else {
      const row = juryScores.find((s) => s.faculty === facultyParam);
      const stats = row ? computeStats(rowToMap(row)) : null;
      scoreVals = singleFacultyValues(stats, fields);
    }

    rows.push([...identityVals, ...scoreVals].map(escapeCsv).join(","));
  }

  const csv = rows.join("\n");
  const facultyLabel = facultyParam === "all" ? "All_Faculty"
    : facultyParam === "average" ? "Average"
    : FACULTY_LABELS[facultyParam as Faculty];
  const filename = `PAR_${facultyLabel}${semester ? `_${semester.replace(/\s+/g, "_")}` : ""}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

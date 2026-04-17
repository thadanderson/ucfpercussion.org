import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  FACULTY, FACULTY_LABELS, CRITERIA,
  sectionTotal, computePAR, PAR_LABELS,
  type Faculty, type ScoreMap, type ScoreKey,
} from "@/lib/assessment";
import type { Database } from "@/types/database";

type AssessmentScore = Database["public"]["Tables"]["assessment_scores"]["Row"];

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

function avg(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function escapeCsv(val: string | number | null | undefined): string {
  const s = val === null || val === undefined ? "" : String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const faculty = url.searchParams.get("faculty") ?? "average"; // 'anderson' | 'gay' | 'moore' | 'average'
  const semester = url.searchParams.get("semester");            // optional filter

  // Fetch assessments
  let assessmentsQuery = supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: true });

  if (semester) assessmentsQuery = assessmentsQuery.eq("semester", semester);

  const { data: assessments, error } = await assessmentsQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch all jury scores for these assessments
  const assessmentIds = (assessments ?? []).map((a) => a.id);
  const { data: allScores } = await supabase
    .from("assessment_scores")
    .select("*")
    .in("assessment_id", assessmentIds.length ? assessmentIds : [""])
    .eq("exam_type", "jury");

  const isAverage = faculty === "average";
  const targetFaculty = isAverage ? null : (faculty as Faculty);

  // Validate faculty param
  if (!isAverage && !FACULTY.includes(targetFaculty as Faculty)) {
    return NextResponse.json({ error: "Invalid faculty param" }, { status: 400 });
  }

  const facultyLabel = isAverage ? "Average" : FACULTY_LABELS[targetFaculty as Faculty];

  // Build CSV rows
  const header = [
    "Semester",
    "Performance Level",
    "Degree Program",
    `${facultyLabel} — Technique PAR`,
    `${facultyLabel} — Tone PAR`,
    `${facultyLabel} — Expression PAR`,
  ].map(escapeCsv).join(",");

  const rows: string[] = [header];

  for (const assessment of assessments ?? []) {
    const juryScores = (allScores ?? []).filter(
      (s) => s.assessment_id === assessment.id
    );

    let techniquePAR: number | null = null;
    let tonePAR:      number | null = null;
    let expressionPAR: number | null = null;

    if (isAverage) {
      // Average the three faculty's jury section totals, then compute PAR
      const techTotals = FACULTY.map((f) => {
        const row = juryScores.find((s) => s.faculty === f);
        const m = rowToMap(row);
        return sectionTotal(m, "technique");
      });
      const perfTotals = FACULTY.map((f) => {
        const row = juryScores.find((s) => s.faculty === f);
        const m = rowToMap(row);
        return sectionTotal(m, "performance");
      });
      const musiTotals = FACULTY.map((f) => {
        const row = juryScores.find((s) => s.faculty === f);
        const m = rowToMap(row);
        return sectionTotal(m, "musicianship");
      });
      const avgTech = avg(techTotals);
      const avgPerf = avg(perfTotals);
      const avgMusi = avg(musiTotals);
      techniquePAR  = avgTech !== null ? computePAR(avgTech)  : null;
      tonePAR       = avgPerf !== null ? computePAR(avgPerf)  : null;
      expressionPAR = avgMusi !== null ? computePAR(avgMusi)  : null;
    } else {
      const row = juryScores.find((s) => s.faculty === targetFaculty);
      if (row) {
        const m = rowToMap(row);
        techniquePAR  = computePAR(sectionTotal(m, "technique"));
        tonePAR       = computePAR(sectionTotal(m, "performance"));
        expressionPAR = computePAR(sectionTotal(m, "musicianship"));
      }
    }

    const csvRow = [
      assessment.semester,
      assessment.performance_level ?? "",
      assessment.degree_program ?? "",
      techniquePAR  !== null ? PAR_LABELS[techniquePAR]  : "",
      tonePAR       !== null ? PAR_LABELS[tonePAR]        : "",
      expressionPAR !== null ? PAR_LABELS[expressionPAR] : "",
    ].map(escapeCsv).join(",");

    rows.push(csvRow);
  }

  const csv = rows.join("\n");
  const filename = `PAR_${facultyLabel.replace(/\s+/g, "_")}${semester ? `_${semester.replace(/\s+/g, "_")}` : ""}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

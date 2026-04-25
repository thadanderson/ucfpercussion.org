import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FACULTY, FACULTY_LABELS, EXAM_LABELS, type Faculty, type ExamType } from "@/lib/assessment";
import ExportForm from "@/components/admin/assessments/ExportForm";

export const metadata = { title: "Percussion Performance Assessment Rubric" };

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: allScores } = await supabase
    .from("assessment_scores")
    .select("assessment_id, faculty, exam_type");

  // Distinct semesters for the export filter dropdown
  const semesters = [...new Set((assessments ?? []).map((a) => a.semester).filter(Boolean))] as string[];

  // Build a quick lookup: assessmentId → Set of "faculty-examType" that are submitted
  function submittedKey(faculty: string, examType: string) {
    return `${faculty}-${examType}`;
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-semibold uppercase tracking-widest transition-colors mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Assessments
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Percussion Performance Assessment Rubric</h1>
          <Link
            href="/admin/assessments/rubric/new"
            className="bg-ucf-gold text-ucf-black font-semibold text-sm px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
          >
            + New Assessment
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">
          {error}
        </p>
      )}

      {/* Assessment list */}
      {!assessments || assessments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No assessments yet.</p>
          <p className="text-sm">Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Semester</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Level</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Submitted Scores</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assessments.map((a) => {
                const submitted = new Set(
                  (allScores ?? [])
                    .filter((s) => s.assessment_id === a.id)
                    .map((s) => submittedKey(s.faculty, s.exam_type))
                );
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.student_name}</td>
                    <td className="px-4 py-3 text-gray-600">{a.semester}</td>
                    <td className="px-4 py-3 text-gray-600">{a.performance_level ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(FACULTY as readonly Faculty[]).map((f) =>
                          (["barrier", "jury"] as ExamType[]).map((e) => {
                            const done = submitted.has(submittedKey(f, e));
                            return (
                              <span
                                key={`${f}-${e}`}
                                title={`${FACULTY_LABELS[f]} — ${EXAM_LABELS[e]}`}
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  done
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {FACULTY_LABELS[f][0]}/{e[0].toUpperCase()}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link
                        href={`/admin/assessments/rubric/${a.id}/score`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Score
                      </Link>
                      <Link
                        href={`/admin/assessments/rubric/${a.id}`}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                      >
                        Results →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <ExportForm semesters={semesters} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FACULTY, FACULTY_LABELS, EXAM_LABELS, type Faculty, type ExamType } from "@/lib/assessment";

export const metadata = { title: "Assessments" };

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

  // Build a quick lookup: assessmentId → Set of "faculty-examType" that are submitted
  function submittedKey(faculty: string, examType: string) {
    return `${faculty}-${examType}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <Link
          href="/admin/assessments/new"
          className="bg-ucf-gold text-ucf-black font-semibold text-sm px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
        >
          + New Assessment
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">
          {error}
        </p>
      )}

      {/* Export section */}
      <div className="mb-8 p-4 bg-white border border-gray-200 rounded">
        <p className="text-sm font-semibold text-gray-700 mb-3">Export PAR Data (anonymous, by faculty)</p>
        <div className="flex flex-wrap gap-2">
          {FACULTY.map((f) => (
            <a
              key={f}
              href={`/admin/assessments/export?faculty=${f}`}
              className="text-xs font-semibold uppercase tracking-wide bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
            >
              ↓ {FACULTY_LABELS[f]} PAR
            </a>
          ))}
          <a
            href="/admin/assessments/export?faculty=average"
            className="text-xs font-semibold uppercase tracking-wide bg-ucf-gold hover:bg-yellow-400 text-ucf-black px-3 py-2 rounded transition-colors"
          >
            ↓ Average PAR
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Add <code>?semester=Spring+2026</code> to filter by semester (all semesters exported by default).
        </p>
      </div>

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
                        href={`/admin/assessments/${a.id}/score`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Score
                      </Link>
                      <Link
                        href={`/admin/assessments/${a.id}`}
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
    </div>
  );
}

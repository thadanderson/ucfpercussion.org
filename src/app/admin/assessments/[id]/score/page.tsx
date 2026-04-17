import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ScoreForm from "@/components/admin/assessments/ScoreForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Enter Scores" };

export default async function ScorePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: assessment }, { data: scores }] = await Promise.all([
    supabase.from("assessments").select("*").eq("id", id).single(),
    supabase.from("assessment_scores").select("*").eq("assessment_id", id),
  ]);

  if (!assessment) notFound();

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/assessments" className="text-sm text-gray-500 hover:text-gray-700">
          ← Assessments
        </Link>
        <span className="text-gray-300">/</span>
        <Link href={`/admin/assessments/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          {assessment.student_name}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Enter Scores</h1>
      </div>

      <div className="mb-6 text-sm text-gray-500 flex gap-6">
        <span><strong className="text-gray-700">Semester:</strong> {assessment.semester}</span>
        {assessment.performance_level && (
          <span><strong className="text-gray-700">Level:</strong> {assessment.performance_level}</span>
        )}
        {assessment.degree_program && (
          <span><strong className="text-gray-700">Program:</strong> {assessment.degree_program}</span>
        )}
      </div>

      <ScoreForm
        assessmentId={id}
        studentName={assessment.student_name}
        existingScores={scores ?? []}
      />
    </div>
  );
}

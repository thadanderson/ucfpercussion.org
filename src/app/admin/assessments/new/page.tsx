import { createAssessment } from "../actions";
import { PERFORMANCE_LEVELS, DEGREE_PROGRAMS } from "@/lib/assessment";
import Link from "next/link";

export const metadata = { title: "New Assessment" };

export default function NewAssessmentPage() {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/assessments" className="text-sm text-gray-500 hover:text-gray-700">
          ← Assessments
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">New Assessment</h1>
      </div>

      <form action={createAssessment} className="bg-white border border-gray-200 rounded p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Student Name <span className="text-red-500">*</span>
          </label>
          <input
            name="student_name"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
            placeholder="First Last"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
          <input
            name="semester"
            defaultValue="Spring 2026"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Performance Level</label>
          <select
            name="performance_level"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          >
            <option value="">— Select —</option>
            {PERFORMANCE_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Degree Program</label>
          <select
            name="degree_program"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          >
            <option value="">— Select —</option>
            {DEGREE_PROGRAMS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ucf-gold resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-ucf-gold hover:bg-yellow-400 text-ucf-black font-bold text-sm py-2.5 rounded transition-colors"
        >
          Create Assessment
        </button>
      </form>
    </div>
  );
}

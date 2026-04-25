"use client";

import { useState } from "react";
import { FACULTY, FACULTY_LABELS } from "@/lib/assessment";

const FACULTY_OPTIONS = [
  ...FACULTY.map((f) => ({ value: f, label: FACULTY_LABELS[f] })),
  { value: "average",  label: "Average (all faculty)" },
  { value: "all",      label: "All Faculty (combined)" },
];

const FIELD_OPTIONS = [
  { key: "name",        label: "Student Name",      default: true  },
  { key: "semester",    label: "Semester",           default: true  },
  { key: "level",       label: "Performance Level",  default: true  },
  { key: "degree",      label: "Degree Program",     default: true  },
  { key: "par",         label: "PAR Ratings",        default: true  },
  { key: "totals",      label: "Section Totals",     default: false },
  { key: "grand_total", label: "Grand Total",        default: false },
  { key: "grade",       label: "Letter Grade",       default: false },
];

export default function ExportForm({ semesters }: { semesters: string[] }) {
  const [faculty, setFaculty] = useState("average");
  const [semester, setSemester] = useState("");
  const [fields, setFields] = useState<Set<string>>(
    new Set(FIELD_OPTIONS.filter((f) => f.default).map((f) => f.key))
  );

  function toggleField(key: string) {
    setFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const params = new URLSearchParams({ faculty });
  if (semester) params.set("semester", semester);
  params.set("fields", [...fields].join(","));
  const href = `/admin/assessments/rubric/export?${params.toString()}`;
  const canDownload = fields.size > 0;

  return (
    <div className="bg-white border border-gray-200 rounded p-5 mb-8">
      <p className="text-sm font-bold text-gray-800 mb-5">Export PAR Data</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Faculty view */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Faculty View</p>
          <div className="flex flex-col gap-2">
            {FACULTY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="faculty"
                  value={opt.value}
                  checked={faculty === opt.value}
                  onChange={() => setFaculty(opt.value)}
                  className="accent-ucf-gold"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Semester filter */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Semester</p>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          >
            <option value="">All semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Fields */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Include Fields</p>
          <div className="flex flex-col gap-2">
            {FIELD_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fields.has(opt.key)}
                  onChange={() => toggleField(opt.key)}
                  className="accent-ucf-gold"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
        <a
          href={canDownload ? href : undefined}
          aria-disabled={!canDownload}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded font-bold text-sm transition-colors ${
            canDownload
              ? "bg-ucf-gold hover:bg-yellow-400 text-ucf-black cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV
        </a>
        {!canDownload && (
          <span className="text-xs text-red-500">Select at least one field.</span>
        )}
      </div>
    </div>
  );
}

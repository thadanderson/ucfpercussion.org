"use client";

import { useState, useEffect, useTransition } from "react";
import {
  FACULTY, FACULTY_LABELS, EXAM_TYPES, EXAM_LABELS, CRITERIA,
  sectionTotal, grandTotal,
  type Faculty, type ExamType, type ScoreKey, type ScoreMap,
} from "@/lib/assessment";
import { saveScores } from "@/app/admin/assessments/actions";
import type { Database } from "@/types/database";

type AssessmentScore = Database["public"]["Tables"]["assessment_scores"]["Row"];

interface Props {
  assessmentId: string;
  studentName: string;
  existingScores: AssessmentScore[];
}

const SECTION_LABELS: Record<keyof typeof CRITERIA, string> = {
  technique:    "Technique",
  performance:  "Performance",
  musicianship: "Musicianship",
};

function scoreKey(faculty: Faculty, examType: ExamType) {
  return `${faculty}-${examType}`;
}

function rowToMap(row: AssessmentScore | undefined): Partial<Record<ScoreKey, string>> {
  if (!row) return {};
  const result: Partial<Record<ScoreKey, string>> = {};
  for (const section of Object.values(CRITERIA)) {
    for (const { key } of section) {
      const val = row[key as keyof AssessmentScore];
      result[key] = val !== null && val !== undefined ? String(val) : "";
    }
  }
  return result;
}

function parseScoreMap(raw: Partial<Record<ScoreKey, string>>): ScoreMap {
  const result: ScoreMap = {};
  for (const [k, v] of Object.entries(raw)) {
    const n = parseFloat(v as string);
    result[k as ScoreKey] = isNaN(n) ? null : n;
  }
  return result;
}

export default function ScoreForm({ assessmentId, studentName, existingScores }: Props) {
  const [faculty, setFaculty] = useState<Faculty>("anderson");
  const [examType, setExamType] = useState<ExamType>("barrier");
  const [scores, setScores] = useState<Partial<Record<ScoreKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Index existing scores by faculty-examType
  const existingMap = existingScores.reduce<Record<string, AssessmentScore>>((acc, row) => {
    acc[scoreKey(row.faculty as Faculty, row.exam_type as ExamType)] = row;
    return acc;
  }, {});

  // Reload form when faculty or exam type changes
  useEffect(() => {
    const existing = existingMap[scoreKey(faculty, examType)];
    setScores(rowToMap(existing));
    setStatus("idle");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faculty, examType]);

  function handleInput(key: ScoreKey, value: string) {
    setScores((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  function handleSave() {
    startTransition(async () => {
      setStatus("saving");
      try {
        await saveScores({
          assessmentId,
          faculty,
          examType,
          scores: parseScoreMap(scores) as Record<ScoreKey, number>,
        });
        setStatus("saved");
        setStatusMsg("Scores saved.");
      } catch (e) {
        setStatus("error");
        setStatusMsg(e instanceof Error ? e.message : "Save failed.");
      }
    });
  }

  const parsed = parseScoreMap(scores);
  const total = grandTotal(parsed);
  const submitted = (key: Faculty, exam: ExamType) => !!existingMap[scoreKey(key, exam)];

  return (
    <div>
      {/* Student name */}
      <p className="text-sm text-gray-500 mb-6">
        Scoring for <span className="font-semibold text-gray-900">{studentName}</span>
      </p>

      {/* Faculty selector */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Faculty</p>
        <div className="flex gap-2">
          {(FACULTY as readonly Faculty[]).map((f) => (
            <button
              key={f}
              onClick={() => setFaculty(f)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                faculty === f
                  ? "bg-ucf-gold text-ucf-black"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {FACULTY_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Exam type selector */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Exam</p>
        <div className="flex gap-2">
          {(EXAM_TYPES as readonly ExamType[]).map((e) => {
            const done = submitted(faculty, e);
            return (
              <button
                key={e}
                onClick={() => setExamType(e)}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2 ${
                  examType === e
                    ? "bg-ucf-gold text-ucf-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {EXAM_LABELS[e]}
                {done && (
                  <span className="text-[10px] bg-green-500 text-white rounded-full px-1.5 py-0.5 font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scoring sections */}
      <div className="space-y-6">
        {(Object.entries(CRITERIA) as [keyof typeof CRITERIA, typeof CRITERIA[keyof typeof CRITERIA]][]).map(
          ([sectionKey, criteria]) => {
            const secTotal = sectionTotal(parsed, sectionKey);
            return (
              <div key={sectionKey} className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {SECTION_LABELS[sectionKey]}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    {secTotal.toFixed(1)} / 50
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {criteria.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between px-4 py-2.5">
                      <label className="text-sm text-gray-700 flex-1 pr-4">{label}</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={scores[key] ?? ""}
                        onChange={(e) => handleInput(key, e.target.value)}
                        placeholder="0–10"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Grand total */}
      <div className="mt-6 flex items-center justify-between bg-gray-900 text-white rounded px-5 py-3">
        <span className="font-bold text-sm uppercase tracking-wide">
          {examType === "barrier" ? "Barrier" : "Jury"} Total
        </span>
        <span className="text-xl font-bold">
          {total.toFixed(1)} <span className="text-gray-400 text-sm font-normal">/ 150</span>
        </span>
      </div>

      {/* Save button */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 bg-ucf-gold hover:bg-yellow-400 disabled:opacity-50 text-ucf-black font-bold text-sm py-3 rounded transition-colors"
        >
          {isPending ? "Saving…" : `Save ${EXAM_LABELS[examType]} Scores`}
        </button>
        {status === "saved" && (
          <span className="text-sm text-green-600 font-semibold">{statusMsg}</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600">{statusMsg}</span>
        )}
      </div>

      {/* Reference grading scale */}
      <details className="mt-8">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          Grading scale reference
        </summary>
        <div className="mt-3 text-xs text-gray-500 grid grid-cols-3 gap-x-8 gap-y-1 max-w-sm">
          {[
            ["A", "141–150"], ["A−", "135–140"], ["B+", "130–134"],
            ["B", "126–129"], ["B−", "120–125"], ["C+", "115–119"],
            ["C", "111–114"], ["C−", "105–110"], ["D+", "100–104"],
            ["D", "96–99"],   ["D−", "90–95"],   ["F", "0–89"],
          ].map(([grade, range]) => (
            <div key={grade} className="flex justify-between">
              <span className="font-semibold">{grade}</span>
              <span>{range}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

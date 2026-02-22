"use client";

import { useState } from "react";
import type { Database } from "@/types/database";

type LibraryEntry = Database["public"]["Tables"]["music_library"]["Row"];

export default function LibraryClient({ entries }: { entries: LibraryEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? entries.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.composer ?? "").toLowerCase().includes(q) ||
          (e.arranger ?? "").toLowerCase().includes(q) ||
          (e.instrumentation ?? "").toLowerCase().includes(q)
        );
      })
    : entries;

  return (
    <div>
      <input
        type="search"
        placeholder="Search by title, composer, arranger, or instrumentation…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No results found.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Composer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Arranger</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Instrumentation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ucf-black">{entry.title}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.composer ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.arranger ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.instrumentation ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.location ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteLibraryEntry } from "@/app/admin/library/actions";

export const metadata = { title: "Admin — Library" };

export default async function AdminLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("music_library")
    .select("*")
    .order("title", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ucf-black">Music Library (PML)</h1>
        <Link
          href="/admin/library/new"
          className="bg-ucf-gold text-ucf-black font-semibold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
        >
          + Add Entry
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {!entries || entries.length === 0 ? (
        <p className="text-gray-500 text-sm">No entries yet. Add one above.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Composer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Instrumentation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ucf-black">{entry.title}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.composer ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.instrumentation ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/library/${entry.id}/edit`}
                        className="text-ucf-gold hover:underline text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteButton action={deleteLibraryEntry} id={entry.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteFacultyMember, toggleFacultyPublished } from "@/app/admin/faculty/actions";

export const metadata = { title: "Admin — Faculty" };

export default async function AdminFacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: faculty } = await supabase
    .from("faculty")
    .select("*")
    .order("last_name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ucf-black">Faculty</h1>
        <Link
          href="/admin/faculty/new"
          className="bg-ucf-gold text-ucf-black font-semibold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
        >
          + New Faculty Member
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {!faculty || faculty.length === 0 ? (
        <p className="text-gray-500 text-sm">No faculty yet. Create one above.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculty.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ucf-black">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{member.title ?? "—"}</td>
                  <td className="px-4 py-3">
                    <form action={toggleFacultyPublished}>
                      <input type="hidden" name="id" value={member.id} />
                      <input type="hidden" name="published" value={String(member.published)} />
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          member.published
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {member.published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/faculty/${member.id}/edit`}
                        className="text-ucf-gold hover:underline text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteButton action={deleteFacultyMember} id={member.id} />
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

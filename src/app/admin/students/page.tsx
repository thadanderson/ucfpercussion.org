import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Students" };

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("last_name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ucf-black">Students</h1>
        <p className="text-sm text-gray-500">Create students via the Supabase dashboard.</p>
      </div>

      {!students || students.length === 0 ? (
        <p className="text-gray-500 text-sm">No students yet.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Instrument</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Enrollment Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ucf-black">
                    {student.last_name}, {student.first_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{student.instrument ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{student.enrollment_year ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

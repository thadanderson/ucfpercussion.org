import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateFacultyMember } from "@/app/admin/faculty/actions";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Database } from "@/types/database";

type FacultyRow = Database["public"]["Tables"]["faculty"]["Row"];

export const metadata = { title: "Edit Faculty Member" };

export default async function EditFacultyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("faculty").select("*").eq("id", id).single();
  const member = data as FacultyRow | null;
  if (!member) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ucf-black mb-6">Edit Faculty Member</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updateFacultyMember} className="space-y-4">
        <input type="hidden" name="id" value={member.id} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              name="first_name"
              required
              defaultValue={member.first_name}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              name="last_name"
              required
              defaultValue={member.last_name}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            name="title"
            defaultValue={member.title ?? ""}
            placeholder="e.g. Associate Professor of Percussion"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            name="bio"
            rows={5}
            defaultValue={member.bio ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headshot</label>
          <ImageUpload name="headshot_url" bucket="faculty-images" defaultValue={member.headshot_url} />
        </div>

        <button
          type="submit"
          className="bg-ucf-gold text-ucf-black font-semibold px-6 py-2 rounded hover:opacity-90 transition-opacity text-sm"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

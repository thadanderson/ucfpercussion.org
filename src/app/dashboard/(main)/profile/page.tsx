import { createClient } from "@/lib/supabase/server";
import { updateOwnProfile } from "@/app/dashboard/(main)/profile/actions";
import type { Database } from "@/types/database";

type AlumnusRow = Database["public"]["Tables"]["alumni"]["Row"];

export const metadata = { title: "My Profile" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("alumni")
    .select("*")
    .eq("user_id", user!.id)
    .single();
  const alumnus = data as AlumnusRow | null;

  if (!alumnus) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-ucf-white mb-4">My Profile</h1>
        <p className="text-gray-300">
          Your alumni profile hasn&apos;t been set up yet. Please contact the studio admin to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-ucf-white mb-1">My Profile</h1>
      <p className="text-ucf-gold text-sm mb-6">
        {alumnus.first_name} {alumnus.last_name}
        {(alumnus.degree || alumnus.graduation_year) &&
          ` · ${[alumnus.degree, alumnus.graduation_year].filter(Boolean).join(" ")}`}
      </p>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
          Profile saved successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updateOwnProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Current Role</label>
          <input
            name="current_role"
            defaultValue={alumnus.current_role ?? ""}
            placeholder="e.g. Principal Percussionist"
            className="w-full border border-gray-600 bg-white/5 text-ucf-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Current Institution / Orchestra
          </label>
          <input
            name="current_institution"
            defaultValue={alumnus.current_institution ?? ""}
            placeholder="e.g. Atlanta Symphony Orchestra"
            className="w-full border border-gray-600 bg-white/5 text-ucf-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Grad School</label>
          <input
            name="grad_school"
            defaultValue={alumnus.grad_school ?? ""}
            placeholder="e.g. Eastman School of Music"
            className="w-full border border-gray-600 bg-white/5 text-ucf-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
          <textarea
            name="bio"
            rows={5}
            defaultValue={alumnus.bio ?? ""}
            className="w-full border border-gray-600 bg-white/5 text-ucf-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Headshot URL</label>
          <input
            name="headshot_url"
            type="url"
            defaultValue={alumnus.headshot_url ?? ""}
            placeholder="https://..."
            className="w-full border border-gray-600 bg-white/5 text-ucf-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
          <p className="text-gray-400 text-xs mt-1">
            Paste a direct link to your photo. Headshot upload coming soon.
          </p>
        </div>

        <button
          type="submit"
          className="bg-ucf-gold text-ucf-black font-semibold px-6 py-2 rounded hover:opacity-90 transition-opacity text-sm"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}

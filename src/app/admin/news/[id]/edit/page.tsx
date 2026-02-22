import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePost } from "@/app/admin/news/actions";
import type { Database } from "@/types/database";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export const metadata = { title: "Edit Post" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("posts").select("*").eq("id", id).single();
  const post = data as PostRow | null;
  if (!post) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ucf-black mb-6">Edit Post</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updatePost} className="space-y-4">
        <input type="hidden" name="id" value={post.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            required
            defaultValue={post.title}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (auto-derived from title on save)
          </label>
          <input
            disabled
            value={post.slug}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            name="content"
            rows={10}
            defaultValue={post.content ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
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

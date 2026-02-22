import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePost, togglePostPublished } from "@/app/admin/news/actions";

export const metadata = { title: "Admin — News" };

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ucf-black">News</h1>
        <Link
          href="/admin/news/new"
          className="bg-ucf-gold text-ucf-black font-semibold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
        >
          + New Post
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {!posts || posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No posts yet. Create one above.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Published At</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ucf-black">{post.title}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{post.slug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {post.published_at ? fmt.format(new Date(post.published_at)) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={togglePostPublished}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="published" value={String(post.published)} />
                      <input
                        type="hidden"
                        name="existing_published_at"
                        value={post.published_at ?? ""}
                      />
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          post.published
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/news/${post.id}/edit`}
                        className="text-ucf-gold hover:underline text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteButton action={deletePost} id={post.id} />
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

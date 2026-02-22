import { createPost } from "@/app/admin/news/actions";

export const metadata = { title: "New Post" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ucf-black mb-6">New Post</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createPost} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            name="content"
            rows={10}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <button
          type="submit"
          className="bg-ucf-gold text-ucf-black font-semibold px-6 py-2 rounded hover:opacity-90 transition-opacity text-sm"
        >
          Create Post
        </button>
      </form>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/ui/PostCard";
import type { Database } from "@/types/database";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export const metadata = { title: "News" };

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  const posts = postsData as PostRow[] | null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-10">News</h1>

      {!posts || posts.length === 0 ? (
        <p className="text-gray-500">No news yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import type { Database } from "@/types/database";

type Post = Database["public"]["Tables"]["posts"]["Row"];

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-ucf-black">{post.title}</h3>
      {post.published_at && (
        <p className="text-gray-500 text-sm mt-1">
          {fmt.format(new Date(post.published_at))}
        </p>
      )}
      {post.content && (
        <p className="text-gray-700 text-sm mt-3 leading-relaxed line-clamp-3">
          {post.content}
        </p>
      )}
      <Link
        href={`/news/${post.slug}`}
        className="inline-block mt-4 text-sm font-medium text-ucf-gold hover:underline"
      >
        Read more →
      </Link>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Database } from "@/types/database";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("title")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  const post = data as Pick<PostRow, "title"> | null;

  return { title: post?.title ?? "Not Found" };
}

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function NewsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  const post = data as PostRow | null;

  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-3">{post.title}</h1>
      {post.published_at && (
        <p className="text-gray-500 text-sm mb-8">{fmt.format(new Date(post.published_at))}</p>
      )}
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed mt-6">
        {post.content}
      </div>
    </div>
  );
}

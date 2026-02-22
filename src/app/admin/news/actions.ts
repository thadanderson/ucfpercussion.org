"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;

  const { error } = await supabase.from("posts").insert({
    title,
    slug: slugify(title),
    content: (formData.get("content") as string) || null,
  });

  if (error) {
    redirect(`/admin/news/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/news");
}

export async function updatePost(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;

  const { error } = await supabase.from("posts").update({
    title,
    slug: slugify(title),
    content: (formData.get("content") as string) || null,
  }).eq("id", id);

  if (error) {
    redirect(`/admin/news/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/news");
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/news");
}

export async function togglePostPublished(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const published = formData.get("published") === "true";
  const existingPublishedAt = (formData.get("existing_published_at") as string) || null;

  const { error } = await supabase.from("posts").update({
    published: !published,
    published_at: !published
      ? existingPublishedAt ?? new Date().toISOString()
      : null,
  }).eq("id", id);

  if (error) {
    redirect(`/admin/news?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/news");
}

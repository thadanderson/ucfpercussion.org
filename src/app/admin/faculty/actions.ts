"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createFacultyMember(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("faculty").insert({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    title: (formData.get("title") as string) || null,
    bio: (formData.get("bio") as string) || null,
    headshot_url: (formData.get("headshot_url") as string) || null,
    user_id: (formData.get("user_id") as string) || null,
  });

  if (error) {
    redirect(`/admin/faculty/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/faculty");
}

export async function updateFacultyMember(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("faculty").update({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    title: (formData.get("title") as string) || null,
    bio: (formData.get("bio") as string) || null,
    headshot_url: (formData.get("headshot_url") as string) || null,
    user_id: (formData.get("user_id") as string) || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) {
    redirect(`/admin/faculty/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/faculty");
}

export async function deleteFacultyMember(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("faculty").delete().eq("id", id);

  if (error) {
    redirect(`/admin/faculty?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/faculty");
}

export async function toggleFacultyPublished(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const published = formData.get("published") === "true";

  const { error } = await supabase
    .from("faculty")
    .update({ published: !published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    redirect(`/admin/faculty?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/faculty");
}

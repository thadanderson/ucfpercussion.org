"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createLibraryEntry(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("music_library").insert({
    title: formData.get("title") as string,
    composer: (formData.get("composer") as string) || null,
    arranger: (formData.get("arranger") as string) || null,
    instrumentation: (formData.get("instrumentation") as string) || null,
    location: (formData.get("location") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) {
    redirect(`/admin/library/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/library");
}

export async function updateLibraryEntry(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("music_library").update({
    title: formData.get("title") as string,
    composer: (formData.get("composer") as string) || null,
    arranger: (formData.get("arranger") as string) || null,
    instrumentation: (formData.get("instrumentation") as string) || null,
    location: (formData.get("location") as string) || null,
    notes: (formData.get("notes") as string) || null,
  }).eq("id", id);

  if (error) {
    redirect(`/admin/library/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/library");
}

export async function deleteLibraryEntry(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("music_library").delete().eq("id", id);

  if (error) {
    redirect(`/admin/library?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/library");
}

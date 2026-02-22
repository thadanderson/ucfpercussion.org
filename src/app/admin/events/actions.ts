"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    starts_at: formData.get("starts_at") as string,
    ends_at: (formData.get("ends_at") as string) || null,
  });

  if (error) {
    redirect(`/admin/events/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("events").update({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    starts_at: formData.get("starts_at") as string,
    ends_at: (formData.get("ends_at") as string) || null,
  }).eq("id", id);

  if (error) {
    redirect(`/admin/events/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    redirect(`/admin/events?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/events");
}

export async function toggleEventPublished(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const published = formData.get("published") === "true";

  const { error } = await supabase.from("events").update({ published: !published }).eq("id", id);

  if (error) {
    redirect(`/admin/events?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/events");
}

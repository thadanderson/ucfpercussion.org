"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Convert a datetime-local string (no timezone) entered in Eastern time to UTC ISO.
function easternToISO(dtLocal: string | null): string | null {
  if (!dtLocal) return null;
  const naive = new Date(dtLocal + ":00Z"); // parse face value as UTC temporarily
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  }).formatToParts(naive);
  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const offsetHours = parseInt(offsetPart.replace("GMT", ""), 10);
  return new Date(naive.getTime() - offsetHours * 3600000).toISOString();
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    starts_at: easternToISO(formData.get("starts_at") as string) as string,
    ends_at: easternToISO((formData.get("ends_at") as string) || null),
    image_url: (formData.get("image_url") as string) || null,
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
    starts_at: easternToISO(formData.get("starts_at") as string) as string,
    ends_at: easternToISO((formData.get("ends_at") as string) || null),
    image_url: (formData.get("image_url") as string) || null,
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

export async function createNewsletterDraft(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();

  if (!event) {
    redirect(`/admin/events?error=${encodeURIComponent("Event not found.")}`);
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    redirect(`/admin/events?error=${encodeURIComponent("BUTTONDOWN_API_KEY is not set.")}`);
  }

  const fmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/New_York",
  });

  const dateStr = fmt.format(new Date(event.starts_at));
  const endsStr = event.ends_at ? ` – ${fmt.format(new Date(event.ends_at))}` : "";
  const locationStr = event.location ? `\n**Location:** ${event.location}` : "";
  const description = event.description
    ? event.description.replace(/<[^>]+>/g, "").trim()
    : "";

  const body = `## ${event.title}

**When:** ${dateStr}${endsStr}${locationStr}

${description}

[View on UCF Percussion →](${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ucfpercussion.com"}/events)
`;

  const res = await fetch("https://api.buttondown.email/v1/emails", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: event.title,
      body,
      status: "draft",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    redirect(`/admin/events?error=${encodeURIComponent(err?.detail ?? "Failed to create draft.")}`);
  }

  const draft = await res.json();
  const draftUrl = `https://buttondown.com/emails/${draft.id}`;
  redirect(`/admin/events?newsletter=${encodeURIComponent(draftUrl)}`);
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

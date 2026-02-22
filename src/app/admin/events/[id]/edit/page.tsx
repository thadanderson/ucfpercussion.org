import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEvent } from "@/app/admin/events/actions";
import type { Database } from "@/types/database";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export const metadata = { title: "Edit Event" };

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  const event = data as EventRow | null;
  if (!event) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ucf-black mb-6">Edit Event</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updateEvent} className="space-y-4">
        <input type="hidden" name="id" value={event.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            required
            defaultValue={event.title}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            name="location"
            defaultValue={event.location ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starts At *</label>
          <input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={event.starts_at.slice(0, 16)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ends At</label>
          <input
            name="ends_at"
            type="datetime-local"
            defaultValue={event.ends_at ? event.ends_at.slice(0, 16) : ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={event.description ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
        </div>
        <button
          type="submit"
          className="bg-ucf-gold text-ucf-black font-semibold px-6 py-2 rounded hover:opacity-90 transition-opacity text-sm"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

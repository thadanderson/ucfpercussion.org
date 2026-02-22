import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/ui/EventCard";
import type { Database } from "@/types/database";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: eventsData } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .gte("starts_at", now)
    .order("starts_at", { ascending: true });
  const events = eventsData as EventRow[] | null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-10">Upcoming Events</h1>

      {!events || events.length === 0 ? (
        <p className="text-gray-500">No upcoming events at this time. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

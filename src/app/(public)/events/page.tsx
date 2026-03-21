import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/ui/EventCard";
import NewsletterSubscribe from "@/components/ui/NewsletterSubscribe";
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
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-white mb-10">Upcoming Events</h1>

      {!events || events.length === 0 ? (
        <p className="text-ucf-white">No upcoming events at this time. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-white/20">
        <Link
          href="/events/past"
          className="text-ucf-gold hover:underline font-medium"
        >
          View Past Events →
        </Link>
      </div>

      <NewsletterSubscribe />
    </div>
  );
}

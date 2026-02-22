import type { Database } from "@/types/database";

type Event = Database["public"]["Tables"]["events"]["Row"];

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });

export default function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-ucf-black">{event.title}</h3>
      <p className="text-ucf-gold text-sm font-medium mt-1">
        {fmt.format(new Date(event.starts_at))}
        {event.ends_at && ` – ${fmt.format(new Date(event.ends_at))}`}
      </p>
      {event.location && (
        <p className="text-gray-500 text-sm mt-1">{event.location}</p>
      )}
      {event.description && (
        <p className="text-gray-700 text-sm mt-3 leading-relaxed">{event.description}</p>
      )}
    </div>
  );
}

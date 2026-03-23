import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteEvent, toggleEventPublished, toggleEventPinned, createNewsletterDraft } from "@/app/admin/events/actions";

export const metadata = { title: "Admin — Events" };

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; newsletter?: string }>;
}) {
  const { error, newsletter } = await searchParams;
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ucf-black">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-ucf-gold text-ucf-black font-semibold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
        >
          + New Event
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {newsletter && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
          Newsletter draft created.{" "}
          <a
            href={decodeURIComponent(newsletter)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:opacity-80"
          >
            Open in Buttondown →
          </a>
        </div>
      )}

      {!events || events.length === 0 ? (
        <p className="text-gray-500 text-sm">No events yet. Create one above.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Starts At</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Pinned</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-ucf-black">{event.title}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt.format(new Date(event.starts_at))}</td>
                  <td className="px-4 py-3 text-gray-600">{event.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <form action={toggleEventPublished}>
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="published" value={String(event.published)} />
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.published
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {event.published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form action={toggleEventPinned}>
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="pinned" value={String(event.pinned)} />
                      <button
                        type="submit"
                        title={event.pinned ? "Unpin from homepage" : "Pin to homepage"}
                        className={`text-lg leading-none transition-opacity ${
                          event.pinned ? "opacity-100" : "opacity-25 hover:opacity-60"
                        }`}
                      >
                        📌
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-ucf-gold hover:underline text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <form action={createNewsletterDraft} className="inline">
                        <input type="hidden" name="id" value={event.id} />
                        <button
                          type="submit"
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Newsletter
                        </button>
                      </form>
                      <DeleteButton action={deleteEvent} id={event.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: eventsCount },
    { count: postsCount },
    { count: libraryCount },
    { count: studentsCount },
  ] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("music_library").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Events", count: eventsCount ?? 0, href: "/admin/events" },
    { label: "Posts", count: postsCount ?? 0, href: "/admin/news" },
    { label: "Library Entries", count: libraryCount ?? 0, href: "/admin/library" },
    { label: "Students", count: studentsCount ?? 0, href: "/admin/students" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ucf-black mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {stats.map(({ label, count, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-3xl font-bold text-ucf-gold">{count}</p>
            <p className="text-gray-600 text-sm mt-1">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

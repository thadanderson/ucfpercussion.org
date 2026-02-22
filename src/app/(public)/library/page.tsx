import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LibraryClient from "./LibraryClient";

export const metadata = { title: "Music Library" };

export default async function LibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("music_library")
    .select("*")
    .order("title", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-2">Music Library</h1>
      <p className="text-gray-500 text-sm mb-8">
        Percussion Music Library (PML) — {entries?.length ?? 0} entries
      </p>
      <LibraryClient entries={entries ?? []} />
    </div>
  );
}

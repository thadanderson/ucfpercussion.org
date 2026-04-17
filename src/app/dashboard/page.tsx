import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-white mb-10">Studio Dashboard</h1>

      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/wiki"
          className="group flex items-center justify-between bg-neutral-900 border border-neutral-800 hover:border-ucf-gold rounded-sm px-8 py-6 transition-colors"
        >
          <div>
            <h2 className="text-lg font-bold text-ucf-white mb-1 group-hover:text-ucf-gold transition-colors">
              Studio Wiki
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Studio policies, curriculum requirements, degree recitals, and resources.
            </p>
          </div>
          <svg className="w-5 h-5 text-neutral-600 group-hover:text-ucf-gold transition-colors shrink-0 ml-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/dashboard/barrier-review"
          className="group flex items-center justify-between bg-neutral-900 border border-neutral-800 hover:border-ucf-gold rounded-sm px-8 py-6 transition-colors"
        >
          <div>
            <h2 className="text-lg font-bold text-ucf-white mb-1 group-hover:text-ucf-gold transition-colors">
              Barrier Review &amp; Drawing
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Use a chance operation to randomly draw a level of study assignment.
            </p>
          </div>
          <svg className="w-5 h-5 text-neutral-600 group-hover:text-ucf-gold transition-colors shrink-0 ml-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/dashboard/flash-phrases"
          className="group flex items-center justify-between bg-neutral-900 border border-neutral-800 hover:border-ucf-gold rounded-sm px-8 py-6 transition-colors"
        >
          <div>
            <h2 className="text-lg font-bold text-ucf-white mb-1 group-hover:text-ucf-gold transition-colors">
              Flash Phrases
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Coordination training flashcards for drum set with integrated metronome and backing tracks.
            </p>
          </div>
          <svg className="w-5 h-5 text-neutral-600 group-hover:text-ucf-gold transition-colors shrink-0 ml-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {isAdmin && (
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest mb-4">Administration</p>
          <Link
            href="/admin"
            className="group flex items-center justify-between bg-neutral-900/50 border border-neutral-800 hover:border-ucf-gold/60 rounded-sm px-8 py-5 transition-colors"
          >
            <div>
              <h2 className="text-base font-bold text-neutral-400 group-hover:text-ucf-gold transition-colors mb-0.5">
                Admin Dashboard
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Manage events, faculty, assessments, library, and site content.
              </p>
            </div>
            <svg className="w-4 h-4 text-neutral-700 group-hover:text-ucf-gold transition-colors shrink-0 ml-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

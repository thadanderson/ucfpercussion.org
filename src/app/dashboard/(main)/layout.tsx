import { getWikiNav } from "@/lib/wiki";
import { createClient } from "@/lib/supabase/server";
import WikiSidebar from "@/components/wiki/WikiSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const nav = getWikiNav();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <div className="flex min-h-screen">
      <WikiSidebar nav={nav} isAdmin={isAdmin} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

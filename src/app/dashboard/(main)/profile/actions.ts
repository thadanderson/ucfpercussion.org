"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateOwnProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("alumni")
    .update({
      current_role: (formData.get("current_role") as string) || null,
      current_institution: (formData.get("current_institution") as string) || null,
      grad_school: (formData.get("grad_school") as string) || null,
      bio: (formData.get("bio") as string) || null,
      headshot_url: (formData.get("headshot_url") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard/profile?saved=1");
}

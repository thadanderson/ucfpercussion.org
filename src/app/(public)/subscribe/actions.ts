"use server";

export type SubscribeResult = { success: true } | { error: string };

export async function subscribeToNewsletter(formData: FormData): Promise<SubscribeResult> {
  const email = (formData.get("email") as string).trim();
  if (!email) return { error: "Email is required." };

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) return { error: "Newsletter is not configured yet." };

  const res = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (res.status === 201) return { success: true };
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const msg: string = body?.email?.[0] ?? "Invalid email address.";
    // Buttondown returns "Enter a valid email address." for bad format
    // and a subscriber-exists error for duplicates
    if (msg.toLowerCase().includes("already")) {
      return { error: "You're already subscribed!" };
    }
    return { error: msg };
  }

  return { error: "Something went wrong. Please try again." };
}

"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/app/(public)/subscribe/actions";

export default function NewsletterSubscribe() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const result = await subscribeToNewsletter(formData);
    if ("success" in result) {
      setStatus("success");
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  return (
    <div className="border-t border-white/20 mt-16 pt-10">
      <h2 className="text-xl font-bold text-ucf-white mb-1">Stay in the Loop</h2>
      <p className="text-gray-400 text-sm mb-4">
        Subscribe to get notified about upcoming events and news from UCF Percussion.
      </p>

      {status === "success" ? (
        <p className="text-ucf-gold font-medium text-sm">
          You&apos;re subscribed! Check your inbox to confirm.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
          <input
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            className="flex-1 border border-white/20 rounded px-3 py-2 text-sm bg-white/5 text-ucf-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-ucf-gold text-ucf-black font-semibold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-red-400 text-sm mt-2">{message}</p>
      )}
    </div>
  );
}

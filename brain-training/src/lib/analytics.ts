"use client";

type EventPayload = Record<string, unknown> & { event: string };

export async function logEvent(payload: EventPayload) {
  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ts: Date.now() }),
      keepalive: true,
    });
  } catch {
    // no-op
  }
}
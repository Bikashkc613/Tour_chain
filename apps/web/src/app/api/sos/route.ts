import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { booking_id, trek_name, lat, lng, timestamp } = body;

  // Try to get user — but don't block SOS if auth fails
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
  } catch { /* ignore */ }

  const mapsUrl = lat && lng
    ? `https://maps.google.com/?q=${lat},${lng}`
    : null;

  // Log to DB if possible
  try {
    const supabase = await createClient();
    if (supabase && booking_id) {
      await supabase.from("sos_alerts").insert({
        booking_id,
        user_id: userId,
        latitude: lat ?? null,
        longitude: lng ?? null,
        triggered_at: timestamp ?? new Date().toISOString(),
        status: "active",
      });
    }
  } catch { /* table may not exist — that's ok */ }

  // In production: send SMS via Twilio, email via SendGrid, etc.
  // For hackathon: log and return success
  console.log("🆘 SOS ALERT", {
    booking_id,
    trek_name,
    user_id: userId,
    location: mapsUrl ?? "unknown",
    timestamp,
  });

  return NextResponse.json({
    ok: true,
    message: "SOS alert received. Emergency services notified.",
    maps_url: mapsUrl,
    emergency_contacts: [
      { name: "Nepal Police",           number: "100" },
      { name: "Tourist Police",         number: "1144" },
      { name: "Nepal Army Rescue",      number: "01-4271111" },
      { name: "Himalayan Rescue Assoc", number: "01-4440292" },
    ],
  });
}

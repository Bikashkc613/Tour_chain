import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/response";
import { CheckinInput } from "@/lib/validation/schemas";

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return jsonError(500, "missing_env", "Supabase env is not configured");
  }

  const parsed = CheckinInput.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(400, "validation_error", "Invalid check-in payload", parsed.error.flatten());
  }
  const body = parsed.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonError(401, "unauthorized", "Unauthorized");
  }

  const { data: place, error: placeError } = await supabase
    .from("places")
    .select("latitude,longitude")
    .eq("id", body.place_id)
    .maybeSingle();
  if (placeError || !place) {
    return jsonError(404, "not_found", "Place not found");
  }

  const distance = haversineMeters(body.lat, body.lng, Number(place.latitude), Number(place.longitude));
  if (distance > 500) {
    return jsonError(400, "outside_geofence", `Outside geofence (${Math.round(distance)}m)`);
  }

  const { data, error } = await supabase
    .from("check_ins")
    .insert({
      booking_id: body.booking_id,
      user_id: user.id,
      place_id: body.place_id,
      method: "gps",
      latitude: body.lat,
      longitude: body.lng,
      verified: true,
    })
    .select("id,created_at,verified")
    .single();

  if (error) {
    return jsonError(500, "db_error", error.message);
  }

  return jsonOk({ checkin: data });
}

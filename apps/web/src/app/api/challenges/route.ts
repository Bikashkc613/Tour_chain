import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

// ── Shared demo data ──────────────────────────────────────────────────────────
export const DEMO_CHALLENGES = [
  {
    id: "c1",
    title: "May Distance King",
    description: "Complete 50km of trekking this month and prove you're the ultimate distance champion of Nepal.",
    challenge_type: "distance",
    target_value: 50,
    unit: "km",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    prize_pool_sol: 2.5,
    status: "active",
    banner_emoji: "🏃",
    participant_count: 142,
    max_participants: null,
  },
  {
    id: "c2",
    title: "Altitude Ace May",
    description: "Reach 5000m altitude on any verified trek. Only the highest climbers win.",
    challenge_type: "altitude",
    target_value: 5000,
    unit: "m",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    prize_pool_sol: 1.0,
    status: "active",
    banner_emoji: "⛰️",
    participant_count: 89,
    max_participants: 100,
  },
  {
    id: "c3",
    title: "Weekend Warrior",
    description: "Trek 3 consecutive weekends without missing a single one. Consistency is key.",
    challenge_type: "streak",
    target_value: 3,
    unit: "weekends",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    prize_pool_sol: 0.5,
    status: "active",
    banner_emoji: "🔥",
    participant_count: 67,
    max_participants: null,
  },
  {
    id: "c4",
    title: "Social Butterfly",
    description: "Refer 5 friends to Tourism Chain Nepal and help grow the community.",
    challenge_type: "social",
    target_value: 5,
    unit: "referrals",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    prize_pool_sol: 0.75,
    status: "active",
    banner_emoji: "🤝",
    participant_count: 203,
    max_participants: null,
  },
  {
    id: "c5",
    title: "Speed Demon EBC",
    description: "Complete the Poon Hill route in under 4 hours. Speed and endurance combined.",
    challenge_type: "speed",
    target_value: 240,
    unit: "minutes",
    start_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 37 * 86400000).toISOString(),
    prize_pool_sol: 3.0,
    status: "upcoming",
    banner_emoji: "⚡",
    participant_count: 0,
    max_participants: 50,
  },
  {
    id: "c6",
    title: "Place Collector",
    description: "Visit 10 unique verified checkpoints across Nepal. Explore every corner.",
    challenge_type: "collection",
    target_value: 10,
    unit: "places",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 86400000).toISOString(),
    prize_pool_sol: 1.5,
    status: "active",
    banner_emoji: "📍",
    participant_count: 55,
    max_participants: null,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const supabase = await createClient();
    if (!supabase) return jsonOk({ challenges: DEMO_CHALLENGES, source: "demo" });

    let query = supabase
      .from("challenges")
      .select("id,title,description,challenge_type,target_value,unit,start_date,end_date,prize_pool_sol,status,banner_emoji,max_participants")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error || !data?.length) {
      return jsonOk({ challenges: DEMO_CHALLENGES, source: "demo" });
    }

    // Get participant counts separately to avoid join issues
    const ids = data.map((c) => c.id);
    const { data: counts } = await supabase
      .from("challenge_participants")
      .select("challenge_id")
      .in("challenge_id", ids);

    const countMap: Record<string, number> = {};
    for (const row of counts ?? []) {
      countMap[row.challenge_id] = (countMap[row.challenge_id] ?? 0) + 1;
    }

    const challenges = data.map((c) => ({
      ...c,
      participant_count: countMap[c.id] ?? 0,
    }));

    return jsonOk({ challenges, source: "live" });
  } catch {
    return jsonOk({ challenges: DEMO_CHALLENGES, source: "demo" });
  }
}

const CreateChallengeSchema = z.object({
  title:            z.string().min(3).max(100),
  description:      z.string().optional(),
  challenge_type:   z.enum(["distance", "altitude", "streak", "social", "speed", "collection"]),
  target_value:     z.number().int().positive(),
  unit:             z.string().optional(),
  start_date:       z.string(),
  end_date:         z.string(),
  prize_pool_sol:   z.number().nonnegative().optional(),
  max_participants: z.number().int().positive().optional(),
  banner_emoji:     z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError(401, "unauthorized", "Unauthorized");

    const service = createServiceClient();
    const { data: profile } = await service.from("users").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") return jsonError(403, "forbidden", "Admin only");

    const parsed = CreateChallengeSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError(400, "validation_error", "Invalid input", parsed.error.flatten());

    const { data, error } = await service
      .from("challenges")
      .insert({ ...parsed.data, created_by: user.id, status: "upcoming" })
      .select()
      .single();

    if (error) return jsonError(500, "db_error", error.message);
    return jsonOk({ challenge: data }, { status: 201 });
  } catch (err) {
    return jsonError(500, "server_error", String(err));
  }
}

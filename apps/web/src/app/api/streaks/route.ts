import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

const STREAK_TYPES = ["login","trek","checkin","social","quest"] as const;

const MILESTONES = [
  { days: 7,   xp: 100,   badge: "🔥 Week Warrior" },
  { days: 30,  xp: 500,   badge: "🌟 Month Master" },
  { days: 100, xp: 2000,  badge: "💎 Century Trekker" },
  { days: 365, xp: 10000, badge: "🦅 Legendary Streaker" },
];

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Unauthorized");

  const service = createServiceClient();
  const { data } = await service
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id);

  // Fill in missing streak types with defaults
  const streakMap = new Map((data ?? []).map((s) => [s.streak_type, s]));
  const streaks = STREAK_TYPES.map((type) => streakMap.get(type) ?? {
    streak_type: type,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    freeze_count: 0,
  });

  // Today's daily challenge
  const { data: todayChallenge } = await service
    .from("daily_challenges")
    .select("*")
    .eq("date", new Date().toISOString().split("T")[0])
    .maybeSingle();

  // Check if completed today
  let todayCompleted = false;
  if (todayChallenge) {
    const { data: completion } = await service
      .from("daily_challenge_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("daily_challenge_id", todayChallenge.id)
      .maybeSingle();
    todayCompleted = !!completion;
  }

  return jsonOk({ streaks, today_challenge: todayChallenge, today_completed: todayCompleted });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

const MILESTONES = [
  { days: 7,   xp: 100,   badge: "🔥 Week Warrior" },
  { days: 30,  xp: 500,   badge: "🌟 Month Master" },
  { days: 100, xp: 2000,  badge: "💎 Century Trekker" },
  { days: 365, xp: 10000, badge: "🦅 Legendary Streaker" },
];

const Schema = z.object({
  streak_type: z.enum(["login","trek","checkin","social","quest"]),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Unauthorized");

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return jsonError(400, "validation_error", "Invalid input");

  const { streak_type } = parsed.data;
  const service = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  // Get existing streak
  const { data: existing } = await service
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .eq("streak_type", streak_type)
    .maybeSingle();

  const lastDate = existing?.last_activity_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = 1;
  if (lastDate === today) {
    // Already updated today
    return jsonOk({ streak: existing, milestone: null, already_updated: true });
  } else if (lastDate === yesterday) {
    newStreak = (existing?.current_streak ?? 0) + 1;
  } else if (lastDate && existing?.freeze_count && existing.freeze_count > 0) {
    // Use a freeze
    newStreak = (existing?.current_streak ?? 0) + 1;
    await service
      .from("user_streaks")
      .update({ freeze_count: existing.freeze_count - 1 })
      .eq("user_id", user.id)
      .eq("streak_type", streak_type);
  }

  const longestStreak = Math.max(newStreak, existing?.longest_streak ?? 0);
  // Earn freeze every 7 days
  const freezeEarned = newStreak % 7 === 0 && newStreak > 0;
  const newFreezeCount = Math.min(3, (existing?.freeze_count ?? 0) + (freezeEarned ? 1 : 0));

  const upsertData = {
    user_id: user.id,
    streak_type,
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
    freeze_count: newFreezeCount,
    total_freezes_earned: (existing?.total_freezes_earned ?? 0) + (freezeEarned ? 1 : 0),
    updated_at: new Date().toISOString(),
  };

  const { data: updated } = await service
    .from("user_streaks")
    .upsert(upsertData, { onConflict: "user_id,streak_type" })
    .select()
    .single();

  // Check milestones
  let milestone = null;
  for (const m of MILESTONES) {
    if (newStreak === m.days) {
      milestone = m;
      // Record milestone
      await service.from("streak_milestones").insert({
        user_id: user.id,
        streak_type,
        milestone_days: m.days,
        xp_awarded: m.xp,
        badge_awarded: m.badge,
      });
      break;
    }
  }

  return jsonOk({ streak: updated, milestone, freeze_earned: freezeEarned });
}

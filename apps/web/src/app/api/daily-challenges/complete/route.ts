import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

const Schema = z.object({ daily_challenge_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Unauthorized");

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return jsonError(400, "validation_error", "Invalid input");

  const service = createServiceClient();
  const { daily_challenge_id } = parsed.data;

  // Verify challenge exists and is for today
  const today = new Date().toISOString().split("T")[0];
  const { data: challenge } = await service
    .from("daily_challenges")
    .select("*")
    .eq("id", daily_challenge_id)
    .eq("date", today)
    .maybeSingle();

  if (!challenge) return jsonError(404, "not_found", "Daily challenge not found or not for today");

  // Already completed?
  const { data: existing } = await service
    .from("daily_challenge_completions")
    .select("id")
    .eq("user_id", user.id)
    .eq("daily_challenge_id", daily_challenge_id)
    .maybeSingle();

  if (existing) return jsonError(409, "already_completed", "Already completed today's challenge");

  const { data, error } = await service
    .from("daily_challenge_completions")
    .insert({ user_id: user.id, daily_challenge_id })
    .select()
    .single();

  if (error) return jsonError(500, "db_error", error.message);

  return jsonOk({ completion: data, xp_earned: challenge.xp_reward }, { status: 201 });
}

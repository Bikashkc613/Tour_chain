import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

type Ctx = { params: Promise<{ id: string }> };

const DEMO_IDS = new Set(["c1","c2","c3","c4","c5","c6"]);

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  // Demo challenges — simulate join without DB
  if (DEMO_IDS.has(id)) {
    return jsonOk({ participant: { challenge_id: id, status: "active" }, demo: true }, { status: 201 });
  }

  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Please log in to join challenges");

  const service = createServiceClient();

  const { data: challenge } = await service
    .from("challenges")
    .select("id,status,max_participants")
    .eq("id", id)
    .maybeSingle();

  if (!challenge) return jsonError(404, "not_found", "Challenge not found");
  if (!["active","upcoming"].includes(challenge.status)) {
    return jsonError(400, "invalid_status", "Challenge is not open for joining");
  }

  if (challenge.max_participants) {
    const { count } = await service
      .from("challenge_participants")
      .select("*", { count: "exact", head: true })
      .eq("challenge_id", id);
    if ((count ?? 0) >= challenge.max_participants) {
      return jsonError(400, "full", "Challenge is full");
    }
  }

  const { data: existing } = await service
    .from("challenge_participants")
    .select("id")
    .eq("challenge_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return jsonError(409, "already_joined", "Already joined this challenge");

  const { data, error } = await service
    .from("challenge_participants")
    .insert({ challenge_id: id, user_id: user.id })
    .select()
    .single();

  if (error) return jsonError(500, "db_error", error.message);
  return jsonOk({ participant: data }, { status: 201 });
}

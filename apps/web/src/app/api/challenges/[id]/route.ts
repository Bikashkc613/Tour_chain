import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";
import { DEMO_CHALLENGES } from "@/app/api/challenges/route";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  try {
    const supabase = await createClient();
    if (supabase) {
      const service = createServiceClient();
      const { data, error } = await service
        .from("challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const { count } = await service
          .from("challenge_participants")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", id);
        return jsonOk({ challenge: { ...data, participant_count: count ?? 0 }, source: "live" });
      }
    }
  } catch { /* fall through to demo */ }

  const demo = DEMO_CHALLENGES.find((c) => c.id === id);
  if (!demo) return jsonError(404, "not_found", "Challenge not found");
  return jsonOk({ challenge: demo, source: "demo" });
}

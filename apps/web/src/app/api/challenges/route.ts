import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";
import { DEMO_CHALLENGES } from "@/lib/data/demo-challenges";

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

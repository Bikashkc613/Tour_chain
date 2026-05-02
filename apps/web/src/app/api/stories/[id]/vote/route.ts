import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

type Ctx = { params: Promise<{ id: string }> };
const Schema = z.object({ vote_type: z.enum(["upvote","downvote"]) });

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Unauthorized");

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return jsonError(400, "validation_error", "Invalid input");

  const service = createServiceClient();
  const { vote_type } = parsed.data;

  // Check existing vote
  const { data: existing } = await service
    .from("story_votes")
    .select("id,vote_type")
    .eq("story_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === vote_type) {
      // Remove vote (toggle off)
      await service.from("story_votes").delete().eq("id", existing.id);
      const delta = vote_type === "upvote" ? -1 : 0;
      const downDelta = vote_type === "downvote" ? -1 : 0;
      const { data: story } = await service.from("stories").select("upvotes,downvotes").eq("id", id).maybeSingle();
      await service.from("stories").update({ upvotes: Math.max(0,(story?.upvotes??0)+delta), downvotes: Math.max(0,(story?.downvotes??0)+downDelta) }).eq("id", id);
      return jsonOk({ action: "removed", vote_type });
    }
    // Change vote
    await service.from("story_votes").update({ vote_type }).eq("id", existing.id);
  } else {
    await service.from("story_votes").insert({ story_id: id, user_id: user.id, vote_type });
  }

  // Recalculate counts
  const { count: upCount } = await service.from("story_votes").select("*",{count:"exact",head:true}).eq("story_id",id).eq("vote_type","upvote");
  const { count: downCount } = await service.from("story_votes").select("*",{count:"exact",head:true}).eq("story_id",id).eq("vote_type","downvote");
  await service.from("stories").update({ upvotes: upCount??0, downvotes: downCount??0 }).eq("id", id);

  return jsonOk({ action: existing ? "changed" : "added", vote_type, upvotes: upCount??0, downvotes: downCount??0 });
}

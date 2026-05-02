import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

type Ctx = { params: Promise<{ id: string }> };
const Schema = z.object({
  content: z.string().min(1).max(2000),
  parent_comment_id: z.string().uuid().optional(),
});

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const service = createServiceClient();

  const { data, error } = await service
    .from("story_comments")
    .select("*")
    .eq("story_id", id)
    .order("created_at", { ascending: true });

  if (error) return jsonError(500, "db_error", error.message);

  // Fetch user display names
  const userIds = [...new Set((data ?? []).map((c) => c.user_id).filter(Boolean))];
  const { data: users } = userIds.length
    ? await service.from("users").select("id,display_name,email").in("id", userIds)
    : { data: [] };

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));
  const comments = (data ?? []).map((c) => {
    const u = userMap.get(c.user_id);
    return { ...c, author_name: u?.display_name ?? u?.email?.split("@")[0] ?? "Trekker" };
  });

  return jsonOk({ comments });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Unauthorized");

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return jsonError(400, "validation_error", "Invalid input");

  const service = createServiceClient();
  const { data, error } = await service
    .from("story_comments")
    .insert({ story_id: id, user_id: user.id, ...parsed.data })
    .select()
    .single();

  if (error) return jsonError(500, "db_error", error.message);
  return jsonOk({ comment: data }, { status: 201 });
}

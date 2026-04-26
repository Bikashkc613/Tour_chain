import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return jsonOk({ services: [] });
  }

  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId");

  const full = supabase.from("services").select("id,guide_id,route_id,title,price_usd").order("created_at", { ascending: false });
  const altSol = supabase.from("services").select("id,guide_id,route_id,title,price_sol").order("created_at", { ascending: false });
  const altNoPrice = supabase.from("services").select("id,guide_id,route_id,title").order("created_at", { ascending: false });

  type ServiceRow = {
    id: string;
    guide_id: string;
    route_id: string | null;
    title: string;
    price_usd?: number | null;
    price_sol?: number | null;
  };

  let { data, error } = await full.eq("is_active", true);
  if (error?.message?.includes("is_active") && error.message.includes("does not exist")) {
    const retry = await full;
    data = retry.data;
    error = retry.error;
  }
  if (error?.message?.includes("price_usd") && error.message.includes("does not exist")) {
    const retry = await altSol;
    data = retry.data as unknown;
    error = retry.error;
  }
  if (error?.message?.includes("price_sol") && error.message.includes("does not exist")) {
    const retry = await altNoPrice;
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return jsonError(500, "db_error", error.message);
  }

  const rows = (data ?? []) as ServiceRow[];
  const normalized = rows
    .filter((row) => (routeId ? row.route_id === routeId : true))
    .map((row) => ({
      id: row.id,
      guide_id: row.guide_id,
      route_id: row.route_id,
      title: row.title,
      price_usd: row.price_usd ?? row.price_sol ?? 0,
    }));

  return jsonOk({ services: normalized });
}

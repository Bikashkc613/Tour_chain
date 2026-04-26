import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ tourists: 0, totalEscrowUsd: 0, proofs: 0 });
  }

  const [{ count: tourists }, { count: proofs }, { data: bookings }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "tourist"),
    supabase.from("completion_proofs").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("total_price_usd"),
  ]);

  const totalEscrowUsd = (bookings ?? []).reduce((acc, row) => acc + Number(row.total_price_usd || 0), 0);
  return NextResponse.json({
    tourists: tourists ?? 0,
    totalEscrowUsd,
    proofs: proofs ?? 0,
  });
}

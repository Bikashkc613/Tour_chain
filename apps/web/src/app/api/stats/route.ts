import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [touristsRes, nftsRes, bookingsRes] = await Promise.all([
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "tourist"),
      supabase
        .from("completion_proofs")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("status", ["confirmed", "active"]),
    ]);

    return NextResponse.json({
      tourists: touristsRes.count ?? 0,
      nftsMinted: nftsRes.count ?? 0,
      activeBookings: bookingsRes.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { tourists: 0, nftsMinted: 0, activeBookings: 0 },
      { status: 200 }
    );
  }
}

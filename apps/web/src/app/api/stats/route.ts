import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get all stats in parallel
    const [proofsRes, bookingsRes] = await Promise.all([
      // Count completion proofs (NFTs minted)
      supabase
        .from("completion_proofs")
        .select("id", { count: "exact", head: true }),
      
      // Get all bookings with their prices and status
      supabase
        .from("bookings")
        .select("total_price_usd, status"),
    ]);

    // Log for debugging
    console.log("[Stats API] Bookings query result:", {
      error: bookingsRes.error,
      count: bookingsRes.data?.length ?? 0,
      data: bookingsRes.data,
    });

    if (bookingsRes.error) {
      console.error("[Stats API] Bookings query error:", bookingsRes.error);
      
      // If it's an API key error, return zeros but don't crash
      if (bookingsRes.error.message?.includes('API key') || bookingsRes.error.message?.includes('Unregistered')) {
        console.error("[Stats API] Invalid Supabase service role key. Please check SUPABASE_SERVICE_ROLE_KEY in .env.local");
        return NextResponse.json({
          tourists: 0,
          nftsMinted: 0,
          proofs: 0,
          totalEscrowUsd: 0,
          error: "Database connection issue - please check API keys",
        });
      }
    }

    // Calculate total escrow from all bookings (regardless of status)
    const totalEscrowUsd = (bookingsRes.data ?? []).reduce(
      (acc, row) => acc + Number(row.total_price_usd || 0),
      0,
    );

    // Count all bookings as "trekkers onboarded" (any status except cancelled/refunded)
    const activeTrekkers = (bookingsRes.data ?? []).filter(
      (b) => b.status !== 'cancelled' && b.status !== 'refunded'
    ).length;

    return NextResponse.json({
      tourists: activeTrekkers, // Number of active bookings
      nftsMinted: proofsRes.count ?? 0,
      proofs: proofsRes.count ?? 0,
      totalEscrowUsd: Math.round(totalEscrowUsd), // Round to nearest dollar
    });
  } catch (error) {
    console.error("[Stats API] Unexpected error:", error);
    return NextResponse.json(
      { tourists: 0, nftsMinted: 0, proofs: 0, totalEscrowUsd: 0 },
      { status: 200 },
    );
  }
}

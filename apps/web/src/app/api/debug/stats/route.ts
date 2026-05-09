import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Debug endpoint to check stats calculation with detailed logging
 */
export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get bookings
    const bookingsRes = await supabase
      .from("bookings")
      .select("id, status, total_price_usd, created_at");

    // Get proofs
    const proofsRes = await supabase
      .from("completion_proofs")
      .select("id", { count: "exact", head: true });

    const bookings = bookingsRes.data ?? [];
    const totalEscrow = bookings.reduce(
      (acc, row) => acc + Number(row.total_price_usd || 0),
      0,
    );

    const activeTrekkers = bookings.filter(
      (b) => b.status !== 'cancelled' && b.status !== 'refunded'
    ).length;

    return NextResponse.json({
      success: true,
      debug: {
        bookingsQuery: {
          error: bookingsRes.error,
          count: bookings.length,
          data: bookings,
        },
        proofsQuery: {
          error: proofsRes.error,
          count: proofsRes.count,
        },
      },
      stats: {
        tourists: activeTrekkers,
        nftsMinted: proofsRes.count ?? 0,
        proofs: proofsRes.count ?? 0,
        totalEscrowUsd: Math.round(totalEscrow),
      },
      breakdown: {
        totalBookings: bookings.length,
        activeBookings: activeTrekkers,
        bookingsByStatus: bookings.reduce((acc, b) => {
          acc[b.status] = (acc[b.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

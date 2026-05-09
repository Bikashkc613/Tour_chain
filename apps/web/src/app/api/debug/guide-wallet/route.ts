import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Debug endpoint to check and update guide wallet addresses
 * GET: Check guide wallet status
 * POST: Manually set guide wallet (for testing only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get("guideId");

    if (guideId) {
      // Get specific guide
      const { data: guide, error } = await supabase
        .from("guides")
        .select(`
          id,
          user_id,
          users!inner (
            id,
            display_name,
            email,
            wallet_address
          )
        `)
        .eq("id", guideId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      const user = Array.isArray(guide.users) ? guide.users[0] : guide.users;

      return NextResponse.json({
        guide: {
          id: guide.id,
          user_id: guide.user_id,
          display_name: user?.display_name,
          email: user?.email,
          wallet_address: user?.wallet_address,
          has_wallet: !!user?.wallet_address,
        },
      });
    }

    // Get all guides with wallet status
    const { data: guides, error } = await supabase
      .from("guides")
      .select(`
        id,
        user_id,
        users!inner (
          id,
          display_name,
          email,
          wallet_address
        )
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const guidesWithWalletStatus = guides.map((guide) => {
      const user = Array.isArray(guide.users) ? guide.users[0] : guide.users;
      return {
        id: guide.id,
        user_id: guide.user_id,
        display_name: user?.display_name,
        email: user?.email,
        wallet_address: user?.wallet_address,
        has_wallet: !!user?.wallet_address,
      };
    });

    return NextResponse.json({
      total: guidesWithWalletStatus.length,
      with_wallet: guidesWithWalletStatus.filter((g) => g.has_wallet).length,
      without_wallet: guidesWithWalletStatus.filter((g) => !g.has_wallet).length,
      guides: guidesWithWalletStatus,
    });
  } catch (error) {
    console.error("[Guide Wallet Debug] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { userId, walletAddress } = body;

    if (!userId || !walletAddress) {
      return NextResponse.json(
        { error: "userId and walletAddress required" },
        { status: 400 }
      );
    }

    // Update user's wallet address
    const { error } = await supabase
      .from("users")
      .update({ wallet_address: walletAddress })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Wallet address updated",
      userId,
      walletAddress,
    });
  } catch (error) {
    console.error("[Guide Wallet Debug] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

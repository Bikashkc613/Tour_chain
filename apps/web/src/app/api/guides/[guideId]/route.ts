import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guideId: string }> }
) {
  try {
    const { guideId } = await params;
    const supabase = await createClient();

    // Get guide with user details (including wallet_address)
    const { data: guide, error } = await supabase
      .from("guides")
      .select(`
        id,
        user_id,
        bio,
        languages,
        specialties,
        years_experience,
        is_verified,
        users!inner (
          id,
          display_name,
          wallet_address,
          avatar_url
        )
      `)
      .eq("id", guideId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // Flatten the response
    const user = Array.isArray(guide.users) ? guide.users[0] : guide.users;
    
    return NextResponse.json({
      guide: {
        id: guide.id,
        user_id: guide.user_id,
        display_name: user?.display_name,
        wallet_address: user?.wallet_address,
        avatar_url: user?.avatar_url,
        bio: guide.bio,
        languages: guide.languages,
        specialties: guide.specialties,
        years_experience: guide.years_experience,
        is_verified: guide.is_verified,
      },
    });
  } catch (error) {
    console.error("[Guides API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guide" },
      { status: 500 }
    );
  }
}

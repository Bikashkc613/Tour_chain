import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Debug endpoint to check bookings data directly
 * This bypasses RLS using service role key
 */
export async function GET() {
  try {
    const supabase = createServiceClient();

    // Try to get all bookings
    const { data, error, count } = await supabase
      .from("bookings")
      .select("*", { count: "exact" });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({
      success: true,
      count,
      bookings: data,
      message: `Found ${count ?? 0} bookings in database`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

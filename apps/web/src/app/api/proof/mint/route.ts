import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/response";
import { ProofMintInput } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return jsonError(500, "missing_env", "Supabase env is not configured");
  }

  const parsed = ProofMintInput.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(400, "validation_error", "Invalid proof mint payload", parsed.error.flatten());
  }
  const body = parsed.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonError(401, "unauthorized", "Unauthorized");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return jsonError(403, "forbidden", "Admin only");
  }

  const fakeMintAddress = `pending-${Date.now()}`;
  const { data, error } = await supabase
    .from("completion_proofs")
    .insert({
      booking_id: body.bookingId,
      user_id: user.id,
      nft_mint_address: fakeMintAddress,
      metadata_uri: body.uri,
    })
    .select("id,nft_mint_address,metadata_uri,created_at")
    .single();

  if (error) {
    return jsonError(500, "db_error", error.message);
  }

  return jsonOk({ proof: data });
}

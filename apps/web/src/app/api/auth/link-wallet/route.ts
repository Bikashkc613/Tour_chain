import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSignMessage, verifyWalletSignature } from "@/lib/auth/wallet";

const NONCE_TTL_MS = 5 * 60 * 1000;
const usedNonces = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, nonce } = body ?? {};

    if (!walletAddress || !signature || !nonce) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const nonceTs = parseInt(nonce, 10);
    if (isNaN(nonceTs) || Date.now() - nonceTs > NONCE_TTL_MS) {
      return NextResponse.json({ error: "Nonce expired or invalid" }, { status: 400 });
    }
    if (usedNonces.has(nonce)) {
      return NextResponse.json({ error: "Nonce already used" }, { status: 400 });
    }

    const message = buildSignMessage(nonce, walletAddress);
    const valid = verifyWalletSignature(message, signature, walletAddress);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .update({ wallet_address: walletAddress })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Wallet already linked to another account" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: "Failed to link wallet" }, { status: 400 });
    }

    usedNonces.add(nonce);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

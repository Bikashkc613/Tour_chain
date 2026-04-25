import nacl from "tweetnacl";
import bs58 from "bs58";
import { createClient } from "@/lib/supabase/client";

export function buildSignMessage(nonce: string, walletAddress: string): string {
  return `TourChain: link wallet ${walletAddress} at ${nonce}`;
}

export function verifyWalletSignature(
  message: string,
  signatureBase58: string,
  walletAddress: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signatureBase58);
    const publicKeyBytes = bs58.decode(walletAddress);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

export async function linkWallet(
  userId: string,
  walletAddress: string,
  signatureBase58: string,
  nonce: string
): Promise<{ error: string | null }> {
  const message = buildSignMessage(nonce, walletAddress);
  const valid = verifyWalletSignature(message, signatureBase58, walletAddress);
  if (!valid) return { error: "Invalid signature" };

  const supabase = createClient();
  const { error } = await supabase
    .from("users")
    .update({ wallet_address: walletAddress })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

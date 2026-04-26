import { PublicKey } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export function getGuidePda(guideWallet: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("guide"), guideWallet.toBuffer()],
    programId,
  );
}

export async function fetchGuideReputation(_wallet: WalletContextState) {
  // This gets wired to IDL-backed account fetches once IDLs are copied in Prompt 7/8.
  return null;
}

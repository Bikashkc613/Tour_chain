import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

export function getProvider(wallet: AnchorWallet): AnchorProvider {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com",
    "confirmed"
  );
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

export function getProgram<T extends Record<string, unknown>>(
  idl: T,
  provider: AnchorProvider
): Program<T> {
  return new Program<T>(idl, provider);
}

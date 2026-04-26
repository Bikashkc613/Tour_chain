import type { WalletContextState } from "@solana/wallet-adapter-react";

export async function createEscrow(_wallet: WalletContextState, _args: Record<string, unknown>) {
  throw new Error("createEscrow is not wired yet");
}

export async function releaseMilestone(_wallet: WalletContextState, _args: Record<string, unknown>) {
  throw new Error("releaseMilestone is not wired yet");
}

export async function completeBooking(_wallet: WalletContextState, _args: Record<string, unknown>) {
  throw new Error("completeBooking is not wired yet");
}

export async function cancelBooking(_wallet: WalletContextState, _args: Record<string, unknown>) {
  throw new Error("cancelBooking is not wired yet");
}

"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";
import { publicEnv } from "@/lib/env";

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const cluster = (publicEnv.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet").toLowerCase();
  const network =
    cluster === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : cluster === "testnet"
        ? WalletAdapterNetwork.Testnet
        : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(
    () => publicEnv.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network),
    [network],
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [],
  );

  // Error handler for wallet connection errors
  const onError = (error: Error) => {
    // Suppress auto-connect errors - these are expected when no wallet is connected
    if (error.name === 'WalletConnectionError' || error.message.includes('User rejected')) {
      console.log('[Wallet] Auto-connect failed (this is normal if no wallet was previously connected)');
      return;
    }
    // Log other errors
    console.error('[Wallet Error]:', error);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

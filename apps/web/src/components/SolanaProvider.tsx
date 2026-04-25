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
  NightlyWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

const clusterMap: Record<string, WalletAdapterNetwork> = {
  mainnet: WalletAdapterNetwork.Mainnet,
  testnet: WalletAdapterNetwork.Testnet,
  devnet: WalletAdapterNetwork.Devnet,
};

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const clusterEnv = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";
  const network = clusterMap[clusterEnv] ?? WalletAdapterNetwork.Devnet;
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl(network);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new NightlyWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

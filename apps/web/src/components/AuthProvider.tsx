"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { signIn as emailSignIn, signOut as emailSignOut } from "@/lib/auth/email";
import { buildSignMessage } from "@/lib/auth/wallet";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  wallet: ReturnType<typeof useWallet>;
  isGuide: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  connectWallet: () => Promise<void>;
  linkWallet: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const wallet = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await emailSignIn(email, password);
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await emailSignOut();
    wallet.disconnect();
  }, [wallet]);

  const connectWallet = useCallback(async () => {
    if (!wallet.select) return;
    await wallet.connect();
  }, [wallet]);

  const linkWallet = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signMessage || !user) {
      return { error: "Wallet not connected or not signed in" };
    }

    const nonce = String(Date.now());
    const message = buildSignMessage(nonce, wallet.publicKey.toBase58());
    const encoded = new TextEncoder().encode(message);

    let signatureBytes: Uint8Array;
    try {
      signatureBytes = await wallet.signMessage(encoded);
    } catch {
      return { error: "User rejected signature" };
    }

    const bs58 = await import("bs58");
    const signature = bs58.default.encode(signatureBytes);

    const res = await fetch("/api/auth/link-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: wallet.publicKey.toBase58(),
        signature,
        nonce,
      }),
    });

    const data = await res.json();
    return { error: data.error ?? null };
  }, [wallet, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        wallet,
        isGuide: role === "guide",
        isAdmin: role === "admin",
        signIn,
        signOut,
        connectWallet,
        linkWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

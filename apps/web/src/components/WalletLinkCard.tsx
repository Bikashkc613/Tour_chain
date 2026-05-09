"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle2, AlertCircle, Loader2, Shield, Zap } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function WalletLinkCard() {
  const wallet = useWallet();
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLinked, setIsLinked] = useState(false);

  // Check if wallet is already linked
  useEffect(() => {
    const checkWallet = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.wallet_address) {
            setWalletAddress(data.user.wallet_address);
            setIsLinked(true);
          }
        }
      } catch {
        // Ignore errors
      }
    };
    void checkWallet();
  }, [user]);

  const handleLinkWallet = async () => {
    if (!wallet.publicKey || !wallet.signMessage) {
      setMessage({ type: "error", text: "Please connect your wallet first" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Generate nonce
      const nonce = Date.now().toString();
      const walletAddr = wallet.publicKey.toBase58();
      
      // Create message to sign
      const message = `TourChain: link wallet ${walletAddr} at ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature
      const signature = await wallet.signMessage(encodedMessage);
      const signatureBase58 = Buffer.from(signature).toString("base64");

      // Send to API
      const res = await fetch("/api/auth/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletAddr,
          signature: signatureBase58,
          nonce,
        }),
      });

      if (res.ok) {
        setWalletAddress(walletAddr);
        setIsLinked(true);
        setMessage({ type: "success", text: "Wallet linked successfully! You can now receive escrow payments." });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error?.message || "Failed to link wallet" });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to link wallet" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg"
    >
      {/* Header gradient */}
      <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #1a2b4a, #e07b39, #2d6a4f)" }} />

      <div className="p-6 space-y-5">
        {/* Title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: isLinked ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #1a2b4a, #2d3a5a)" }}>
            {isLinked ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : (
              <Wallet className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {isLinked ? "Wallet Connected" : "Link Your Wallet"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isLinked 
                ? "Your wallet is linked and ready to receive escrow payments"
                : "Connect your Solana wallet to enable escrow payments from tourists"}
            </p>
          </div>
        </div>

        {/* Status */}
        {isLinked && walletAddress && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-900">Wallet Linked</span>
            </div>
            <p className="text-xs font-mono text-emerald-700 break-all">
              {walletAddress}
            </p>
          </div>
        )}

        {/* Benefits */}
        {!isLinked && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Shield className="w-4 h-4" />, label: "Trustless Escrow", desc: "Funds locked on-chain" },
              { icon: <Zap className="w-4 h-4" />, label: "Auto-Release", desc: "Milestone-based payments" },
            ].map((benefit) => (
              <div key={benefit.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-orange-500">{benefit.icon}</div>
                  <span className="text-xs font-semibold text-gray-900">{benefit.label}</span>
                </div>
                <p className="text-xs text-gray-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl p-4 flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
                {message.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!isLinked && (
          <div className="space-y-3">
            {!wallet.connected ? (
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-orange-500 !to-orange-600 hover:!from-orange-600 hover:!to-orange-700 !rounded-xl !px-6 !py-3 !font-bold !text-white !transition-all" />
              </div>
            ) : (
              <button
                onClick={handleLinkWallet}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Linking Wallet...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Link Wallet</span>
                  </>
                )}
              </button>
            )}
            
            <p className="text-xs text-gray-400 text-center">
              By linking your wallet, you enable tourists to lock funds in escrow for your services
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

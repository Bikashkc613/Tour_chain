"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { createEscrow } from "@/lib/solana/escrow";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Lock, CheckCircle2, ExternalLink, Loader2,
  AlertCircle, Wallet, ChevronRight, Zap, Star, Clock,
} from "lucide-react";

interface EscrowPanelProps {
  bookingId: string;
  priceUsd: number;
  guideWallet?: string;
  onSuccess?: (signature: string) => void;
}

const SOL_PRICE_USD = 150;

const MILESTONES = [
  { label: "Booking Confirmed",   pct: 20, icon: "✅", desc: "Guide activates your trek on-chain" },
  { label: "Trek Starts",         pct: 30, icon: "🥾", desc: "First checkpoint verified via GPS" },
  { label: "Halfway Complete",    pct: 30, icon: "⛰️", desc: "Mid-route milestone reached" },
  { label: "Trek Completed",      pct: 20, icon: "🎖️", desc: "Final release + NFT minted" },
];

export function EscrowPanel({ bookingId, priceUsd, guideWallet, onSuccess }: EscrowPanelProps) {
  const wallet = useWallet();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [signature, setSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMilestones, setShowMilestones] = useState(false);

  const amountSol = priceUsd / SOL_PRICE_USD;
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const handleLockFunds = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setErrorMsg("Please connect your Solana wallet first.");
      setStatus("error");
      return;
    }
    if (!guideWallet) {
      setErrorMsg("Guide wallet address not available.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    try {
      const guidePubkey = new PublicKey(guideWallet);
      const adminPubkey = new PublicKey("11111111111111111111111111111111");
      const createdAt = Math.floor(Date.now() / 1000);
      const sig = await createEscrow(
        wallet as Parameters<typeof createEscrow>[0],
        guidePubkey,
        adminPubkey,
        new BN(lamports),
        3,
        createdAt,
      );
      setSignature(sig);
      setStatus("success");
      onSuccess?.(sig);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setErrorMsg(msg.includes("rejected") ? "Transaction rejected by wallet." : msg);
      setStatus("error");
    }
  };

  /* ── Wallet not connected ─────────────────────────────────── */
  if (!wallet.connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-amber-200/60 p-6"
        style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-base">Connect wallet to secure your booking</p>
            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
              Link your Solana wallet to lock funds in a trustless on-chain escrow — your money is protected until the trek is verified complete.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["No middlemen", "On-chain verified", "Instant release"].map((t) => (
                <span key={t} className="text-xs bg-amber-100 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Success state ────────────────────────────────────────── */
  if (status === "success" && signature) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-3xl border border-emerald-200 p-6 space-y-5"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
      >
        {/* Confetti orb */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #22c55e, transparent)" }} />

        <div className="relative flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <p className="font-bold text-emerald-900 text-lg">Funds Locked Successfully!</p>
            <p className="text-emerald-600 text-sm">Your trek is now fully protected on-chain</p>
          </div>
        </div>

        {/* Amount pill */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Locked in Escrow</p>
              <p className="font-bold text-emerald-900 text-lg">{amountSol.toFixed(4)} SOL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-700">${priceUsd}</p>
            <p className="text-xs text-emerald-500">USD equivalent</p>
          </div>
        </div>

        {/* Milestone release schedule */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Release Schedule</p>
          {MILESTONES.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2"
            >
              <span className="text-lg">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800 truncate">{m.label}</p>
                <p className="text-xs text-emerald-500 truncate">{m.desc}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                {m.pct}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* Tx hash */}
        <div className="bg-emerald-900/5 rounded-xl p-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-emerald-600 font-semibold">Transaction Hash</p>
            <p className="text-xs font-mono text-emerald-800 mt-0.5">
              {signature.slice(0, 16)}…{signature.slice(-8)}
            </p>
          </div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    );
  }

  /* ── Main panel ───────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-[#1a2b4a]/10 space-y-0"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #f0f9ff 100%)" }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #e07b39, #1a2b4a, #2d6a4f)" }} />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #e07b39, transparent)" }} />

      <div className="relative p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #1a2b4a, #2d3a5a)" }}>
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[#1a2b4a] text-base">Trustless Escrow Protection</p>
              <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> Solana
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">
              Your payment is held on-chain — released only when your trek is GPS-verified complete.
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "🔐", label: "Non-custodial", sub: "You hold the keys" },
            { icon: "⛓️", label: "On-chain",      sub: "Solana devnet" },
            { icon: "⚡", label: "Instant",       sub: "Auto-release" },
          ].map((b) => (
            <div key={b.label} className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/80 shadow-sm">
              <div className="text-xl mb-1">{b.icon}</div>
              <p className="text-xs font-bold text-[#1a2b4a]">{b.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>

        {/* Amount card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1a2b4a08, #1a2b4a04)" }}>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#1a2b4a]" />
              <span className="text-sm font-bold text-[#1a2b4a]">Amount to Lock</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1a2b4a] text-xl">{amountSol.toFixed(4)} SOL</p>
              <p className="text-xs text-gray-400">≈ ${priceUsd} USD</p>
            </div>
          </div>
          {/* Milestone bar */}
          <div className="px-4 py-3 border-t border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">Release milestones</p>
              <button
                onClick={() => setShowMilestones((v) => !v)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-0.5 transition-colors"
              >
                {showMilestones ? "Hide" : "View"} schedule
                <ChevronRight className={`w-3 h-3 transition-transform ${showMilestones ? "rotate-90" : ""}`} />
              </button>
            </div>
            {/* Visual bar */}
            <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
              {MILESTONES.map((m, i) => (
                <div
                  key={i}
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${m.pct}%`,
                    background: ["#e07b39", "#1a2b4a", "#2d6a4f", "#d62828"][i],
                  }}
                />
              ))}
            </div>
            <AnimatePresence>
              {showMilestones && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    {MILESTONES.map((m, i) => (
                      <div key={m.label} className="flex items-center gap-3">
                        <span className="text-base">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{m.label}</p>
                          <p className="text-[10px] text-gray-400 truncate">{m.desc}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="w-2 h-2 rounded-full" style={{ background: ["#e07b39","#1a2b4a","#2d6a4f","#d62828"][i] }} />
                          <span className="text-xs font-bold text-gray-600">{m.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* How it works — compact steps */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { n: "1", text: "Lock funds in Solana PDA",    icon: <Lock className="w-3.5 h-3.5" /> },
            { n: "2", text: "Guide activates on-chain",    icon: <Zap className="w-3.5 h-3.5" /> },
            { n: "3", text: "Milestones release payment",  icon: <Star className="w-3.5 h-3.5" /> },
            { n: "4", text: "NFT minted on completion",    icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 border border-white/80">
              <div className="w-6 h-6 rounded-lg bg-[#1a2b4a] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                {s.n}
              </div>
              <p className="text-xs text-gray-600 font-medium leading-tight">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {status === "error" && errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Transaction Failed</p>
                <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA button */}
        <motion.button
          onClick={() => void handleLockFunds()}
          disabled={status === "loading"}
          whileHover={status !== "loading" ? { scale: 1.02 } : {}}
          whileTap={status !== "loading" ? { scale: 0.98 } : {}}
          className="relative w-full overflow-hidden flex items-center justify-center gap-2.5 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-70 shadow-xl"
          style={{ background: status === "loading"
            ? "linear-gradient(135deg, #4f46e5, #6366f1)"
            : "linear-gradient(135deg, #1a2b4a 0%, #e07b39 100%)" }}
        >
          {/* Shine sweep */}
          {status !== "loading" && (
            <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <span className="absolute top-0 left-[-60%] w-1/2 h-full bg-white/10 skew-x-[-20deg] transition-all duration-700 hover:left-[150%]" />
            </span>
          )}
          {status === "loading" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending to Solana…</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Lock {amountSol.toFixed(4)} SOL in Escrow</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </>
          )}
        </motion.button>

        {/* Loading progress */}
        <AnimatePresence>
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Awaiting wallet signature…
                </span>
                <span className="text-indigo-500 font-semibold">Processing</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #1a2b4a, #e07b39)" }}
                  animate={{ width: ["0%", "90%"] }}
                  transition={{ duration: 8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-[#9945FF]">Solana</span>
          </p>
          <p className="text-xs text-gray-400 font-mono">
            Program: B1M6gH…amrt
          </p>
        </div>
      </div>
    </motion.div>
  );
}

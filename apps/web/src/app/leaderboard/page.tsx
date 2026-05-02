"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/app/api/leaderboard/route";

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-gray-100",    text: "text-gray-600",   border: "border-gray-200" },
  2: { bg: "bg-green-50",    text: "text-green-700",  border: "border-green-200" },
  3: { bg: "bg-blue-50",     text: "text-blue-700",   border: "border-blue-200" },
  4: { bg: "bg-purple-50",   text: "text-purple-700", border: "border-purple-200" },
  5: { bg: "bg-orange-50",   text: "text-orange-700", border: "border-orange-200" },
  6: { bg: "bg-yellow-50",   text: "text-yellow-700", border: "border-yellow-300" },
};

const RANK_STYLE: Record<number, { bg: string; text: string; glow: string }> = {
  1: { bg: "bg-gradient-to-br from-yellow-400 to-amber-500",   text: "text-white", glow: "shadow-yellow-400/50" },
  2: { bg: "bg-gradient-to-br from-gray-300 to-gray-400",      text: "text-white", glow: "shadow-gray-400/50" },
  3: { bg: "bg-gradient-to-br from-amber-600 to-orange-700",   text: "text-white", glow: "shadow-orange-500/50" },
};

function XPBar({ xp, level }: { xp: number; level: number }) {
  const LEVEL_XP = [0, 500, 1500, 3000, 6000, 10000, 99999];
  const current = LEVEL_XP[level - 1] ?? 0;
  const next = LEVEL_XP[level] ?? 99999;
  const pct = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: "linear-gradient(90deg,#f97316,#fbbf24)" }}
      />
    </div>
  );
}

function LeaderRow({ entry, index, isCurrentUser }: { entry: LeaderboardEntry; index: number; isCurrentUser?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const rankStyle = RANK_STYLE[entry.rank];
  const lvlColor = LEVEL_COLORS[entry.level] ?? LEVEL_COLORS[1];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        onClick={() => setExpanded((e) => !e)}
        className="cursor-pointer rounded-2xl border transition-all duration-200"
        style={{
          background: isCurrentUser
            ? "linear-gradient(135deg,rgba(249,115,22,0.15),rgba(251,191,36,0.1))"
            : "rgba(255,255,255,0.04)",
          borderColor: isCurrentUser ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)",
          boxShadow: entry.rank <= 3 ? `0 4px 20px ${rankStyle?.glow ?? "transparent"}` : "none",
        }}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Rank */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              rankStyle ? `${rankStyle.bg} ${rankStyle.text} shadow-lg` : "bg-white/10 text-white/60"
            }`}
          >
            {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : `#${entry.rank}`}
          </div>

          {/* Avatar + name */}
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
            {entry.avatar_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-white truncate">{entry.display_name}</p>
              {isCurrentUser && (
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">YOU</span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvlColor.bg} ${lvlColor.text} ${lvlColor.border}`}>
                Lv.{entry.level} {entry.level_name}
              </span>
            </div>
            <XPBar xp={entry.xp} level={entry.level} />
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-5 shrink-0">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{entry.treks_completed}</p>
              <p className="text-white/40 text-xs">Treks</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{entry.nfts_minted}</p>
              <p className="text-white/40 text-xs">NFTs</p>
            </div>
            <div className="text-center">
              <p className="text-orange-400 font-bold text-lg">{entry.xp.toLocaleString()}</p>
              <p className="text-white/40 text-xs">XP</p>
            </div>
          </div>

          <span className="text-white/30 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
        </div>

        {/* Expanded badges */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 px-4 pb-4 pt-3"
          >
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Badges</p>
            {entry.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {entry.badges.map((b) => (
                  <span key={b} className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/10">
                    {b}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">No badges yet — complete a trek to earn your first!</p>
            )}
            <div className="mt-3 flex gap-3 text-xs text-white/40 sm:hidden">
              <span>🚶 {entry.treks_completed} treks</span>
              <span>🎖️ {entry.nfts_minted} NFTs</span>
              <span>⚡ {entry.xp.toLocaleString()} XP</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<"live" | "demo">("demo");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        setBoard(data.leaderboard ?? []);
        setSource(data.source ?? "demo");
      } catch {
        setBoard([]);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <main
      className="min-h-screen pb-20 relative"
      style={{ background: "linear-gradient(160deg,#080d1a 0%,#0f1628 50%,#080d1a 100%)" }}
    >
      {/* Mountain silhouette */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-0 opacity-[0.05]" style={{ height: "280px", background: "white", clipPath: "polygon(0% 100%,0% 70%,5% 65%,10% 55%,15% 60%,20% 40%,25% 45%,30% 25%,35% 30%,40% 15%,45% 20%,50% 5%,55% 18%,60% 12%,65% 28%,70% 22%,75% 38%,80% 32%,85% 48%,90% 42%,95% 58%,100% 52%,100% 100%)" }} />
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[20%] w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(245,158,11,0.12),transparent 70%)", animation: "orb-float 16s ease-in-out infinite" }} />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.10),transparent 70%)", animation: "orb-float 20s ease-in-out infinite", animationDelay: "5s" }} />
        <div className="absolute top-[50%] left-[5%] w-[300px] h-[300px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(224,123,57,0.07),transparent 70%)", animation: "orb-float 24s ease-in-out infinite", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 pt-28 px-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full px-4 py-2 text-sm text-yellow-300 mb-5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            {source === "live" ? "Live Rankings" : "Demo Rankings"}
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-3"
            style={{ fontFamily: "Georgia, serif", textShadow: "0 0 40px rgba(245,158,11,0.3)" }}
          >
            🏆 Leaderboard
          </h1>
          <p className="text-white/50 text-lg max-w-md mx-auto">
            Earn XP by completing treks, minting NFTs, and checking in at checkpoints. Climb the ranks.
          </p>
        </div>

        {/* XP legend */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "🚶", label: "Trek Complete", xp: "+500 XP" },
            { icon: "🎖️", label: "NFT Minted",    xp: "+300 XP" },
            { icon: "📍", label: "Checkpoint",    xp: "+50 XP" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-white/60 text-xs">{item.label}</p>
              <p className="text-orange-400 font-bold text-sm">{item.xp}</p>
            </div>
          ))}
        </div>

        {/* Podium — top 3 */}
        {loaded && top3.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-end justify-center gap-3 mb-8"
          >
            {/* 2nd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="text-3xl float-slow">{top3[1].avatar_emoji}</div>
              <p className="text-white/80 text-sm font-bold text-center truncate w-full">{top3[1].display_name}</p>
              <p className="text-orange-400 font-bold text-sm">{top3[1].xp.toLocaleString()} XP</p>
              <div className="w-full bg-gradient-to-t from-gray-500/40 to-gray-400/20 border border-gray-400/30 rounded-t-xl flex items-center justify-center py-4 text-2xl" style={{ height: "80px" }}>🥈</div>
            </motion.div>
            {/* 1st */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl"
              >{top3[0].avatar_emoji}</motion.div>
              <p className="text-white font-bold text-center truncate w-full">{top3[0].display_name}</p>
              <p className="text-yellow-400 font-bold">{top3[0].xp.toLocaleString()} XP</p>
              <div className="w-full bg-gradient-to-t from-yellow-500/40 to-yellow-400/20 border border-yellow-400/40 rounded-t-xl flex items-center justify-center py-4 text-3xl" style={{ height: "110px", boxShadow: "0 0 30px rgba(245,158,11,0.2)" }}>🥇</div>
            </motion.div>
            {/* 3rd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="text-3xl float-slow" style={{ animationDelay: "1s" }}>{top3[2].avatar_emoji}</div>
              <p className="text-white/80 text-sm font-bold text-center truncate w-full">{top3[2].display_name}</p>
              <p className="text-orange-400 font-bold text-sm">{top3[2].xp.toLocaleString()} XP</p>
              <div className="w-full bg-gradient-to-t from-orange-700/40 to-orange-600/20 border border-orange-600/30 rounded-t-xl flex items-center justify-center py-4 text-2xl" style={{ height: "60px" }}>🥉</div>
            </motion.div>
          </motion.div>
        )}

        {/* Full list */}
        {!loaded ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {board.map((entry, i) => (
              <LeaderRow key={entry.user_id} entry={entry} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-white/40 text-sm mb-4">Start trekking to earn XP and climb the ranks</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-orange-500/25"
          >
            🧭 Explore Routes
          </Link>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Clock, Target, Zap, Star, ChevronRight, Search, Filter, TrendingUp, Award, X } from "lucide-react";

const NAVY  = "#1a2b4a";
const GREEN = "#2d6a4f";

type Challenge = {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  prize_pool_sol: number;
  status: string;
  banner_emoji: string;
  participant_count: number;
  max_participants: number | null;
};

type LeaderboardEntry = {
  rank: number;
  display_name: string;
  avatar: string;
  progress: number;
  target: number;
  pct: number;
};

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string; label: string; gradient: string }> = {
  distance:   { icon: "🏃", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Distance",   gradient: "from-blue-400 to-blue-600"   },
  altitude:   { icon: "⛰️", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", label: "Altitude",   gradient: "from-purple-400 to-purple-600" },
  streak:     { icon: "🔥", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", label: "Streak",     gradient: "from-orange-400 to-red-500"   },
  social:     { icon: "🤝", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", label: "Social",     gradient: "from-emerald-400 to-green-600" },
  speed:      { icon: "⚡", color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Speed",      gradient: "from-yellow-400 to-amber-500"  },
  collection: { icon: "📍", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Collection", gradient: "from-red-400 to-rose-600"     },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; textColor: string; bg: string }> = {
  active:    { label: "Live Now",  dot: "bg-emerald-400 animate-pulse", textColor: "#059669", bg: "#ecfdf5" },
  upcoming:  { label: "Upcoming",  dot: "bg-blue-400",                  textColor: "#2563eb", bg: "#eff6ff" },
  completed: { label: "Ended",     dot: "bg-gray-400",                  textColor: "#6b7280", bg: "#f9fafb" },
};


function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [endDate]);
  return <span className="font-mono text-xs font-bold">{timeLeft}</span>;
}

/* ── Leaderboard mini panel ──────────────────────────────────── */
function LeaderboardPanel({ challengeId, onClose }: { challengeId: string; onClose: () => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/challenges/${challengeId}/leaderboard`)
      .then((r) => r.json())
      .then((d) => setEntries(d.leaderboard ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [challengeId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${GREEN})` }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: GREEN }} />
              <h3 className="font-bold text-lg" style={{ color: NAVY }}>Leaderboard</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-2xl skeleton" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏁</div>
              <p className="text-gray-400 text-sm">No participants yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((e, i) => (
                <motion.div
                  key={e.rank}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: i === 0 ? "#fffbeb" : i === 1 ? "#f8faff" : i === 2 ? "#fff7ed" : "#f9fafb" }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2f" : "#e5e7eb",
                             color: i < 3 ? "white" : "#6b7280" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : e.rank}
                  </div>
                  <span className="text-xl">{e.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: NAVY }}>{e.display_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${e.pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.06 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${NAVY}, ${GREEN})` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 shrink-0">{e.pct}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{ color: GREEN }}>{e.progress.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400">/ {e.target.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Challenge Card ──────────────────────────────────────────── */
function ChallengeCard({ challenge, index, onLeaderboard }: {
  challenge: Challenge; index: number; onLeaderboard: () => void;
}) {
  const joinedRef = useRef(false);
  const [joinState, setJoinState] = useState<"idle" | "loading" | "joined">("idle");
  const [error, setError] = useState<string | null>(null);
  const [localCount, setLocalCount] = useState(challenge.participant_count);

  const type   = TYPE_CONFIG[challenge.challenge_type]   ?? TYPE_CONFIG.distance;
  const status = STATUS_CONFIG[challenge.status] ?? STATUS_CONFIG.upcoming;
  const fillPct = challenge.max_participants
    ? Math.min(100, Math.round((localCount / challenge.max_participants) * 100))
    : null;
  const spotsLeft = challenge.max_participants ? challenge.max_participants - localCount : null;

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (joinedRef.current || joinState === "loading") return;
    setJoinState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/join`, { method: "POST" });
      if (res.ok || res.status === 409) {
        joinedRef.current = true;
        setJoinState("joined");
        setLocalCount((c) => c + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error?.message ?? "Could not join. Try again.");
        setJoinState("idle");
      }
    } catch {
      setError("Network error. Try again.");
      setJoinState("idle");
    }
  };

  const xpReward = Math.round(challenge.target_value * (challenge.challenge_type === "altitude" ? 0.4 : challenge.challenge_type === "distance" ? 20 : 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Gradient top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${type.gradient}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
              style={{ background: type.bg, border: `1.5px solid ${type.border}` }}>
              {challenge.banner_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: type.bg, color: type.color, border: `1px solid ${type.border}` }}>
                  {type.icon} {type.label}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: status.bg, color: status.textColor }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <h3 className="font-bold text-base leading-snug" style={{ color: NAVY }}>{challenge.title}</h3>
            </div>
          </div>
          {challenge.prize_pool_sol > 0 && (
            <div className="text-right shrink-0 ml-3">
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Prize Pool</p>
              <p className="font-bold text-lg leading-tight" style={{ color: "#f59e0b" }}>
                {challenge.prize_pool_sol} SOL
              </p>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{challenge.description}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-2xl p-2.5 text-center">
            <div className="flex justify-center mb-1"><Target className="w-3.5 h-3.5 text-gray-400" /></div>
            <p className="text-xs font-bold" style={{ color: NAVY }}>{challenge.target_value.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase">{challenge.unit}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-2.5 text-center">
            <div className="flex justify-center mb-1"><Users className="w-3.5 h-3.5 text-gray-400" /></div>
            <p className="text-xs font-bold" style={{ color: NAVY }}>{localCount.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 uppercase">Joined</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-2.5 text-center">
            <div className="flex justify-center mb-1"><Zap className="w-3.5 h-3.5 text-gray-400" /></div>
            <p className="text-xs font-bold" style={{ color: GREEN }}>+{xpReward}</p>
            <p className="text-[9px] text-gray-400 uppercase">XP</p>
          </div>
        </div>

        {/* Capacity bar */}
        {fillPct !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>{spotsLeft !== null && spotsLeft > 0 ? `${spotsLeft} spots left` : spotsLeft === 0 ? "Full" : "Open"}</span>
              <span>{fillPct}% filled</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 1, delay: index * 0.08 }}
                className={`h-full rounded-full bg-gradient-to-r ${type.gradient}`}
              />
            </div>
          </div>
        )}

        {/* Countdown */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Clock className="w-3.5 h-3.5" />
          {challenge.status === "upcoming" ? "Starts " : ""}
          <Countdown endDate={challenge.status === "upcoming" ? challenge.start_date : challenge.end_date} />
        </div>

        {error && <p className="text-xs text-red-500 mb-2 flex items-center gap-1">⚠️ {error}</p>}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={(e) => void handleJoin(e)}
            disabled={joinState === "loading" || joinState === "joined" || challenge.status === "completed"}
            className="flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: joinState === "joined" ? "#ecfdf5" : challenge.status === "completed" ? "#f3f4f6" : `linear-gradient(135deg, ${NAVY}, ${GREEN})`,
              color: joinState === "joined" ? "#059669" : challenge.status === "completed" ? "#9ca3af" : "white",
              border: joinState === "joined" ? "1.5px solid #a7f3d0" : "none",
              boxShadow: joinState === "idle" && challenge.status !== "completed" ? `0 4px 14px ${NAVY}30` : "none",
            }}
          >
            {joinState === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining…
              </span>
            ) : joinState === "joined" ? "✅ Joined!" : challenge.status === "upcoming" ? "Register" : challenge.status === "completed" ? "Ended" : "Join Challenge"}
          </button>
          <button
            onClick={onLeaderboard}
            className="px-3 py-2.5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Board
          </button>
          <Link
            href={`/challenges/${challenge.id}`}
            className="px-3 py-2.5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const FILTERS = [
  { id: "all",        label: "All",        icon: "🏆" },
  { id: "active",     label: "Live",       icon: "🔴" },
  { id: "upcoming",   label: "Upcoming",   icon: "📅" },
  { id: "distance",   label: "Distance",   icon: "🏃" },
  { id: "altitude",   label: "Altitude",   icon: "⛰️" },
  { id: "streak",     label: "Streak",     icon: "🔥" },
  { id: "social",     label: "Social",     icon: "🤝" },
  { id: "speed",      label: "Speed",      icon: "⚡" },
  { id: "collection", label: "Collection", icon: "📍" },
];

export default function ChallengesPage() {
  const [challenges, setChallenges]   = useState<Challenge[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [lbChallenge, setLbChallenge] = useState<string | null>(null);
  const [sortBy, setSortBy]           = useState<"prize" | "participants" | "ending">("prize");

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => setChallenges(d.challenges ?? []))
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = challenges
    .filter((c) => {
      const matchFilter = filter === "all" ? true : filter === "active" ? c.status === "active" : filter === "upcoming" ? c.status === "upcoming" : c.challenge_type === filter;
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "prize")        return b.prize_pool_sol - a.prize_pool_sol;
      if (sortBy === "participants") return b.participant_count - a.participant_count;
      if (sortBy === "ending")       return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      return 0;
    });

  const totalPrize    = challenges.reduce((a, c) => a + (c.prize_pool_sol ?? 0), 0);
  const totalJoined   = challenges.reduce((a, c) => a + c.participant_count, 0);
  const activeChallenges = challenges.filter((c) => c.status === "active").length;

  return (
    <main className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg,#f8faff 0%,#f5f0e8 50%,#f0fff4 100%)" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2d3a5a 60%, ${GREEN} 100%)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 pt-28 pb-12 px-4 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 font-medium mb-5">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Trek Challenges & Tournaments
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Compete & <span className="italic" style={{ color: "#86efac" }}>Win SOL</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md mx-auto mb-8">
              Join monthly tournaments, earn XP, and win real SOL prizes for your trekking achievements.
            </p>
          </motion.div>

          {/* Live stats */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4">
            {[
              { icon: "🏆", value: `${activeChallenges}`, label: "Live Challenges" },
              { icon: "◎",  value: `${totalPrize.toFixed(1)} SOL`, label: "Total Prizes" },
              { icon: "👥", value: totalJoined.toLocaleString(), label: "Participants" },
              { icon: "⚡", value: "Instant", label: "XP Rewards" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/15">
                <span className="text-xl">{s.icon}</span>
                <div className="text-left">
                  <p className="text-white font-bold text-sm leading-none">{s.value}</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── SEARCH + SORT ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges…"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 text-gray-700"
              style={{ "--tw-ring-color": GREEN } as React.CSSProperties}
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 px-3 py-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Sort:</span>
            {([["prize","💰 Prize"],["participants","👥 Popular"],["ending","⏱ Ending Soon"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setSortBy(val)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold transition-all"
                style={{ background: sortBy === val ? NAVY : "transparent", color: sortBy === val ? "white" : "#6b7280" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FILTER PILLS ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.id ? NAVY : "white",
                color: filter === f.id ? "white" : "#374151",
                border: `1.5px solid ${filter === f.id ? NAVY : "#e5e7eb"}`,
                transform: filter === f.id ? "scale(1.05)" : "scale(1)",
              }}>
              <span>{f.icon}</span> {f.label}
              {f.id === "active" && activeChallenges > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{activeChallenges}</span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Award className="w-3.5 h-3.5" />
          <span><strong className="text-gray-600">{filtered.length}</strong> challenges</span>
          {search && <span>· matching <strong style={{ color: GREEN }}>&ldquo;{search}&rdquo;</strong></span>}
        </div>

        {/* ── GRID ──────────────────────────────────────────── */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 rounded-3xl skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-3xl border-2 border-dashed border-gray-200 bg-white/60">
            <div className="text-5xl mb-3">🏁</div>
            <p className="text-gray-500 font-bold text-lg mb-1">No challenges found</p>
            <p className="text-gray-400 text-sm mb-4">Try a different filter or search term</p>
            <button onClick={() => { setFilter("all"); setSearch(""); }}
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${GREEN})` }}>
              Show all challenges
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} index={i} onLeaderboard={() => setLbChallenge(c.id)} />
            ))}
          </div>
        )}

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="mt-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold mb-5 text-center" style={{ color: NAVY, fontFamily: "Georgia, serif" }}>How Challenges Work</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: "1", icon: "🎯", title: "Join a Challenge", desc: "Pick any active challenge and register with one click" },
              { step: "2", icon: "🥾", title: "Trek & Progress", desc: "Complete GPS-verified check-ins to log your progress" },
              { step: "3", icon: "⛓️", title: "On-Chain Proof", desc: "Every milestone is recorded on Solana automatically" },
              { step: "4", icon: "🏆", title: "Win Prizes", desc: "Top finishers receive SOL prizes and XP rewards" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm"
                  style={{ background: `${GREEN}15`, border: `1.5px solid ${GREEN}30` }}>
                  {s.icon}
                </div>
                <p className="text-xs font-bold mb-1" style={{ color: NAVY }}>{s.title}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── LEADERBOARD MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {lbChallenge && (
          <LeaderboardPanel challengeId={lbChallenge} onClose={() => setLbChallenge(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}

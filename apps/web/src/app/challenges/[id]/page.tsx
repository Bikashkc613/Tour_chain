"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Clock, Target, Zap, CheckCircle2, Loader2 } from "lucide-react";

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

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string; description: string }> = {
  distance:   { icon: "🏃", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",     label: "Distance Challenge",   description: "Complete a total distance goal" },
  altitude:   { icon: "⛰️", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", label: "Altitude Challenge",   description: "Reach a target altitude" },
  streak:     { icon: "🔥", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "Streak Challenge",     description: "Maintain a consecutive activity streak" },
  social:     { icon: "🤝", color: "text-green-600",  bg: "bg-green-50 border-green-200",   label: "Social Challenge",     description: "Grow the community through referrals" },
  speed:      { icon: "⚡", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", label: "Speed Challenge",      description: "Complete a route within a time limit" },
  collection: { icon: "📍", color: "text-red-600",    bg: "bg-red-50 border-red-200",       label: "Collection Challenge", description: "Visit unique checkpoints across Nepal" },
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
  return <span className="font-mono">{timeLeft}</span>;
}

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [cRes, lbRes] = await Promise.all([
          fetch(`/api/challenges/${id}`),
          fetch(`/api/challenges/${id}/leaderboard`),
        ]);

        if (cRes.ok) {
          const cData = await cRes.json();
          setChallenge(cData.challenge ?? null);
        }
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(lbData.leaderboard ?? []);
        }
      } catch (err) {
        console.error("Challenge load error:", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch(`/api/challenges/${id}/join`, { method: "POST" });
      const data = await res.json();
      if (res.ok || res.status === 409) {
        setJoined(true);
      } else {
        setJoinError(data.error?.message ?? "Failed to join. Please try again.");
      }
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-28 px-4 max-w-3xl mx-auto space-y-4">
      <div className="h-8 w-32 rounded-xl skeleton" />
      <div className="h-48 rounded-3xl skeleton" />
      <div className="h-64 rounded-3xl skeleton" />
    </div>
  );

  if (!challenge) return (
    <div className="min-h-screen pt-28 px-4 max-w-3xl mx-auto text-center">
      <div className="text-6xl mb-4">🏆</div>
      <p className="text-gray-500 text-lg">Challenge not found.</p>
      <Link href="/challenges" className="mt-4 inline-block text-orange-500 font-semibold hover:underline">← Back to Challenges</Link>
    </div>
  );

  const type = TYPE_CONFIG[challenge.challenge_type] ?? TYPE_CONFIG.distance;
  const fillPct = challenge.max_participants
    ? Math.round((challenge.participant_count / challenge.max_participants) * 100)
    : null;
  const daysTotal = Math.round((new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime()) / 86400000);
  const daysElapsed = Math.max(0, Math.round((Date.now() - new Date(challenge.start_date).getTime()) / 86400000));
  const timeProgress = Math.min(100, Math.round((daysElapsed / daysTotal) * 100));

  return (
    <main className="min-h-screen pb-20 relative" style={{ background: "linear-gradient(160deg,#fafbff 0%,#fff8f2 50%,#f4fff8 100%)" }}>
      <div className="fixed top-[-40px] right-[-40px] w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(224,123,57,0.10),transparent 70%)", animation: "orb-float 20s ease-in-out infinite" }} />

      <div className="relative z-10 pt-28 px-4 max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/challenges" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </Link>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-6xl">{challenge.banner_emoji}</div>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${type.bg} ${type.color}`}>
                    {type.icon} {type.label}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    challenge.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                    challenge.status === "upcoming" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                    "bg-gray-50 text-gray-500 border border-gray-200"
                  }`}>
                    {challenge.status === "active" ? "🟢 Active" : challenge.status === "upcoming" ? "🔵 Upcoming" : "⚫ Ended"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
                  {challenge.title}
                </h1>
              </div>
            </div>
            {challenge.prize_pool_sol > 0 && (
              <div className="text-center shrink-0 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">Prize Pool</p>
                <p className="text-3xl font-bold text-orange-500">{challenge.prize_pool_sol}</p>
                <p className="text-xs text-orange-400 font-semibold">SOL</p>
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{challenge.description}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <Target className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="font-bold text-gray-900">{challenge.target_value.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{challenge.unit}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="font-bold text-gray-900">{challenge.participant_count.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{challenge.max_participants ? `/ ${challenge.max_participants} spots` : "participants"}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="font-bold text-gray-900">{daysTotal}</p>
              <p className="text-xs text-gray-400">total days</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="font-bold text-gray-900"><Countdown endDate={challenge.end_date} /></p>
              <p className="text-xs text-gray-400">remaining</p>
            </div>
          </div>

          {/* Time progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Challenge progress</span>
              <span>{timeProgress}% of time elapsed</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${timeProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
              />
            </div>
          </div>

          {/* Capacity bar */}
          {fillPct !== null && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Spots filled</span>
                <span>{fillPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full ${fillPct >= 90 ? "bg-red-500" : fillPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                />
              </div>
            </div>
          )}

          {/* Join button */}
          {joinError && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-sm">
              {joinError}
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => void handleJoin()}
            disabled={joining || joined || challenge.status === "completed"}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              joined
                ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
                : challenge.status === "completed"
                ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 shadow-xl shadow-orange-500/25"
            }`}
          >
            {joining ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Joining…</>
            ) : joined ? (
              <><CheckCircle2 className="w-5 h-5" /> You&apos;re In! Good luck 🎉</>
            ) : challenge.status === "upcoming" ? (
              <><Trophy className="w-5 h-5" /> Register for Challenge</>
            ) : challenge.status === "completed" ? (
              "Challenge Ended"
            ) : (
              <><Trophy className="w-5 h-5" /> Join Challenge</>
            )}
          </motion.button>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard
          </h2>

          {leaderboard.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🏁</div>
              <p className="text-gray-400">No participants yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-center gap-4 p-3 rounded-2xl ${
                    entry.rank === 1 ? "bg-amber-50 border border-amber-200" :
                    entry.rank === 2 ? "bg-gray-50 border border-gray-200" :
                    entry.rank === 3 ? "bg-orange-50 border border-orange-200" :
                    "bg-gray-50/50 border border-gray-100"
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    entry.rank === 1 ? "bg-amber-400 text-white shadow-lg shadow-amber-400/40" :
                    entry.rank === 2 ? "bg-gray-400 text-white" :
                    entry.rank === 3 ? "bg-orange-600 text-white" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shrink-0">
                    {entry.avatar}
                  </div>

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{entry.display_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${entry.pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.06 }}
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{entry.pct}%</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{entry.progress.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{challenge.unit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

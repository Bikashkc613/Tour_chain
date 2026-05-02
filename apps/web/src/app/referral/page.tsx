"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareCard } from "@/components/ShareCard";
import { generateReferralCode, REFERRAL_REWARDS } from "@/lib/referral";
import { createClient } from "@/lib/supabase/client";

type Referral = {
  id: string;
  referee_name: string;
  joined_at: string;
  xp_awarded: number;
  status: "pending" | "completed";
};

// Demo referrals for display
const DEMO_REFERRALS: Referral[] = [
  { id: "r1", referee_name: "Aarav T.",   joined_at: new Date(Date.now() - 86400000 * 3).toISOString(),  xp_awarded: 500, status: "completed" },
  { id: "r2", referee_name: "Sita G.",    joined_at: new Date(Date.now() - 86400000 * 7).toISOString(),  xp_awarded: 500, status: "completed" },
  { id: "r3", referee_name: "Bikram R.",  joined_at: new Date(Date.now() - 86400000 * 1).toISOString(),  xp_awarded: 0,   status: "pending" },
];

export default function ReferralPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [referrals] = useState<Referral[]>(DEMO_REFERRALS);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    void load();
  }, []);

  useEffect(() => {
    setTotalXp(referrals.filter(r => r.status === "completed").length * REFERRAL_REWARDS.referrer_xp);
  }, [referrals]);

  const referralCode = userId ? generateReferralCode(userId) : "TCN001";
  const completedCount = referrals.filter(r => r.status === "completed").length;

  return (
    <main className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg,#fafbff 0%,#f5f0ff 50%,#fff8f2 100%)" }}>
      <div className="pt-28 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 text-sm text-indigo-600 font-medium mb-4">
            🎁 Referral Program
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Invite & <span className="text-indigo-600">Earn</span>
          </h1>
          <p className="text-gray-500 max-w-sm mx-auto">
            Refer friends to TourChain. Earn XP and discounts for every successful referral.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">{referrals.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total Referrals</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-emerald-600">{completedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-orange-500">+{totalXp}</p>
            <p className="text-xs text-gray-400 mt-1">XP Earned</p>
          </div>
        </div>

        {/* Share card */}
        <div className="mb-8">
          <ShareCard mode="referral" userId={userId ?? "demo-user-id"} />
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
          <p className="font-bold text-gray-900 mb-4">How it works</p>
          <div className="space-y-3">
            {[
              { step: "1", text: "Share your unique referral code or link", icon: "🔗" },
              { step: "2", text: "Friend signs up using your code",          icon: "👤" },
              { step: "3", text: "They get 5% off their first trek",         icon: "🎟️" },
              { step: "4", text: "You earn +500 XP and 10% off your next booking", icon: "🏆" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral history */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-bold text-gray-900 mb-4">Referral History</p>
          {referrals.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No referrals yet. Share your code to get started!</p>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                      {r.referee_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.referee_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {r.status === "completed" ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        +{r.xp_awarded} XP
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/leaderboard" className="text-indigo-600 text-sm font-semibold hover:underline">
            View Leaderboard →
          </Link>
        </div>
      </div>
    </main>
  );
}

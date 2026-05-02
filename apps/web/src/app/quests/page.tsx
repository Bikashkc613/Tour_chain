"use client";

import { useState } from "react";
import Link from "next/link";
import { QUESTS, DIFFICULTY_CONFIG, CATEGORY_CONFIG, type Quest } from "@/lib/quests";
import { ChevronDown, ChevronUp, Star, Zap } from "lucide-react";

// Simulate some progress (in production this comes from DB)
const MOCK_PROGRESS: Record<string, number> = {
  "q-sunrise-hunter":   1,
  "q-culture-keeper":   2,
  "q-social-trekker":   0,
  "q-altitude-ace":     0,
  "q-legendary-circuit": 0,
  "q-explorer":         1,
};

function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [claimedSteps, setClaimedSteps] = useState<Set<string>>(new Set());
  const progress = MOCK_PROGRESS[quest.id] ?? 0;
  const pct = Math.round((progress / quest.steps.length) * 100);
  const diff = DIFFICULTY_CONFIG[quest.difficulty];
  const cat = CATEGORY_CONFIG[quest.category];
  const isComplete = progress >= quest.steps.length;

  return (
    <div
      className="rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        background: isComplete ? "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.05))" : "rgba(255,255,255,0.9)",
        borderColor: isComplete ? "rgba(16,185,129,0.3)" : "rgba(0,0,0,0.07)",
        boxShadow: isComplete ? "0 4px 20px rgba(16,185,129,0.1)" : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <button
        className="w-full text-left p-5"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-4">
          {/* Badge */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${isComplete ? "bg-emerald-100" : "bg-gray-50"} border ${isComplete ? "border-emerald-200" : "border-gray-100"}`}>
            {quest.badge}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{quest.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm font-bold text-orange-500">{quest.total_xp} XP</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-2 line-clamp-1">{quest.description}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.border} ${diff.color}`}>
                {diff.label}
              </span>
              <span className="text-xs text-gray-400">{cat.icon} {cat.label}</span>
              {quest.region && <span className="text-xs text-gray-400">📍 {quest.region}</span>}
              {quest.time_limit_days && <span className="text-xs text-amber-600">⏱ {quest.time_limit_days} days</span>}
            </div>
          </div>

          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{progress}/{quest.steps.length} steps</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: isComplete
                  ? "linear-gradient(90deg,#10b981,#059669)"
                  : "linear-gradient(90deg,#f97316,#fbbf24)",
              }}
            />
          </div>
        </div>
      </button>

      {/* Expanded steps */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-3">
          <p className="text-sm text-gray-600 mb-3">{quest.description}</p>

          {quest.steps.map((step, i) => {
            const done = i < progress || claimedSteps.has(step.id);
            const isNext = i === progress && !isComplete;
            return (
              <div
                key={step.id}
                className={`rounded-xl border p-3 flex items-start gap-3 transition-all ${
                  done ? "bg-emerald-50 border-emerald-200" : isNext ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  done ? "bg-emerald-500 text-white" : isNext ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {done ? "✓" : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${done ? "text-emerald-700" : "text-gray-800"}`}>{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  {step.hint && <p className="text-xs text-amber-600 mt-1 italic">💡 {step.hint}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Zap className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-500">+{step.xp}</span>
                </div>
                {isNext && step.type === "photo" && (
                  <button
                    onClick={() => setClaimedSteps((s) => new Set([...s, step.id]))}
                    className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Upload
                  </button>
                )}
              </div>
            );
          })}

          {isComplete && (
            <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{quest.badge}</p>
              <p className="font-bold text-emerald-800">Quest Complete!</p>
              <p className="text-emerald-600 text-xs">You earned the <strong>{quest.badge_name}</strong> badge</p>
            </div>
          )}

          {!isComplete && (
            <Link
              href="/explore"
              className="block text-center bg-orange-500 hover:bg-orange-400 text-white font-bold py-2.5 rounded-xl transition-all text-sm"
            >
              Start Trekking →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuestsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "complete">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", ...Array.from(new Set(QUESTS.map((q) => q.category)))];

  const filtered = QUESTS.filter((q) => {
    const progress = MOCK_PROGRESS[q.id] ?? 0;
    const complete = progress >= q.steps.length;
    if (filter === "active" && (complete || progress === 0)) return false;
    if (filter === "complete" && !complete) return false;
    if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
    return true;
  });

  const totalXpAvailable = QUESTS.reduce((a, q) => a + q.total_xp, 0);
  const completedQuests = QUESTS.filter((q) => (MOCK_PROGRESS[q.id] ?? 0) >= q.steps.length).length;

  return (
    <main className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg,#fafbff 0%,#fff8f2 50%,#f4fff8 100%)" }}>
      <div className="pt-28 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-sm text-orange-600 font-medium mb-4">
            <Star className="w-4 h-4" /> Quest System
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
            🎯 Quests
          </h1>
          <p className="text-gray-500">Complete multi-step challenges to earn XP, badges, and rewards</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-orange-500">{completedQuests}</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{QUESTS.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total Quests</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">{totalXpAvailable.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">XP Available</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["all", "active", "complete"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                filter === f
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {f === "all" ? "All" : f === "active" ? "🔥 In Progress" : "✅ Complete"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => {
            const cat = c !== "all" ? CATEGORY_CONFIG[c as keyof typeof CATEGORY_CONFIG] : null;
            return (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${
                  categoryFilter === c
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
                }`}
              >
                {cat ? `${cat.icon} ${cat.label}` : "All Categories"}
              </button>
            );
          })}
        </div>

        {/* Quest list */}
        <div className="space-y-4">
          {filtered.map((quest, i) => (
            <QuestCard key={quest.id} quest={quest} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🎯</div>
              <p>No quests match this filter.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

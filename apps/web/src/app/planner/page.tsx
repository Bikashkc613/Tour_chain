"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Clock, TrendingUp, ChevronRight, Loader2, Mountain, Send, Star } from "lucide-react";

type Recommendation = {
  rank: number;
  name: string;
  region: string;
  difficulty: string;
  duration_days: number;
  price_usd: number;
  altitude_m: number;
  match_score: number;
  pros: string[];
  cons: string[];
  why: string;
  route_id: string;
  image_url: string;
};

type PlannerResponse = {
  summary: string;
  recommendations: Recommendation[];
  tips: string[];
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
  moderate: "text-amber-600 bg-amber-50 border-amber-200",
  challenging: "text-orange-600 bg-orange-50 border-orange-200",
  extreme: "text-red-600 bg-red-50 border-red-200",
};

const EXAMPLE_PROMPTS = [
  "What are the best places to visit in Butwal?",
  "I have 7 days for trekking, beginner level, budget $500",
  "Show me cultural and religious sites in Kathmandu",
  "Best viewpoints and nature spots near Pokhara",
  "Family-friendly activities in Chitwan",
  "Experienced trekker, 14 days, want to reach 5000m+",
];

export default function PlannerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = async (prompt?: string) => {
    const query = prompt ?? input;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelected(null);
    if (prompt) setInput(prompt);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle error response with nested error object
        const errorMessage = data.error?.message || data.error || "Failed to get recommendations";
        setError(errorMessage);
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-violet-400 to-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 pt-32 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-5 py-2.5 text-sm font-semibold mb-6 shadow-lg shadow-indigo-500/30 animate-bounce-slow">
            <Sparkles className="w-4 h-4" />
            AI-Powered Travel & Trek Recommendations
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            🤖 AI Trip Planner
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-6">
            Discover Nepal with AI. Ask about treks, cities, attractions, or experiences — 
            get personalized recommendations based on current trends, social media insights, and local knowledge.
          </p>
          <Link
            href="/planner/comprehensive"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Try Comprehensive Trip Planner (with Guides & Full Itinerary)
          </Link>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 mb-8 border border-indigo-100">
          <label className="block text-slate-700 text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-500" />
            Ask me anything about Nepal
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="e.g. What are the best places to visit in Butwal? / I have 10 days for trekking, moderate fitness / Show me cultural sites in Kathmandu..."
              rows={4}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base transition-all"
            />
            <button
              onClick={() => void handleSubmit()}
              disabled={loading || !input.trim()}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* Example prompts */}
          <div className="mt-6">
            <p className="text-slate-500 text-xs mb-3 uppercase tracking-wider font-semibold">✨ Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => void handleSubmit(p)}
                  className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 hover:border-indigo-300 text-slate-700 px-4 py-2 rounded-full transition-all hover:shadow-md"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-8 text-red-700 text-sm flex items-start gap-3 shadow-lg">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 animate-ping absolute" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center relative">
                  <Mountain className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold text-lg mb-2">Analyzing your query...</p>
                <p className="text-slate-500 text-sm">Finding the best matches for you</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8">
            {/* AI Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 shadow-xl shadow-indigo-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-white text-base leading-relaxed font-medium">{result.summary}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="text-slate-800 font-bold text-2xl mb-6 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                Top {result.recommendations.length} Recommendations
              </h2>
              <div className="space-y-5">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={rec.route_id}
                    onClick={() => setSelected(selected === i ? null : i)}
                    className="cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-white hover:shadow-2xl"
                    style={{
                      borderColor: selected === i ? "#6366f1" : "#e2e8f0",
                      boxShadow: selected === i ? "0 20px 60px rgba(99,102,241,0.15)" : "0 4px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Card header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Rank badge */}
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg"
                            style={{
                              background: i === 0 
                                ? "linear-gradient(135deg,#fbbf24,#f59e0b)" 
                                : i === 1 
                                ? "linear-gradient(135deg,#cbd5e1,#94a3b8)" 
                                : "linear-gradient(135deg,#fb923c,#f97316)",
                            }}
                          >
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-slate-800 font-bold text-xl leading-tight mb-2">{rec.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className="text-slate-600 text-sm flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                                <MapPin className="w-3.5 h-3.5" /> {rec.region}
                              </span>
                              <span className="text-slate-600 text-sm flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                                <Clock className="w-3.5 h-3.5" /> {rec.duration_days} {rec.duration_days === 1 ? "day" : "days"}
                              </span>
                              <span className="text-slate-600 text-sm flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                                <Mountain className="w-3.5 h-3.5" /> {(rec.altitude_m / 1000).toFixed(1)}k m
                              </span>
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${DIFFICULTY_COLOR[rec.difficulty.toLowerCase()] ?? DIFFICULTY_COLOR.moderate}`}
                              >
                                {rec.difficulty}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm italic leading-relaxed">&ldquo;{rec.why}&rdquo;</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-slate-800 font-bold text-2xl mb-1">${rec.price_usd}</div>
                          <div className="flex items-center gap-1.5 justify-end bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 text-sm font-bold">{rec.match_score}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Match bar */}
                      <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${rec.match_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selected === i && (
                      <div className="border-t-2 border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 space-y-5">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm">
                            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</span>
                              Pros
                            </p>
                            <ul className="space-y-2">
                              {rec.pros.map((p) => (
                                <li key={p} className="text-slate-700 text-sm flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold mt-0.5">+</span> 
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm">
                            <p className="text-orange-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">!</span>
                              Considerations
                            </p>
                            <ul className="space-y-2">
                              {rec.cons.map((c) => (
                                <li key={c} className="text-slate-700 text-sm flex items-start gap-2">
                                  <span className="text-orange-500 font-bold mt-0.5">−</span> 
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <Link
                          href={`/book/${rec.route_id}`}
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                <p className="text-amber-800 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Planning Tips
                </p>
                <ul className="space-y-3">
                  {result.tips.map((tip, idx) => (
                    <li key={tip} className="text-slate-700 text-sm flex items-start gap-3 leading-relaxed">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

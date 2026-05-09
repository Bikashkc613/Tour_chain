"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, MapPin, Clock, DollarSign, Users, Shield, 
  Loader2, Send, Calendar, AlertTriangle, Backpack,
  Phone, CheckCircle, Star, Award, TrendingUp
} from "lucide-react";

type Route = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration_days: number;
  max_altitude_m: number;
  price_usd: number;
};

type Guide = {
  id: string;
  name: string;
  rating: number;
  total_reviews: number;
  specialties: string[];
  price_per_day: number;
  verified: boolean;
  experience_years: number;
};

type Place = {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  verified: boolean;
};

type DayItinerary = {
  day: number;
  title: string;
  activities: string[];
  places: string[];
  meals: string;
  accommodation: string;
  notes: string;
};

type CostBreakdown = {
  guide_cost: number;
  accommodation: number;
  meals: number;
  permits: number;
  transport: number;
  total: number;
};

type BookingInfo = {
  best_season: string;
  advance_booking_days: number;
  required_permits: string[];
  fitness_level: string;
  group_size_recommendation: string;
};

type ComprehensivePlan = {
  summary: string;
  recommended_route: Route | null;
  recommended_guides: Guide[];
  recommended_places: Place[];
  detailed_itinerary: DayItinerary[];
  total_cost_breakdown: CostBreakdown;
  booking_info: BookingInfo;
  safety_tips: string[];
  packing_list: string[];
  emergency_contacts: string[];
};

export default function ComprehensivePlannerPage() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComprehensivePlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/planner/comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          budget: budget ? parseInt(budget) : undefined,
          duration_days: duration ? parseInt(duration) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMessage = data.error?.message || data.error || "Failed to generate plan";
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 pt-32 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-5 py-2.5 text-sm font-semibold mb-6 shadow-lg">
            <Sparkles className="w-4 h-4" />
            Complete AI Trip Planning with Verified Guides & Places
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            🗺️ Comprehensive Trip Planner
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Get a complete trip plan with verified guides, curated places, detailed itinerary, cost breakdown, and booking information — all powered by AI.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-indigo-100">
          <div className="space-y-6">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-3">
                Describe Your Dream Trip
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. I want to trek to Everest Base Camp with my family, we love photography and cultural experiences..."
                rows={4}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  Budget (USD) - Optional
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  Duration (Days) - Optional
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Your Complete Trip Plan...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate Complete Trip Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-8 text-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
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
                  <Sparkles className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold text-lg mb-2">Creating your comprehensive trip plan...</p>
                <p className="text-slate-500 text-sm">Selecting best guides, places, and creating detailed itinerary</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 shadow-xl text-white">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Your Complete Trip Plan
              </h2>
              <p className="text-lg leading-relaxed">{result.summary}</p>
            </div>

            {/* Route */}
            {result.recommended_route && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  Recommended Route
                </h3>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold text-indigo-600">{result.recommended_route.name}</h4>
                  <p className="text-slate-600">{result.recommended_route.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {result.recommended_route.duration_days} days
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                      Difficulty: {result.recommended_route.difficulty}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                      Max Altitude: {result.recommended_route.max_altitude_m}m
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      ${result.recommended_route.price_usd}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Guides */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Recommended Verified Guides
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {result.recommended_guides.map((guide, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-800">{guide.name}</h4>
                      <Shield className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{guide.rating}</span>
                      <span className="text-sm text-slate-500">({guide.total_reviews} reviews)</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{guide.experience_years}+ years experience</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {guide.specialties.slice(0, 2).map((s: string, j: number) => (
                        <span key={j} className="text-xs bg-white px-2 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-indigo-600">${guide.price_per_day}/day</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Total Cost Breakdown
              </h3>
              <div className="space-y-2">
                {Object.entries(result.total_cost_breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className={`font-bold ${key === "total" ? "text-2xl text-green-600" : "text-slate-800"}`}>
                      ${typeof value === 'number' ? value : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Itinerary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Detailed Day-by-Day Itinerary
              </h3>
              <div className="space-y-4">
                {result.detailed_itinerary.map((day, i) => (
                  <div key={i} className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <h4 className="font-bold text-lg text-indigo-600 mb-2">Day {day.day}: {day.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Activities:</span> {day.activities.join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold">Places:</span> {day.places.join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold">Meals:</span> {day.meals}
                      </div>
                      <div>
                        <span className="font-semibold">Accommodation:</span> {day.accommodation}
                      </div>
                      {day.notes && (
                        <div className="text-slate-600 italic">
                          💡 {day.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Info, Safety, Packing */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Booking Info
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Best Season:</strong> {result.booking_info.best_season}</p>
                  <p><strong>Book Ahead:</strong> {result.booking_info.advance_booking_days} days</p>
                  <p><strong>Fitness Level:</strong> {result.booking_info.fitness_level}</p>
                  <p><strong>Group Size:</strong> {result.booking_info.group_size_recommendation}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Safety Tips
                </h3>
                <ul className="space-y-1 text-sm">
                  {result.safety_tips.slice(0, 5).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Backpack className="w-5 h-5 text-purple-500" />
                  Packing List
                </h3>
                <ul className="space-y-1 text-sm">
                  {result.packing_list.slice(0, 5).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {result.emergency_contacts.map((contact, i) => (
                  <div key={i} className="text-red-700">{contact}</div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Ready to Book Your Adventure?</h3>
              <p className="mb-6">Your complete trip plan is ready. Book now with verified guides and secure your dates!</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                <TrendingUp className="w-5 h-5" />
                Browse & Book Routes
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

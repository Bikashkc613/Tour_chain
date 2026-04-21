"use client";

import { motion } from "framer-motion";
import { 
  Award, 
  MapPin, 
  ArrowUpRight, 
  Compass, 
  Wallet,
  Clock,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const initialStats = [
  { id: 'altitude', label: "Altitude Gained", value: 12450, suffix: 'm', icon: ArrowUpRight, color: "text-trekker-orange" },
  { id: 'distance', label: "Distance Trekked", value: 142, suffix: 'km', icon: MapPin, color: "text-forest-green" },
  { id: 'balance', label: "$TREK Balance", value: 2450, suffix: '', icon: Wallet, color: "text-himalayan-blue" },
  { id: 'expeditions', label: "Expeditions", value: 4, suffix: '', icon: Compass, color: "text-prayer-red" },
];

const nfts = [
  {
    id: "ebc-01",
    name: "Everest Summit Badge",
    date: "May 2025",
    altitude: 8848,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "abc-01",
    name: "Thorong La Pass",
    date: "Oct 2024",
    altitude: 5416,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function TouristDashboard() {
  const [stats, setStats] = useState(initialStats);
  const [stakedAmount, setStakedAmount] = useState(1000);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showRewardToast, setShowRewardToast] = useState(false);

  const getAiPlan = async () => {
    setLoadingAi(true);
    setAiRecommendation(null);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nfts, trekBalance: stats.find(s => s.id === 'balance')?.value }),
      });
      const data = await res.json();
      setAiRecommendation(data);
    } catch (e) {
      alert("Failed to connect to Summit AI. Using heuristic backup.");
      setAiRecommendation({
        recommendation: "Gosaikunda Lake Trek",
        reasoning: "A holy serene trek perfect for your current experience level.",
        difficulty: "Moderate"
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleClaimReward = () => {
    setShowRewardToast(true);
    setStats(prev => prev.map(s => s.id === 'balance' ? { ...s, value: s.value + 50 } : s));
    setTimeout(() => setShowRewardToast(false), 3000);
  };

  const handleStakeMore = () => {
    const amount = prompt("Enter $TREK amount to stake:", "100");
    if (amount && !isNaN(parseInt(amount))) {
      setStakedAmount(prev => prev + parseInt(amount));
      setStats(prev => prev.map(s => s.id === 'balance' ? { ...s, value: s.value - parseInt(amount) } : s));
      alert(`Successfully staked ${amount} $TREK! Your voting power and discounts have increased.`);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Reward Toast */}
      {showRewardToast && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-forest-green text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" /> +50 $TREK Claimed!
        </motion.div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-himalayan-blue/40 mb-2">Member Dashboard</h2>
          <h1 className="text-5xl font-playfair text-himalayan-blue">Namaste, <span className="italic underline decoration-trekker-orange decoration-4 underline-offset-8">Trekker</span></h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleClaimReward}
            className="px-6 py-3 bg-white border border-himalayan-blue/10 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Award className="w-5 h-5 text-prayer-yellow" />
            Claim Rewards
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 bg-white"
          >
            <div className={`w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-himalayan-blue/40 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-playfair font-bold text-himalayan-blue">
              {stat.value.toLocaleString()}{stat.suffix}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Active Bookings (Static for now) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-playfair">Active Bookings</h3>
              <button className="text-trekker-orange text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="glass-card p-6 bg-white border-l-4 border-l-trekker-orange flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-trekker-orange/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-trekker-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-himalayan-blue">Annapurna Circuit</h4>
                  <p className="text-sm text-himalayan-blue/40">Highland Adventures • Oct 12 - Oct 26</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs text-himalayan-blue/40 uppercase font-bold tracking-widest">Amount Locked</p>
                  <p className="font-bold text-himalayan-blue">950 USDC</p>
                </div>
                <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                  Confirmed
                </span>
              </div>
            </div>
          </section>

          {/* NFT Gallery */}
          <section>
            <h3 className="text-2xl font-playfair mb-6">Experience Artifacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className="group glass-card overflow-hidden bg-white hover:shadow-2xl transition-all cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <Image src={nft.image} alt={nft.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-himalayan-blue/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white font-bold text-xl drop-shadow-md">{nft.name}</p>
                      <p className="text-white/70 text-sm">{nft.altitude}m • {nft.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Staking Panel */}
          <div className="glass-card p-8 bg-himalayan-blue text-summit-white">
            <h3 className="text-xl font-playfair mb-2">Stake $TREK</h3>
            <p className="text-summit-white/60 text-sm mb-6 font-dm-sans">
              Stake your loyalty tokens to unlock premium routes and operator discounts.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm text-summit-white/40 uppercase tracking-widest font-bold">Staked Amount</span>
                <span className="text-2xl font-bold">{stakedAmount.toLocaleString()} $TREK</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-trekker-orange h-full transition-all duration-500" 
                  style={{ width: `${Math.min(stakedAmount / 50, 100)}%` }} 
                />
              </div>
              <button 
                onClick={handleStakeMore}
                className="w-full py-4 bg-trekker-orange text-white rounded-xl font-bold hover:bg-trekker-orange/90 transition-all active:scale-95"
              >
                Stake More
              </button>
            </div>
          </div>

          {/* AI Helper */}
          <div className="glass-card p-8 bg-zinc-50 border-dashed border-2 border-himalayan-blue/10">
            <h3 className="text-xl font-playfair mb-4 flex items-center justify-between">
              Summit AI
              {loadingAi && <div className="w-4 h-4 border-2 border-trekker-orange border-t-transparent rounded-full animate-spin" />}
            </h3>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-himalayan-blue/5 mb-4 min-h-[100px] flex items-center justify-center text-center">
              {loadingAi ? (
                <p className="text-xs text-himalayan-blue/40 animate-pulse">Consulting Himalayan charts...</p>
              ) : aiRecommendation ? (
                <div className="space-y-3 text-left w-full">
                  <p className="text-[10px] text-himalayan-blue/40 font-bold uppercase tracking-widest leading-none">Next Odyssey</p>
                  <p className="text-sm font-bold text-trekker-orange">{aiRecommendation.recommendation}</p>
                  <p className="text-xs text-himalayan-blue/70 italic leading-relaxed">"{aiRecommendation.reasoning}"</p>
                </div>
              ) : (
                <p className="text-sm text-himalayan-blue/70 italic leading-relaxed">
                  "I'm ready to design your next trek. Click below to begin."
                </p>
              )}
            </div>
            
            <button 
              onClick={getAiPlan}
              disabled={loadingAi}
              className="text-trekker-orange text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all disabled:opacity-50"
            >
              {aiRecommendation ? "Regenerate Plan" : "Plan My Next Trip"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

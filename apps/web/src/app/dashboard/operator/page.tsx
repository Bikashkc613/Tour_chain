"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Ticket, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const pipeline = [
  { status: "Pending", items: [
    { id: "B-102", user: "Alice Walker", trip: "EBC Trek", amount: "1,200 USDC", date: "May 12" }
  ]},
  { status: "Confirmed", items: [
    { id: "B-098", user: "John Doe", trip: "Annapurna", amount: "950 USDC", date: "May 15" }
  ]},
  { status: "In Progress", items: [
    { id: "B-095", user: "Sam Smith", trip: "Manaslu", amount: "2,400 USDC", date: "Currently trekking" }
  ]},
  { status: "Completed", items: [
    { id: "B-088", user: "Emma Frost", trip: "Langtang", amount: "600 USDC", date: "Completed Apr 20" }
  ]}
];

const stats = [
  { label: "Monthly Earnings", value: "$14,250", change: "+12%", icon: DollarSign, color: "text-forest-green" },
  { label: "$TREK Earned", value: "8,900", change: "+5.4%", icon: TrendingUp, color: "text-himalayan-blue" },
  { label: "Trust Score", value: "4.9/5", change: "Staked: 124 SOL", icon: Users, color: "text-trekker-orange" },
  { label: "DeFi Yield", value: "$452.10", change: "Kamino Vault", icon: TrendingUp, color: "text-prayer-yellow" },
];

export default function OperatorDashboard() {
  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-himalayan-blue/40 mb-2">Agency Control Center</h2>
          <h1 className="text-5xl font-playfair text-himalayan-blue">Highland <span className="italic underline decoration-trekker-orange decoration-4 underline-offset-8">Adventures</span></h1>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-himalayan-blue text-summit-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all">
            <Ticket className="w-5 h-5 text-trekker-orange" />
            Mint Slot NFTs
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 bg-white"
          >
            <div className={`w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-himalayan-blue/40 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-playfair font-bold text-himalayan-blue">{stat.value}</p>
              <span className="text-[10px] font-bold text-forest-green">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {pipeline.map((column, colIdx) => (
          <div key={column.status} className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-himalayan-blue/40 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                column.status === "Pending" ? "bg-trekker-orange" : 
                column.status === "Confirmed" ? "bg-himalayan-blue" :
                column.status === "In Progress" ? "bg-prayer-yellow" : "bg-forest-green"
              }`} />
              {column.status}
            </h3>
            
            <div className="space-y-4">
              {column.items.map((item, itemIdx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (colIdx * 4 + itemIdx) * 0.05 }}
                  className="glass-card p-5 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border-himalayan-blue/5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-himalayan-blue/30 tracking-widest">{item.id}</span>
                    <button className="text-himalayan-blue/20 hover:text-himalayan-blue/40 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-himalayan-blue leading-tight mb-1">{item.user}</h4>
                  <p className="text-xs text-himalayan-blue/40 mb-4">{item.trip}</p>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-himalayan-blue">{item.amount}</span>
                    <span className="text-himalayan-blue/40">{item.date}</span>
                  </div>
                </motion.div>
              ))}
              
              {column.items.length === 0 && (
                <div className="py-12 text-center text-himalayan-blue/20 font-medium text-sm italic">
                  Empty column
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
        {/* Slot NFT Management */}
        <section className="glass-card p-10 bg-himalayan-blue text-summit-white">
          <h3 className="text-2xl font-playfair mb-2 italic">Pre-sale Liquidity</h3>
          <p className="text-summit-white/60 text-sm mb-8 max-w-md">
            Bootstrap your season by pre-selling booking slots as tradeable NFTs. 
            Get working capital today; tourists get a secured spot.
          </p>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Active Slots</p>
                <p className="text-2xl font-bold italic">14 / 20</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Secondary Vol</p>
                <p className="text-2xl font-bold italic">420 SOL</p>
              </div>
            </div>
            <button className="w-full py-4 bg-trekker-orange text-white rounded-xl font-bold hover:bg-trekker-orange/90 transition-all">
              Manage Slot Registry
            </button>
          </div>
        </section>

        {/* Reputation Alerts */}
        <section className="glass-card p-10 bg-white">
          <h3 className="text-2xl font-playfair mb-6">Reputation Feed</h3>
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-zinc-50 rounded-2xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-himalayan-blue italic">Verification Success</p>
                <p className="text-xs text-himalayan-blue/60 leading-relaxed">
                  Everest Base Camp trek for Emma Frost (B-088) verified via GPS. 100 Reputation points added.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-zinc-50 rounded-2xl">
              <div className="w-10 h-10 bg-prayer-yellow/10 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-prayer-yellow" />
              </div>
              <div>
                <p className="text-sm font-bold text-himalayan-blue italic">Upcoming Dispute Deadline</p>
                <p className="text-xs text-himalayan-blue/60 leading-relaxed">
                  Booking B-095 (Sam Smith) ends in 48 hours. Ensure the client completes on-chain check-in.
                </p>
              </div>
            </div>
            <button className="text-himalayan-blue text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All Insights <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

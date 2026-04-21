"use client";

import { motion } from "framer-motion";
import { 
  Vote, 
  Users, 
  History, 
  AlertTriangle, 
  PlusCircle, 
  TrendingUp,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const proposals = [
  {
    id: 1,
    title: "Suspend Operator 'Everest Express' for 3 Verified Fraud Reports",
    category: "Security",
    proposer: "0x1234...5678",
    status: "Active",
    votesFor: 125000,
    votesAgainst: 12000,
    deadline: "2 days left",
  },
  {
    id: 2,
    title: "Allocate 50,000 $TREK from Treasury for Annapurna Clean-up Initiative",
    category: "Sustainability",
    proposer: "0x8765...4321",
    status: "Active",
    votesFor: 85000,
    votesAgainst: 45000,
    deadline: "5 days left",
  },
  {
    id: 3,
    title: "Increase Operator Stake Requirement to 250 SOL for 'Peak' Status",
    category: "Governance",
    proposer: "0x4321...8765",
    status: "Executed",
    votesFor: 300000,
    votesAgainst: 50000,
    deadline: "Completed",
  }
];

export default function DAODashboard() {
  const [activeTab, setActiveTab] = useState("proposals");

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="px-3 py-1 bg-himalayan-blue text-summit-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              Protocol Governance
            </span>
          </motion.div>
          <h1 className="text-5xl font-playfair text-himalayan-blue">Nepal <span className="italic">Trust Layer</span> DAO</h1>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 bg-himalayan-blue text-white rounded-2xl font-bold hover:bg-himalayan-blue/90 transition-all shadow-xl shadow-himalayan-blue/20">
          <PlusCircle className="w-5 h-5" />
          Create Proposal
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Users, label: "Total Members", value: "12,450", trend: "+12%" },
          { icon: TrendingUp, label: "$TREK Burnt", value: "850,000", trend: "0.2% total" },
          { icon: ShieldAlert, label: "Active Disputes", value: "24", trend: "Resolving" },
          { icon: Vote, label: "Staked Voting Power", value: "4.2M TREK", trend: "Active" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 bg-white"
          >
            <stat.icon className="w-8 h-8 text-himalayan-blue/20 mb-4" />
            <p className="text-xs text-himalayan-blue/40 uppercase font-bold tracking-widest leading-none mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-himalayan-blue">{stat.value}</p>
            <p className="text-[10px] text-forest-green font-bold mt-2">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Governance Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-himalayan-blue/5 mb-8 overflow-x-auto pb-2">
            {["proposals", "members", "treasury", "history"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 transition-all ${
                  activeTab === tab ? "text-himalayan-blue border-b-2 border-trekker-orange" : "text-himalayan-blue/20"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {proposals.map((proposal, idx) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-8 bg-white hover:border-himalayan-blue/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter mb-2 inline-block ${
                      proposal.status === "Active" ? "bg-forest-green/10 text-forest-green" : "bg-himalayan-blue/10 text-himalayan-blue"
                    }`}>
                      {proposal.status}
                    </span>
                    <h3 className="text-xl font-playfair group-hover:text-trekker-orange transition-colors">
                      {proposal.title}
                    </h3>
                  </div>
                  {proposal.status === "Active" && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-prayer-red uppercase tracking-widest mb-1">{proposal.deadline}</p>
                      <AlertTriangle className="w-5 h-5 text-prayer-red ml-auto" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-forest-green">For: {proposal.votesFor.toLocaleString()} TREK</span>
                    <span className="text-prayer-red">Against: {proposal.votesAgainst.toLocaleString()} TREK</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-forest-green h-full" 
                      style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }} 
                    />
                    <div 
                      className="bg-prayer-red h-full" 
                      style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-himalayan-blue/40 font-bold uppercase tracking-widest">
                  <p>Proposed by: {proposal.proposer}</p>
                  <div className="flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: Personal Governance Stats */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <div className="glass-card p-8 bg-himalayan-blue text-white shadow-2xl shadow-himalayan-blue/20">
              <h3 className="text-xl font-playfair mb-6">Your Voting Power</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mb-1">Available TREK</p>
                  <p className="text-3xl font-bold">1,250.00</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mb-1">Staked (Multiplier 2.5x)</p>
                  <p className="text-3xl font-bold text-trekker-orange">5,000.00</p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between text-xs mb-4">
                    <span className="opacity-40">Proposals Voted</span>
                    <span className="font-bold">12 / 12</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-40">Participation Rate</span>
                    <span className="font-bold text-forest-green">100%</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-white text-himalayan-blue rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
                  <Users className="w-4 h-4" /> Delegate Power
                </button>
              </div>
            </div>

            <div className="glass-card p-6 bg-zinc-50 border border-himalayan-blue/5">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-himalayan-blue/40" /> Recent Actions
              </h4>
              <div className="space-y-4 text-xs">
                {[
                  "You voted YES on Proposal #124",
                  "Treasure payout of 5,000 TREK executed",
                  "Operator #98 verified by GPS Consensus",
                ].map((action, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-himalayan-blue/5 last:border-0 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-trekker-orange mt-1 shrink-0" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

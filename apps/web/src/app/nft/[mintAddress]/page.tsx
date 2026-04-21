"use client";

import { motion } from "framer-motion";
import { 
  Mountain, 
  MapPin, 
  Calendar, 
  CloudRain, 
  User, 
  Share2,
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function NFTDetailPage() {
  const params = useParams();

  return (
    <div className="pt-24 min-h-screen bg-himalayan-blue overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop" 
          alt="Mountain Background"
          fill
          className="object-cover opacity-20 scale-110 blur-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-himalayan-blue via-transparent to-himalayan-blue" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* NFT card display */}
          <motion.div
            initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="perspective-1000"
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/20 group">
              <Image 
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop" 
                alt="Experience NFT"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-trekker-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Soulbound Artifact
                  </span>
                </div>
                <h2 className="text-4xl font-playfair text-white mb-2 underline decoration-trekker-orange decoration-4">Everest Base Camp</h2>
                <p className="text-white/60 font-dm-sans">Khumbu Region • 5,364m Above Sea Level</p>
              </div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
          </motion.div>

          {/* Metadata details */}
          <div className="space-y-10">
            <header>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-trekker-orange font-bold uppercase tracking-widest text-sm mb-4"
              >
                <Zap className="w-4 h-4" /> Achievement Unlocked
              </motion.div>
              <h1 className="text-6xl font-playfair text-white mb-6">Summit <br /> <span className="italic">Verification</span></h1>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white text-himalayan-blue rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-100 transition-all">
                  <Share2 className="w-5 h-5" /> Share Odyssey
                </button>
                <button className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
                  <ExternalLink className="w-5 h-5" /> Solscan
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Operator</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <User className="w-4 h-4 text-trekker-orange" /> Highland Adventures
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Completion Date</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Calendar className="w-4 h-4 text-trekker-orange" /> May 24, 2025
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Max Altitude</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Mountain className="w-4 h-4 text-trekker-orange" /> 5,364 Metres
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Weather Conditions</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <CloudRain className="w-4 h-4 text-trekker-orange" /> Clear Skies / -12°C
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-white text-sm">
                <ShieldCheck className="w-5 h-5 text-forest-green" /> Verifiable GPS Proof
              </h4>
              <p className="text-white/60 text-xs leading-relaxed font-dm-sans">
                This experience was verified via Groth16 Zero-Knowledge proof. 
                GPS coordinate hash: <code className="bg-white/10 px-2 py-1 rounded text-[10px] text-trekker-orange">0x7d...f2a9</code>. 
                The tourist was physically present within a 50m radius of the 
                Everest Base Camp waypoint at the recorded time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

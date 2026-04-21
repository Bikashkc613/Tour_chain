"use client";

import { motion } from "framer-motion";
import { Camera, MapPin, Heart, Share2, Filter, Compass } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";

const gallery = [
  {
    id: 1,
    user: "SummitSeer",
    location: "Everest North Face",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
    likes: 1240,
    category: "Summit"
  },
  {
    id: 2,
    user: "TrekkerMaya",
    location: "Annapurna Base Camp",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
    likes: 892,
    category: "Nature"
  },
  {
    id: 3,
    user: "Lama_Guide",
    location: "Tyangboche Monastery",
    image: "https://images.unsplash.com/photo-1506012733851-f7975ab44749?q=80&w=1000&auto=format&fit=crop",
    likes: 2100,
    category: "Culture"
  },
  {
    id: 4,
    user: "CloudWalker",
    location: "Machapuchare Peak",
    image: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=1000&auto=format&fit=crop",
    likes: 560,
    category: "Summit"
  },
  {
    id: 5,
    user: "SherpaSpirit",
    location: "Khumbu Icefall",
    image: "https://images.unsplash.com/photo-1548841454-e1d8ede02263?q=80&w=1000&auto=format&fit=crop",
    likes: 3400,
    category: "Adventure"
  },
  {
    id: 6,
    user: "NomadNico",
    location: "Gokyo Ri",
    image: "https://images.unsplash.com/photo-1506119833561-0ae760453837?q=80&w=1000&auto=format&fit=crop",
    likes: 720,
    category: "Summit"
  }
];

export default function VibePage() {
  const [filter, setFilter] = useState("All");

  const filteredGallery = filter === "All" 
    ? gallery 
    : gallery.filter(item => item.category === filter);

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-trekker-orange font-bold uppercase tracking-widest text-sm mb-4"
        >
          <Camera className="w-5 h-5" /> Experience Gallery
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl font-playfair text-himalayan-blue mb-6"
        >
          Himalayan <span className="italic">Vibe</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-himalayan-blue/60 max-w-2xl mx-auto font-dm-sans"
        >
          Real moments, verified on-chain. Explore the visual odyssey of the 
          Tourism Chain Nepal community through lenses that reached the summit.
        </motion.p>
      </header>

      {/* category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {["All", "Summit", "Nature", "Culture", "Adventure"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${
              filter === cat 
                ? "bg-himalayan-blue text-white border-himalayan-blue shadow-lg" 
                : "bg-white text-himalayan-blue/40 border-himalayan-blue/10 hover:border-himalayan-blue/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {filteredGallery.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="break-inside-avoid glass-card group overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-himalayan-blue/5"
          >
            <div className="relative">
              <SafeImage 
                src={item.image} 
                alt={item.location}
                width={600}
                height={800}
                className="w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-prayer-red text-prayer-red" />
                    <span className="font-bold">{item.likes}</span>
                  </div>
                  <Share2 className="w-5 h-5 hover:text-trekker-orange transition-colors" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-himalayan-blue/5 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-trekker-orange" />
                </div>
                <p className="text-xs font-dm-sans font-bold text-himalayan-blue">{item.user}</p>
              </div>
              <h3 className="font-playfair text-xl text-himalayan-blue mb-1">{item.location}</h3>
              <p className="text-[10px] uppercase tracking-widest text-himalayan-blue/40 font-bold">{item.category}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-20 text-center py-12 border-t border-himalayan-blue/5">
        <button className="px-10 py-4 bg-trekker-orange text-white rounded-full font-bold shadow-xl shadow-trekker-orange/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto">
          <Camera className="w-5 h-5" /> Upload My Vibe
        </button>
      </footer>
    </div>
  );
}

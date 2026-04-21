"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, Map as MapIcon, Compass, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import InteractiveMap from "@/components/Map";

const routes = [
  {
    id: "ebc",
    name: "Everest Base Camp",
    region: "Khumbu",
    difficulty: "Challenging",
    elevation: "5,364m",
    rating: 4.9,
    trekEarn: "500 $TREK",
    price: "$1,200",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "abc",
    name: "Annapurna Circuit",
    region: "Annapurna",
    difficulty: "Moderate",
    elevation: "5,416m",
    rating: 4.8,
    trekEarn: "400 $TREK",
    price: "$950",
    image: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    region: "Langtang",
    difficulty: "Easy",
    elevation: "3,870m",
    rating: 4.7,
    trekEarn: "300 $TREK",
    price: "$600",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "manaslu",
    name: "Manaslu Circuit",
    region: "Gorkha",
    difficulty: "Challenging",
    elevation: "5,106m",
    rating: 4.9,
    trekEarn: "600 $TREK",
    price: "$1,100",
    image: "https://images.unsplash.com/photo-1505391910263-12846a899c75?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "mustang",
    name: "Upper Mustang",
    region: "Mustang",
    difficulty: "Moderate",
    elevation: "3,840m",
    rating: 5.0,
    trekEarn: "450 $TREK",
    price: "$1,800",
    image: "https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "gokyo",
    name: "Gokyo Lakes",
    region: "Khumbu",
    difficulty: "Moderate",
    elevation: "5,357m",
    rating: 4.9,
    trekEarn: "480 $TREK",
    price: "$950",
    image: "https://images.unsplash.com/photo-1506119833561-0ae760453837?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "mardi",
    name: "Mardi Himal",
    region: "Annapurna",
    difficulty: "Easy",
    elevation: "4,500m",
    rating: 4.8,
    trekEarn: "250 $TREK",
    price: "$450",
    image: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "poonhill",
    name: "Poon Hill Trek",
    region: "Annapurna",
    difficulty: "Easy",
    elevation: "3,210m",
    rating: 4.8,
    trekEarn: "150 $TREK",
    price: "$350",
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "rara",
    name: "Rara Lake Trek",
    region: "Mugu",
    difficulty: "Moderate",
    elevation: "2,990m",
    rating: 4.9,
    trekEarn: "400 $TREK",
    price: "$800",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "makalu",
    name: "Makalu Base Camp",
    region: "Sankhuwasabha",
    difficulty: "Challenging",
    elevation: "4,870m",
    rating: 4.7,
    trekEarn: "700 $TREK",
    price: "$1,400",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "kanchenjunga",
    name: "Kanchenjunga BC",
    region: "Taplejung",
    difficulty: "Expert",
    elevation: "5,143m",
    rating: 4.8,
    trekEarn: "1000 $TREK",
    price: "$2,200",
    image: "https://images.unsplash.com/photo-1472393365313-2644ff77d70c?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "tilicho",
    name: "Tilicho Lake Trek",
    region: "Manang",
    difficulty: "Challenging",
    elevation: "4,919m",
    rating: 4.9,
    trekEarn: "500 $TREK",
    price: "$950",
    image: "https://images.unsplash.com/photo-1439833543048-dbbd12c1f1ec?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "dolpo",
    name: "Upper Dolpo Trek",
    region: "Dolpa",
    difficulty: "Expert",
    elevation: "5,350m",
    rating: 5.0,
    trekEarn: "1200 $TREK",
    price: "$2,500",
    image: "https://images.unsplash.com/photo-1539252554452-9571f599723a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "gosaikunda",
    name: "Gosainkunda Lake",
    region: "Rasuwa",
    difficulty: "Moderate",
    elevation: "4,380m",
    rating: 4.9,
    trekEarn: "350 $TREK",
    price: "$550",
    image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "pikeypeak",
    name: "Pikey Peak Trek",
    region: "Solukhumbu",
    difficulty: "Easy",
    elevation: "4,065m",
    rating: 4.8,
    trekEarn: "200 $TREK",
    price: "$450",
    image: "https://images.unsplash.com/photo-1516738901171-4991807661b3?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "tsumvalley",
    name: "Tsum Valley Trek",
    region: "Gorkha",
    difficulty: "Moderate",
    elevation: "3,700m",
    rating: 4.9,
    trekEarn: "550 $TREK",
    price: "$1,200",
    image: "https://images.unsplash.com/photo-1521360630-fc2b67f13b56?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "islandpeak",
    name: "Island Peak Climb",
    region: "Khumbu",
    difficulty: "Expert",
    elevation: "6,189m",
    rating: 4.9,
    trekEarn: "1500 $TREK",
    price: "$2,800",
    image: "https://images.unsplash.com/photo-1548841454-e1d8ede02263?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "merapeak",
    name: "Mera Peak Trek",
    region: "Khunbu",
    difficulty: "Expert",
    elevation: "6,476m",
    rating: 4.7,
    trekEarn: "1800 $TREK",
    price: "$3,200",
    image: "https://images.unsplash.com/photo-1543332143-458ad2840d9e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "khopradanda",
    name: "Khopra Danda",
    region: "Annapurna",
    difficulty: "Moderate",
    elevation: "3,660m",
    rating: 4.8,
    trekEarn: "300 $TREK",
    price: "$650",
    image: "https://images.unsplash.com/photo-1528659508753-157771744154?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "helambu",
    name: "Helambu Trek",
    region: "Sindhupalchok",
    difficulty: "Easy",
    elevation: "3,650m",
    rating: 4.6,
    trekEarn: "150 $TREK",
    price: "$400",
    image: "https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=1000&auto=format&fit=crop",
  }
];

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl font-playfair mb-4 text-himalayan-blue"
        >
          Discover Your <span className="italic">Next Route</span>
        </motion.h1>
        <p className="text-himalayan-blue/60 max-w-2xl font-dm-sans">
          Explore the highest trails on Earth. Filter by difficulty, region, or 
          ecosystem rewards and find the perfect operator for your odyssey.
        </p>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-himalayan-blue/40 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search routes, regions, or operators..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-himalayan-blue/10 focus:outline-none focus:ring-2 focus:ring-trekker-orange/20 transition-all font-dm-sans"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl border border-himalayan-blue/10 font-bold text-himalayan-blue hover:bg-zinc-50 transition-colors">
          <Filter className="w-5 h-5" />
          More Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Route List */}
        <div className="lg:col-span-2 space-y-8">
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((route, idx) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card group flex flex-col md:flex-row overflow-hidden hover:shadow-2xl hover:shadow-himalayan-blue/10 transition-all cursor-pointer bg-white"
              >
                <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden">
                  <SafeImage 
                    src={route.image} 
                    alt={route.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 288px"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-himalayan-blue/80 backdrop-blur-md text-summit-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {route.difficulty}
                  </div>
                </div>
                
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-playfair mb-1 group-hover:text-trekker-orange transition-colors">
                        {route.name}
                      </h3>
                      <div className="flex items-center gap-2 text-himalayan-blue/40 text-sm">
                        <Compass className="w-4 h-4" />
                        {route.region} Region • {route.elevation}
                      </div>
                    </div>
                    <div className="text-right text-trekker-orange font-bold text-lg">
                      {route.price}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-prayer-yellow text-prayer-yellow" />
                      <span className="font-bold">{route.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-forest-green">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold uppercase text-xs tracking-tighter">{route.trekEarn} Reward</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      href={`/book/${route.id}`}
                      className="flex-1 py-3 bg-himalayan-blue text-white rounded-xl font-bold hover:bg-himalayan-blue/90 transition-all flex items-center justify-center"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/book/${route.id}`}
                      className="flex-1 py-3 bg-trekker-orange text-white rounded-xl font-bold hover:bg-trekker-orange/90 transition-all flex items-center justify-center"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-himalayan-blue/10">
              <Compass className="w-12 h-12 text-himalayan-blue/10 mx-auto mb-4" />
              <p className="text-himalayan-blue/40 font-bold uppercase tracking-widest">No routes found matching your search</p>
            </div>
          )}
        </div>

        {/* Map Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <InteractiveMap />
          </div>
        </div>
      </div>
    </div>
  );
}

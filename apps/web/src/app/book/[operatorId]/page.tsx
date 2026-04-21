"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Calendar, 
  ChevronRight, 
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Map as MapIcon
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";

const routeData: Record<string, any> = {
  ebc: {
    name: "Everest Base Camp",
    operator: "Khumbu Expeditions",
    description: "The classic odyssey to the foot of the world's highest peak. Safe, verified, and community-driven.",
    price: "1,200",
    reward: "500",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop"
  },
  abc: {
    name: "Annapurna Circuit",
    operator: "Highland Adventures",
    description: "A diverse journey through subtropical forests to high-altitude passes. The most iconic circuit in Nepal.",
    price: "950",
    reward: "400",
    image: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=1000&auto=format&fit=crop"
  },
  langtang: {
    name: "Langtang Valley",
    operator: "Tamang Trails",
    description: "Close to Kathmandu but worlds away. Experience the unique culture and stunning glaciers of Langtang.",
    price: "600",
    reward: "300",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=1000&auto=format&fit=crop"
  },
  manaslu: {
    name: "Manaslu Circuit",
    operator: "Gorkha Treks",
    description: "A challenging high-altitude circuit around Mount Manaslu. Experience pristine nature and ancient culture.",
    price: "1,100",
    reward: "600",
    image: "https://images.unsplash.com/photo-1505391910263-12846a899c75?q=80&w=1000&auto=format&fit=crop"
  },
  mustang: {
    name: "Upper Mustang",
    operator: "Lo Manthang Tours",
    description: "The 'Forbidden Kingdom' of Nepal. Explore red clay cliffs, ancient caves, and unique Tibetan culture.",
    price: "1,800",
    reward: "450",
    image: "https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?q=80&w=1000&auto=format&fit=crop"
  },
  gokyo: {
    name: "Gokyo Lakes",
    operator: "Sagarmatha Guides",
    description: "Alternative to EBC, visit the turquoise lakes of Gokyo and the best viewpoint of Everest from Gokyo Ri.",
    price: "950",
    reward: "480",
    image: "https://images.unsplash.com/photo-1506119833561-0ae760453837?q=80&w=1000&auto=format&fit=crop"
  },
  mardi: {
    name: "Mardi Himal",
    operator: "Annapurna Elite",
    description: "A hidden gem in the Annapurna region. Close-up views of Machapuchare (Fishtail) in a shorter timeframe.",
    price: "450",
    reward: "250",
    image: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=1000&auto=format&fit=crop"
  },
  poonhill: {
    name: "Poon Hill Trek",
    operator: "Annapurna Guides",
    description: "The most popular sunrise trek in Nepal. Witness the Dhaulagiri and Annapurna ranges in golden morning light.",
    price: "350",
    reward: "150",
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=1000&auto=format&fit=crop"
  },
  rara: {
    name: "Rara Lake Trek",
    operator: "Western Wilds",
    description: "Journey to the Queen of Lakes. Explore the remote wilderness of Mugu and the pristine waters of Rara.",
    price: "800",
    reward: "400",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop"
  },
  makalu: {
    name: "Makalu Base Camp",
    operator: "Barun Expeditions",
    description: "A trek to the base of the world's fifth highest mountain. Experience the deep Barun Valley and glaciers.",
    price: "1,400",
    reward: "700",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"
  },
  kanchenjunga: {
    name: "Kanchenjunga BC",
    operator: "Limbu Heritage Tours",
    description: "Base of the third highest peak on Earth. A truly remote journey through diverse landscapes of eastern Nepal.",
    price: "2,200",
    reward: "1000",
    image: "https://images.unsplash.com/photo-1472393365313-2644ff77d70c?q=80&w=1000&auto=format&fit=crop"
  },
  tilicho: {
    name: "Tilicho Lake Trek",
    operator: "Manang Pioneers",
    description: "Visit one of the highest lakes in the world. A side trip from the Annapurna Circuit with high-altitude thrills.",
    price: "950",
    reward: "500",
    image: "https://images.unsplash.com/photo-1439833543048-dbbd12c1f1ec?q=80&w=1000&auto=format&fit=crop"
  },
  dolpo: {
    name: "Upper Dolpo Trek",
    operator: "Nomad Expeditions",
    description: "The ultimate remote Himalayan experience. Explore the ancient culture and stunning landscapes of Dolpa.",
    price: "2,500",
    reward: "1200",
    image: "https://images.unsplash.com/photo-1539252554452-9571f599723a?q=80&w=1000&auto=format&fit=crop"
  },
  gosaikunda: {
    name: "Gosainkunda Lake",
    operator: "Alpine Spirits",
    description: "A holy pilgrimage trek to the sacred alpine lakes. Experience spiritual serene and mountain beauty.",
    price: "550",
    reward: "350",
    image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1000&auto=format&fit=crop"
  },
  pikeypeak: {
    name: "Pikey Peak Trek",
    operator: "Sherpa Heart",
    description: "The best viewpoint of Mount Everest in the lower Khumbu. A shorter trek with incredible perspectives.",
    price: "450",
    reward: "200",
    image: "https://images.unsplash.com/photo-1516738901171-4991807661b3?q=80&w=1000&auto=format&fit=crop"
  },
  tsumvalley: {
    name: "Tsum Valley Trek",
    operator: "Buddhist Trails",
    description: "Explore the 'Hidden Valley of Happiness'. A unique cultural journey into the restricted northern Gorkha.",
    price: "1,200",
    reward: "550",
    image: "https://images.unsplash.com/photo-1521360630-fc2b67f13b56?q=80&w=1000&auto=format&fit=crop"
  },
  islandpeak: {
    name: "Island Peak Climb",
    operator: "Summit Masters",
    description: "A popular first climbing peak in the Everest region. Reach 6,189m with professional support.",
    price: "2,800",
    reward: "1500",
    image: "https://images.unsplash.com/photo-1548841454-e1d8ede02263?q=80&w=1000&auto=format&fit=crop"
  },
  merapeak: {
    name: "Mera Peak Trek",
    operator: "Peak Performers",
    description: "Nepal's highest trekking peak. Experience a high-altitude expedition without technical climbing.",
    price: "3,200",
    reward: "1800",
    image: "https://images.unsplash.com/photo-1543332143-458ad2840d9e?q=80&w=1000&auto=format&fit=crop"
  },
  khopradanda: {
    name: "Khopra Danda",
    operator: "Hidden Annapurna",
    description: "Off-the-beaten-path trek with panoramic views of Dhaulagiri. A community-led lodge experience.",
    price: "650",
    reward: "300",
    image: "https://images.unsplash.com/photo-1528659508753-157771744154?q=80&w=1000&auto=format&fit=crop"
  },
  helambu: {
    name: "Helambu Trek",
    operator: "Valley Viewers",
    description: "The perfect short trek from Kathmandu. Explore Sherpa villages and rhododendron forests.",
    price: "400",
    reward: "150",
    image: "https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=1000&auto=format&fit=crop"
  }
};

export default function BookingPage() {
  const params = useParams();
  const routeId = params.operatorId as string;
  const data = routeData[routeId] || routeData.ebc;

  const [selectedService, setSelectedService] = useState("trek");
  const [trekkingDates, setTrekkingDates] = useState("Oct 12 - Oct 26, 2026");
  const [currentStep, setCurrentStep] = useState(1);
  const [includeSOS, setIncludeSOS] = useState(true);
  const [includeCarbon, setIncludeCarbon] = useState(true);

  const basePrice = selectedService === 'trek' ? parseInt(data.price) : (parseInt(data.price) + 800);
  const carbonPrice = 25;
  const sosPrice = 45;
  const discount = 60;
  
  const totalPrice = basePrice + (includeCarbon ? carbonPrice : 0) + (includeSOS ? sosPrice : 0) - discount;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Operator & Trip Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-himalayan-blue/5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-summit-white bg-zinc-100">
                <SafeImage 
                  src={data.image} 
                  alt={data.operator}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-trekker-orange/10 text-trekker-orange text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Operator
                  </span>
                </div>
                <h1 className="text-4xl font-playfair text-himalayan-blue mb-2">{data.operator}</h1>
                <p className="text-himalayan-blue/60 font-dm-sans max-w-lg mb-4">
                  {data.description}
                </p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <CheckCircle2 key={i} className="w-4 h-4 text-forest-green" />)}
                    <span className="text-sm font-bold ml-1 text-himalayan-blue">4.9/5 Trust Score</span>
                  </div>
                  <div className="text-sm text-himalayan-blue/40 font-medium italic">
                    124 SOL Staked
                  </div>
                </div>
              </div>
            </div>
          </section>

          {currentStep === 1 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-playfair">Step 1: Select Your Odyssey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "trek", name: `Full ${data.name} Package`, duration: "14 Days", price: data.price, earn: data.reward },
                  { id: "summit", name: "Peak Climb Add-on", duration: "+3 Days", price: (parseInt(data.price) + 800).toString(), earn: "250" }
                ].map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all group ${
                      selectedService === service.id 
                      ? "border-trekker-orange bg-trekker-orange/[0.02]" 
                      : "border-himalayan-blue/5 bg-white hover:border-himalayan-blue/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg">{service.name}</h4>
                      {selectedService === service.id && <div className="w-5 h-5 bg-trekker-orange rounded-full shadow-lg shadow-trekker-orange/20" />}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-himalayan-blue/40">
                        Duration: {service.duration} <br/>
                        Reward: <span className="text-forest-green font-bold">{service.earn} $TREK</span>
                      </div>
                      <div className="text-xl font-bold text-himalayan-blue">
                        {service.price} USDC
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {currentStep === 2 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-playfair">Step 2: Add Winning Edge Features</h3>
              <div className="grid grid-cols-1 gap-4">
                <div 
                  onClick={() => setIncludeCarbon(!includeCarbon)}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    includeCarbon ? "border-forest-green bg-forest-green/[0.02]" : "border-himalayan-blue/5 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-forest-green/10 rounded-xl text-forest-green">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Carbon-Neutral Trek</h4>
                      <p className="text-xs text-himalayan-blue/40">Auto-offset your footprint with tokenized credits.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-forest-green">+25 USDC</p>
                    <p className="text-[10px] uppercase font-bold text-himalayan-blue/20">Recommended</p>
                  </div>
                </div>

                <div 
                  onClick={() => setIncludeSOS(!includeSOS)}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    includeSOS ? "border-prayer-red bg-prayer-red/[0.02]" : "border-himalayan-blue/5 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-prayer-red/10 rounded-xl text-prayer-red">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">SOS & Parametric Insurance</h4>
                      <p className="text-xs text-himalayan-blue/40">Instant USDC payout triggered by weather oracles.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-prayer-red">+45 USDC</p>
                    <p className="text-[10px] uppercase font-bold text-himalayan-blue/20">Safety Priority</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {currentStep === 3 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-playfair">Step 3: Protocol Confirmation</h3>
              <div className="bg-himalayan-blue/5 rounded-3xl p-8 border border-himalayan-blue/10">
                <p className="text-sm text-himalayan-blue/70 mb-6">
                  You are about to initiate a multi-program interaction on Solana. Your funds will be routed through the Escrow PDA, with dynamic pricing verified by the Oracle.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-himalayan-blue/5">
                    <p className="text-himalayan-blue/40 mb-1 uppercase tracking-widest font-bold">Escrow Account</p>
                    <p className="font-mono truncate">1111...1111</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-himalayan-blue/5">
                    <p className="text-himalayan-blue/40 mb-1 uppercase tracking-widest font-bold">Carbon Minter</p>
                    <p className="font-mono truncate">Carb...Crdt</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          <section className="bg-himalayan-blue/5 rounded-3xl p-8 border border-himalayan-blue/10">
            <h3 className="text-2xl font-playfair mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-himalayan-blue/40" /> 
              The Escrow Promise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-dm-sans">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 flex-shrink-0 bg-white rounded-lg flex items-center justify-center font-bold text-himalayan-blue shadow-sm italic">1</div>
                  <p className="text-sm text-himalayan-blue/70 leading-relaxed">
                    Your funds are locked in a Solana Program-Derived Account (PDA) upon booking.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 flex-shrink-0 bg-white rounded-lg flex items-center justify-center font-bold text-himalayan-blue shadow-sm italic">2</div>
                  <p className="text-sm text-himalayan-blue/70 leading-relaxed">
                    The operator only receives payment once the trip is verified complete via GPS or the DAO.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 flex-shrink-0 bg-white rounded-lg flex items-center justify-center font-bold text-himalayan-blue shadow-sm italic">3</div>
                  <p className="text-sm text-himalayan-blue/70 leading-relaxed">
                    While locked, your USDC earns yield through Kamino Finance, split between you and the operator.
                  </p>
                </div>
                <button className="text-trekker-orange text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                  Read Smart Contract Policy <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Reservation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <div className="glass-card p-8 bg-white shadow-2xl shadow-himalayan-blue/10 border-himalayan-blue/10">
              <h3 className="text-xl font-playfair mb-6">Reservation Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-himalayan-blue/40">Base Trip</span>
                  <span className="font-bold">{basePrice} USDC</span>
                </div>
                {includeCarbon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-green/70">Carbon Offset</span>
                    <span className="font-bold text-forest-green">+{carbonPrice} USDC</span>
                  </div>
                )}
                {includeSOS && (
                  <div className="flex justify-between text-sm">
                    <span className="text-prayer-red/70">SOS Insurance</span>
                    <span className="font-bold text-prayer-red">+{sosPrice} USDC</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm py-4 border-y border-himalayan-blue/5">
                  <div>
                    <span className="text-himalayan-blue/40">Ecosystem Discount</span>
                    <p className="text-[10px] text-trekker-orange font-bold uppercase tracking-tighter">Stake 500 $TREK</p>
                  </div>
                  <span className="text-forest-green font-bold">- {discount} USDC</span>
                </div>
                <div className="flex justify-between text-2xl font-playfair pt-4">
                  <span>Grand Total</span>
                  <span className="font-bold text-himalayan-blue underline decoration-trekker-orange">
                    {totalPrice} USDC
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-xl flex items-center justify-between border border-himalayan-blue/5 cursor-pointer hover:bg-zinc-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-himalayan-blue/40 group-hover:text-trekker-orange transition-colors" />
                    <div>
                      <p className="text-[10px] text-himalayan-blue/40 uppercase font-bold tracking-widest leading-none">Tour Dates</p>
                      <p className="text-xs font-bold text-himalayan-blue mt-1">{trekkingDates}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-himalayan-blue/20" />
                </div>

                {currentStep < 3 ? (
                  <button 
                    onClick={nextStep}
                    className="w-full py-5 bg-himalayan-blue text-summit-white rounded-2xl font-bold flex items-center justify-center gap-3 group overflow-hidden relative shadow-xl shadow-himalayan-blue/20"
                  >
                    <span className="relative z-10">Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-trekker-orange translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                ) : (
                  <button className="w-full py-5 bg-himalayan-blue text-summit-white rounded-2xl font-bold flex items-center justify-center gap-3 group overflow-hidden relative shadow-xl shadow-himalayan-blue/20">
                    <span className="relative z-10">Confirm & Initiate Escrow</span>
                    <CheckCircle2 className="w-5 h-5 relative z-10" />
                    <div className="absolute inset-0 bg-forest-green translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                )}

                {currentStep > 1 && (
                  <button 
                    onClick={prevStep}
                    className="w-full py-3 text-himalayan-blue/40 text-xs font-bold uppercase tracking-widest hover:text-himalayan-blue transition-colors"
                  >
                    Back to Step {currentStep - 1}
                  </button>
                )}
                
                <p className="text-[10px] text-center text-himalayan-blue/40 leading-relaxed font-dm-sans">
                  By confirming, you agree to the on-chain smart contract terms. 
                  Gas fees apply for transaction validation.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-himalayan-blue/5 flex items-start gap-4">
              <Info className="w-6 h-6 text-trekker-orange shrink-0" />
              <p className="text-xs text-himalayan-blue/60 leading-relaxed font-dm-sans">
                You are paying from <span className="text-himalayan-blue font-bold">Mainnet/Devnet</span>. 
                Cross-chain payment via <span className="font-bold">Wormhole</span> is available in checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

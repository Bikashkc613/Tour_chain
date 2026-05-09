"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, Users, ChevronRight, ChevronLeft, Shield, Star, Mountain, Clock, Plus, Minus, MapPin, Wind, Thermometer, Eye, ArrowLeft, Zap, Award } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EscrowPanel } from "@/components/EscrowPanel";
import { DEMO_ROUTES } from "@/lib/demo/catalog";

type RouteItem = {
  id: string;
  name: string;
  region: string;
  difficulty: string;
  duration_days: number;
  image_url?: string | null;
  max_altitude_meters?: number | null;
};
type ServiceItem = { id: string; guide_id: string; route_id: string | null; title: string; price_usd: number };

type WeatherData = {
  temp_c: number;
  feels_like_c: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_kph: number;
  visibility_km: number;
  trek_condition: { label: string; status: string };
};

const PACKAGE_META: Record<string, { icon: string; color: string; features: string[]; popular?: boolean }> = {
  "Budget Trek Package":        { icon: "🎒", color: "from-emerald-400 to-teal-500",    features: ["Licensed guide", "Basic accommodation", "Permits included", "Emergency contact"] },
  "Standard Guide + Porter":    { icon: "🧗", color: "from-blue-400 to-indigo-500",     features: ["Expert guide + porter", "Mid-range lodges", "All permits", "First aid kit", "Daily briefings"], popular: true },
  "Premium All-Inclusive":      { icon: "â­", color: "from-orange-400 to-rose-500",     features: ["Senior guide + 2 porters", "Premium teahouses", "All meals included", "Satellite phone", "Insurance"] },
  "Luxury Summit Experience":   { icon: "👑", color: "from-purple-400 to-pink-500",     features: ["Private guide team", "Luxury lodges", "Helicopter backup", "Full insurance", "NFT certificate", "24/7 support"] },
};

const ADD_ONS = [
  { id: "porter",    label: "Extra Porter",       price: 45,  icon: "🎒", desc: "Per day" },
  { id: "gear",      label: "Gear Rental Kit",    price: 89,  icon: "🥾", desc: "Full set" },
  { id: "insurance", label: "Trek Insurance",     price: 120, icon: "🛡️", desc: "Full coverage" },
  { id: "photo",     label: "Photography Guide",  price: 150, icon: "📸", desc: "Professional" },
  { id: "medkit",    label: "Advanced Med Kit",   price: 35,  icon: "🏥", desc: "Altitude meds" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
  moderate: "text-amber-600 bg-amber-50 border-amber-200",
  challenging: "text-orange-600 bg-orange-50 border-orange-200",
  hard: "text-orange-600 bg-orange-50 border-orange-200",
  extreme: "text-red-600 bg-red-50 border-red-200",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STEPS = ["Package", "Add-ons", "Dates", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              i < current  ? "bg-trekker-orange text-white shadow-lg shadow-orange-300/50" :
              i === current ? "bg-himalayan-blue text-white shadow-lg shadow-blue-300/50 scale-110" :
                              "bg-gray-100 text-gray-400"
            }`}>
              {i < current ? "âœ“" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-semibold ${i === current ? "text-himalayan-blue" : "text-gray-400"}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 h-0.5 mb-4 mx-1 transition-all duration-500 ${i < current ? "bg-trekker-orange" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BookingPage() {
  const params = useParams();
  const routeId = params.operatorId as string;
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [groupSize, setGroupSize] = useState(1);
  const [trekStyle, setTrekStyle] = useState<"teahouse" | "camping" | "luxury">("teahouse");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [guideWallet, setGuideWallet] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      // Run routes + services in parallel, not sequentially
      const [routesRes, servicesRes] = await Promise.all([
        fetch("/api/routes", { cache: "force-cache" }),
        fetch(`/api/services?routeId=${routeId}`, { cache: "force-cache" }),
      ]);

      const routesJson = await routesRes.json();
      const dbRoutes = (routesJson.routes ?? []) as RouteItem[];
      const allRoutes = dbRoutes.length >= 3 ? dbRoutes : [...dbRoutes, ...DEMO_ROUTES];
      setRoutes(allRoutes);

      if (servicesRes.ok) {
        const servicesJson = await servicesRes.json();
        setServices(servicesJson.services ?? []);
        if (servicesJson.services?.length) {
          setSelectedServiceId(servicesJson.services[0].id);
        }
      }

      // Determine region from routes or demo catalog, then fetch weather
      const route = allRoutes.find((r) => r.id === routeId) ?? allRoutes[0];
      if (route?.region) {
        fetch(`/api/weather?region=${encodeURIComponent(route.region)}`, { cache: "force-cache" })
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setWeather(d); })
          .catch(() => null);
      }
    };
    void load();
  }, [routeId]);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === routeId) ?? routes[0],
    [routeId, routes],
  );
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? services[0],
    [selectedServiceId, services],
  );

  const isDemo = (svc: ServiceItem) => !UUID_RE.test(svc.id) || !UUID_RE.test(svc.guide_id);

  // Fetch guide's wallet address when service is selected
  useEffect(() => {
    const fetchGuideWallet = async () => {
      if (!selectedService || isDemo(selectedService)) {
        setGuideWallet(null);
        return;
      }
      
      try {
        const res = await fetch(`/api/guides/${selectedService.guide_id}`);
        if (res.ok) {
          const data = await res.json();
          setGuideWallet(data.guide?.wallet_address ?? null);
        }
      } catch {
        setGuideWallet(null);
      }
    };
    void fetchGuideWallet();
  }, [selectedService]);

  const addOnTotal = ADD_ONS.filter((a) => selectedAddOns.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const basePrice = selectedService?.price_usd ?? 0;
  const groupDiscount = groupSize >= 4 ? 0.1 : groupSize >= 2 ? 0.05 : 0;
  const subtotal = basePrice + addOnTotal;
  const discount = Math.round(subtotal * groupDiscount);
  const total = subtotal - discount;

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const submitBooking = async () => {
    setError(null);
    setMessage(null);
    if (!selectedService) { setError("Please select a service."); return; }
    if (!startDate) { setError("Please pick a start date."); return; }
    setLoading(true);
    try {
      if (isDemo(selectedService)) {
        await new Promise((r) => setTimeout(r, 800));
        const demoId = `DEMO-${Date.now().toString(36).toUpperCase()}`;
        setConfirmedBookingId(demoId);
        setMessage(`Booking confirmed! Ref: ${demoId}`);
        return;
      }
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: selectedService.guide_id,
          serviceId: selectedService.id,
          routeId: selectedRoute && UUID_RE.test(selectedRoute.id) ? selectedRoute.id : undefined,
          startDate,
          endDate: endDate || null,
          totalPriceUsd: total,
          milestonesTotal: 3,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message ?? payload?.error ?? "Failed to create booking");
        return;
      }
      setConfirmedBookingId(payload.booking.id);
      setMessage(`Booking confirmed! ID: ${payload.booking.id}`);
    } finally {
      setLoading(false);
    }
  };

  const diffKey = selectedRoute?.difficulty?.toLowerCase() ?? "moderate";
  const diffClass = DIFFICULTY_COLORS[diffKey] ?? DIFFICULTY_COLORS.moderate;
  const pkgMeta = selectedService ? (PACKAGE_META[selectedService.title] ?? { icon: "🎒", color: "from-gray-400 to-gray-500", features: [] }) : null;


  if (confirmedBookingId && selectedService) {
    return (
      <div className="min-h-screen pt-20" style={{ background:"linear-gradient(160deg,#f0f4ff 0%,#f5f0e8 60%,#f0fff4 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ type:"spring", stiffness:200, damping:20 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-2 w-full" style={{ background:"linear-gradient(90deg,#1a2b4a,#2d6a4f)" }} />
            <div className="p-8 text-center space-y-4">
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:300, damping:15, delay:0.1 }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl" style={{ background:"linear-gradient(135deg,#1a2b4a,#2d6a4f)" }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold" style={{ color:"#1a2b4a", fontFamily:"Georgia,serif" }}>Booking Confirmed!</h2>
              <p className="text-gray-500 text-sm">Ref: <span className="font-mono font-bold text-gray-700">{confirmedBookingId}</span></p>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Route</span><span className="font-semibold" style={{ color:"#1a2b4a" }}>{selectedRoute?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Package</span><span className="font-semibold" style={{ color:"#1a2b4a" }}>{selectedService.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Start Date</span><span className="font-semibold" style={{ color:"#1a2b4a" }}>{startDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total</span><span className="font-bold text-lg" style={{ color:"#2d6a4f" }}>${total}</span></div>
              </div>
              
              {/* Escrow info note */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Optional: Lock Funds in Escrow</p>
                    <p className="text-blue-700 text-xs leading-relaxed">
                      Your booking is confirmed! For added security, you can optionally lock your payment in a Solana escrow contract below. 
                      {!guideWallet && " (Note: Your guide needs to connect their wallet first to enable escrow.)"}
                    </p>
                  </div>
                </div>
              </div>
              
              <EscrowPanel bookingId={confirmedBookingId} priceUsd={total} guideWallet={guideWallet ?? undefined} onSuccess={(sig) => console.log("Escrow locked:", sig)} />
              <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold mt-2" style={{ color:"#2d6a4f" }}>← Back to Explore</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" style={{ background:"linear-gradient(160deg,#f0f4ff 0%,#f5f0e8 60%,#f0fff4 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <div className="relative h-56">
                <Image src={selectedRoute?.image_url ?? "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80"} alt={selectedRoute?.name ?? "Route"} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedRoute?.max_altitude_meters && <span className="text-xs bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-bold">⛰️ {(selectedRoute.max_altitude_meters/1000).toFixed(1)}k m</span>}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diffClass}`}>{selectedRoute?.difficulty}</span>
                  </div>
                  <h1 className="text-white text-xl font-bold" style={{ fontFamily:"Georgia,serif" }}>{selectedRoute?.name ?? "Loading…"}</h1>
                  <p className="text-white/60 text-xs mt-0.5">📍 {selectedRoute?.region} · 🗓 {selectedRoute?.duration_days} days</p>
                </div>
              </div>
              <div className="bg-white p-4 grid grid-cols-3 gap-3">
                {[
                  { icon:<Mountain className="w-4 h-4" />, label:"Altitude", value:selectedRoute?.max_altitude_meters ? `${(selectedRoute.max_altitude_meters/1000).toFixed(1)}k m` : "—" },
                  { icon:<Clock className="w-4 h-4" />, label:"Duration", value:`${selectedRoute?.duration_days ?? "—"} days` },
                  { icon:<Zap className="w-4 h-4" />, label:"XP Reward", value:"+1,400" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="flex justify-center mb-1" style={{ color:"#2d6a4f" }}>{s.icon}</div>
                    <p className="text-xs font-bold" style={{ color:"#1a2b4a" }}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {weather && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Current Conditions</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{weather.icon}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color:"#1a2b4a" }}>{weather.condition}</p>
                      <p className="text-xs text-gray-400">{weather.temp_c}°C feels like {weather.feels_like_c}°C</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:weather.trek_condition.status==="excellent"?"#ecfdf5":weather.trek_condition.status==="good"?"#eff6ff":"#fffbeb", color:weather.trek_condition.status==="excellent"?"#059669":weather.trek_condition.status==="good"?"#2563eb":"#d97706" }}>{weather.trek_condition.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon:<Thermometer className="w-3 h-3" />, label:"Humidity", value:`${weather.humidity}%` },
                    { icon:<Wind className="w-3 h-3" />, label:"Wind", value:`${weather.wind_kph} km/h` },
                    { icon:<Eye className="w-3 h-3" />, label:"Visibility", value:`${weather.visibility_km} km` },
                  ].map((w) => (
                    <div key={w.label} className="bg-gray-50 rounded-xl p-2 text-center">
                      <div className="flex justify-center text-gray-400 mb-0.5">{w.icon}</div>
                      <p className="text-xs font-bold text-gray-700">{w.value}</p>
                      <p className="text-[9px] text-gray-400">{w.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Why Book with TourChain</p>
              {[
                { icon:<Shield className="w-4 h-4" />, title:"Escrow Protected", desc:"Payment held on Solana until trek verified" },
                { icon:<Award className="w-4 h-4" />, title:"NFT Certificate", desc:"Permanent on-chain proof of completion" },
                { icon:<Star className="w-4 h-4" />, title:"Verified Guides", desc:"All guides licensed and reputation-scored" },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background:"#2d6a4f15", color:"#2d6a4f" }}>{b.icon}</div>
                  <div><p className="text-xs font-bold" style={{ color:"#1a2b4a" }}>{b.title}</p><p className="text-[10px] text-gray-400">{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="h-1.5 w-full" style={{ background:"linear-gradient(90deg,#1a2b4a,#2d6a4f)" }} />
              <div className="p-6">
                <StepIndicator current={step} />
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="pkg" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }} className="space-y-3">
                      <h2 className="text-lg font-bold mb-4" style={{ color:"#1a2b4a", fontFamily:"Georgia,serif" }}>Choose Your Package</h2>
                      {services.map((svc) => {
                        const meta = PACKAGE_META[svc.title] ?? { icon:"🎒", color:"from-gray-400 to-gray-500", features:[], popular:false };
                        const isSel = selectedServiceId === svc.id;
                        return (
                          <button key={svc.id} onClick={() => setSelectedServiceId(svc.id)} className="w-full text-left rounded-2xl border-2 p-4 transition-all" style={{ borderColor:isSel?"#1a2b4a":"#e5e7eb", background:isSel?"#1a2b4a08":"#f9fafb" }}>
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>{meta.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-sm" style={{ color:"#1a2b4a" }}>{svc.title}</p>
                                  {meta.popular && <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Popular</span>}
                                </div>
                                <p className="text-lg font-bold mt-0.5" style={{ color:"#2d6a4f" }}>${svc.price_usd}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">{meta.features.slice(0,3).map((f) => <span key={f} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>)}</div>
                              </div>
                              {isSel && <CheckCircle2 className="w-5 h-5 shrink-0 mt-1" style={{ color:"#2d6a4f" }} />}
                            </div>
                          </button>
                        );
                      })}
                      <div className="bg-gray-50 rounded-2xl p-4 mt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Group Size</p>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setGroupSize(g => Math.max(1,g-1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"><Minus className="w-4 h-4 text-gray-600" /></button>
                          <div className="text-center"><p className="text-2xl font-bold" style={{ color:"#1a2b4a" }}>{groupSize}</p><p className="text-[10px] text-gray-400">{groupSize===1?"Solo":`${groupSize} people`}</p></div>
                          <button onClick={() => setGroupSize(g => Math.min(12,g+1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"><Plus className="w-4 h-4 text-gray-600" /></button>
                          {groupDiscount > 0 && <span className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:"#ecfdf5", color:"#059669" }}>{groupDiscount*100}% group discount!</span>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="addons" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }} className="space-y-3">
                      <h2 className="text-lg font-bold mb-4" style={{ color:"#1a2b4a", fontFamily:"Georgia,serif" }}>Enhance Your Trek</h2>
                      {ADD_ONS.map((addon) => {
                        const on = selectedAddOns.includes(addon.id);
                        return (
                          <button key={addon.id} onClick={() => toggleAddOn(addon.id)} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left" style={{ borderColor:on?"#2d6a4f":"#e5e7eb", background:on?"#2d6a4f08":"#f9fafb" }}>
                            <span className="text-2xl">{addon.icon}</span>
                            <div className="flex-1"><p className="font-bold text-sm" style={{ color:"#1a2b4a" }}>{addon.label}</p><p className="text-xs text-gray-400">{addon.desc}</p></div>
                            <div className="text-right shrink-0"><p className="font-bold text-sm" style={{ color:"#2d6a4f" }}>+${addon.price}</p>{on && <CheckCircle2 className="w-4 h-4 ml-auto mt-0.5" style={{ color:"#2d6a4f" }} />}</div>
                          </button>
                        );
                      })}
                      <div className="mt-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Special Requests</label>
                        <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Dietary requirements, medical conditions, preferred pace…" rows={3} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none resize-none" />
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="dates" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }} className="space-y-4">
                      <h2 className="text-lg font-bold mb-4" style={{ color:"#1a2b4a", fontFamily:"Georgia,serif" }}>Pick Your Dates</h2>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Start Date *</label>
                          <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none" /></div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">End Date</label>
                          <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none" /></div>
                        </div>
                      </div>
                      {startDate && selectedRoute && (
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                          <Clock className="w-5 h-5 shrink-0" style={{ color:"#2d6a4f" }} />
                          <div><p className="text-sm font-bold" style={{ color:"#1a2b4a" }}>{endDate ? `${Math.ceil((new Date(endDate).getTime()-new Date(startDate).getTime())/(1000*60*60*24))} day trek` : `${selectedRoute.duration_days} day trek`}</p><p className="text-xs text-gray-400">Starting {new Date(startDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p></div>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Trek Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          {([["teahouse","🏠","Teahouse"],["camping","⛺","Camping"],["luxury","👑","Luxury"]] as const).map(([val,icon,label]) => (
                            <button key={val} onClick={() => setTrekStyle(val)} className="py-3 rounded-2xl border-2 text-center transition-all" style={{ borderColor:trekStyle===val?"#1a2b4a":"#e5e7eb", background:trekStyle===val?"#1a2b4a08":"#f9fafb" }}>
                              <div className="text-xl mb-1">{icon}</div>
                              <p className="text-xs font-bold" style={{ color:trekStyle===val?"#1a2b4a":"#6b7280" }}>{label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="review" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }} className="space-y-4">
                      <h2 className="text-lg font-bold mb-4" style={{ color:"#1a2b4a", fontFamily:"Georgia,serif" }}>Review & Confirm</h2>
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm">
                        {[
                          { label:"Route", value:selectedRoute?.name ?? "—" },
                          { label:"Package", value:selectedService?.title ?? "—" },
                          { label:"Group", value:`${groupSize} ${groupSize===1?"person":"people"}` },
                          { label:"Style", value:trekStyle.charAt(0).toUpperCase()+trekStyle.slice(1) },
                          { label:"Start", value:startDate || "—" },
                          { label:"End", value:endDate || "—" },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between"><span className="text-gray-400">{row.label}</span><span className="font-semibold" style={{ color:"#1a2b4a" }}>{row.value}</span></div>
                        ))}
                        {selectedAddOns.length > 0 && <div className="flex justify-between"><span className="text-gray-400">Add-ons</span><span className="font-semibold" style={{ color:"#1a2b4a" }}>{ADD_ONS.filter(a=>selectedAddOns.includes(a.id)).map(a=>a.label).join(", ")}</span></div>}
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Base package</span><span>${basePrice}</span></div>
                        {addOnTotal > 0 && <div className="flex justify-between text-gray-500"><span>Add-ons</span><span>+${addOnTotal}</span></div>}
                        {discount > 0 && <div className="flex justify-between" style={{ color:"#059669" }}><span>Group discount ({groupDiscount*100}%)</span><span>-${discount}</span></div>}
                        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base"><span style={{ color:"#1a2b4a" }}>Total</span><span style={{ color:"#2d6a4f" }}>${total}</span></div>
                      </div>
                      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-600 flex items-center gap-2"><span>⚠️</span>{error}</div>}
                      <button onClick={() => void submitBooking()} disabled={loading || !startDate} className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" style={{ background:"linear-gradient(135deg,#1a2b4a 0%,#2d6a4f 100%)" }}>
                        {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</> : <>Confirm Booking · ${total} <ChevronRight className="w-4 h-4" /></>}
                      </button>
                      {!startDate && <p className="text-center text-xs text-gray-400">← Go back to Step 3 to pick your dates</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  {step > 0 ? <button onClick={() => setStep(s=>s-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button> : <div />}
                  {step < 3 && <button onClick={() => setStep(s=>s+1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-md" style={{ background:"linear-gradient(135deg,#1a2b4a,#2d6a4f)" }}>Continue <ChevronRight className="w-4 h-4" /></button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

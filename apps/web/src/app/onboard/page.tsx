"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Globe, Mountain, Compass, ArrowRight, ArrowLeft,
  CheckCircle2, MapPin, Clock, Star, Shield, Zap, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

// ── constants ────────────────────────────────────────────────────────────────

const NAVY  = "#1a2b4a";
const GREEN = "#2d6a4f";

const STEPS = [
  { id: "welcome",    icon: "🏔️", title: "Welcome",       short: "Welcome"  },
  { id: "wallet",     icon: "🔗", title: "Connect Wallet", short: "Wallet"   },
  { id: "profile",    icon: "🧗", title: "Your Profile",   short: "Profile"  },
  { id: "trek-style", icon: "🗺️", title: "Trek Style",     short: "Style"    },
  { id: "ready",      icon: "🎖️", title: "You're Ready",   short: "Ready"    },
];

const EXPERIENCE_LEVELS = [
  { id: "first",        label: "First Timer",    desc: "Never trekked before",          icon: "🌱" },
  { id: "beginner",     label: "Beginner",       desc: "1–2 short treks done",           icon: "🥾" },
  { id: "intermediate", label: "Intermediate",   desc: "Several multi-day treks",        icon: "🧗" },
  { id: "experienced",  label: "Experienced",    desc: "High altitude experience",       icon: "⛰️" },
  { id: "expert",       label: "Expert",         desc: "Technical climbs & expeditions", icon: "🦅" },
];

const TREK_STYLES = [
  { id: "teahouse", label: "Teahouse",  desc: "Stay in local lodges along the trail",  icon: "🏠", price: "$" },
  { id: "camping",  label: "Camping",   desc: "Tents and wilderness immersion",         icon: "⛺", price: "$$" },
  { id: "luxury",   label: "Luxury",    desc: "Premium lodges, private guides",         icon: "👑", price: "$$$" },
];

const INTERESTS = [
  { id: "summit",    label: "Summit Views",     icon: "🏔️" },
  { id: "culture",   label: "Local Culture",    icon: "🙏" },
  { id: "wildlife",  label: "Wildlife",         icon: "🦁" },
  { id: "photo",     label: "Photography",      icon: "📸" },
  { id: "spiritual", label: "Spiritual Sites",  icon: "🕌" },
  { id: "challenge", label: "Physical Challenge", icon: "💪" },
];

// ── step indicator ────────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <motion.div
            animate={{
              width:  i === current ? 28 : 8,
              background: i < current ? GREEN : i === current ? NAVY : "#d1d5db",
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("");
  const [country, setCountry]     = useState("");
  const [experience, setExp]      = useState("");
  const [trekStyle, setStyle]     = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving]       = useState(false);

  const toggleInterest = (id: string) =>
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canNext = () => {
    if (step === 1) return connected;
    if (step === 2) return name.trim().length > 0;
    if (step === 3) return trekStyle !== "";
    return true;
  };

  const next = () => { if (canNext()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    setSaving(true);
    // Save profile to Supabase if connected
    try {
      await fetch("/api/auth/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey?.toBase58(),
          displayName: name,
          country,
          experience,
          trekStyle,
          interests,
        }),
      });
    } catch { /* non-blocking */ }
    setSaving(false);
    router.push("/explore");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #f0f4ff 0%, #f5f0e8 60%, #f0fff4 100%)" }}
    >
      {/* Minimal top bar — just logo, no full navbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-[90px] h-[32px]">
            <Image src="/logo.png" alt="TourChain" fill className="object-contain object-left" />
          </div>
        </Link>
        <Link
          href="/explore"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          Skip for now <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Step dots */}
          <StepDots current={step} />

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-navy/10 border border-white overflow-hidden">

            <AnimatePresence mode="wait">

              {/* ── STEP 0 — Welcome ─────────────────────────────── */}
              {step === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hero image */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80"
                      alt="Everest Base Camp"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Welcome to</p>
                      <h1 className="text-white text-3xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
                        Your Himalayan Journey
                      </h1>
                    </div>
                  </div>

                  <div className="p-7 space-y-5">
                    <p className="text-gray-500 text-sm leading-relaxed">
                      TourChain connects you with verified local guides, protects your payment on Solana, and gives you a permanent on-chain proof of every trek you complete.
                    </p>

                    {/* 3 value props */}
                    <div className="space-y-3">
                      {[
                        { icon: <Shield className="w-4 h-4" style={{ color: GREEN }} />, text: "Payment protected by Solana escrow — released only when your trek is verified complete" },
                        { icon: <MapPin className="w-4 h-4" style={{ color: NAVY }} />,  text: "GPS check-ins at every checkpoint prove your journey is real" },
                        { icon: <Star className="w-4 h-4 text-amber-500" />,             text: "Earn XP, badges, and a permanent NFT certificate for every summit" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                          <div className="mt-0.5 shrink-0">{item.icon}</div>
                          <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={next}
                      className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${GREEN} 100%)` }}
                    >
                      Start Your Journey <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-center text-xs text-gray-400">Takes less than 2 minutes · No credit card needed</p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1 — Connect Wallet ───────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="p-7 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${NAVY}22, ${NAVY}44)` }}
                    >
                      <Wallet className="w-8 h-8" style={{ color: NAVY }} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Georgia, serif" }}>
                      Connect Your Wallet
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Your Solana wallet is your identity on TourChain. It holds your booking escrow and your trek NFTs.
                    </p>
                  </div>

                  {/* What your wallet does */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your wallet is used for</p>
                    {[
                      { icon: "🔐", text: "Locking trek payments in escrow" },
                      { icon: "🎖️", text: "Receiving your completion NFT" },
                      { icon: "⭐", text: "Storing your XP and reputation" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <WalletMultiButton
                      className="!rounded-2xl !h-14 !px-8 !font-bold !text-base !shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${NAVY}, ${GREEN})` }}
                    />
                  </div>

                  {connected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                      style={{ background: `${GREEN}15`, color: GREEN }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Wallet connected! You&apos;re ready to continue.
                    </motion.div>
                  )}

                  <p className="text-center text-xs text-gray-400">
                    Don&apos;t have a wallet?{" "}
                    <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                      Get Phantom free →
                    </a>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2 — Profile ─────────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="p-7 space-y-5"
                >
                  <div className="text-center space-y-2">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background: `${GREEN}22` }}
                    >
                      <Globe className="w-8 h-8" style={{ color: GREEN }} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Georgia, serif" }}>
                      Tell Us About You
                    </h2>
                    <p className="text-gray-400 text-sm">We&apos;ll use this to recommend the perfect routes for you.</p>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ "--tw-ring-color": GREEN } as React.CSSProperties}
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Home Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 transition-all"
                    />
                  </div>

                  {/* Experience level */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trekking Experience</label>
                    <div className="grid grid-cols-1 gap-2">
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => setExp(lvl.id)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all"
                          style={{
                            borderColor: experience === lvl.id ? GREEN : "#e5e7eb",
                            background:  experience === lvl.id ? `${GREEN}10` : "#f9fafb",
                          }}
                        >
                          <span className="text-xl">{lvl.icon}</span>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: experience === lvl.id ? GREEN : NAVY }}>{lvl.label}</p>
                            <p className="text-xs text-gray-400">{lvl.desc}</p>
                          </div>
                          {experience === lvl.id && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: GREEN }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3 — Trek Style ───────────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="p-7 space-y-5"
                >
                  <div className="text-center space-y-2">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background: "#e07b3922" }}
                    >
                      <Mountain className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Georgia, serif" }}>
                      How Do You Like to Trek?
                    </h2>
                    <p className="text-gray-400 text-sm">This helps us match you with the right guides and packages.</p>
                  </div>

                  {/* Trek style */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Style *</label>
                    {TREK_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all"
                        style={{
                          borderColor: trekStyle === s.id ? GREEN : "#e5e7eb",
                          background:  trekStyle === s.id ? `${GREEN}10` : "#f9fafb",
                        }}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: trekStyle === s.id ? GREEN : NAVY }}>{s.label}</p>
                          <p className="text-xs text-gray-400">{s.desc}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{s.price}</span>
                        {trekStyle === s.id && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />}
                      </button>
                    ))}
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">What interests you? (pick any)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {INTERESTS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all text-center"
                          style={{
                            borderColor: interests.includes(item.id) ? GREEN : "#e5e7eb",
                            background:  interests.includes(item.id) ? `${GREEN}10` : "#f9fafb",
                          }}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-[10px] font-semibold leading-tight" style={{ color: interests.includes(item.id) ? GREEN : "#6b7280" }}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4 — Ready ───────────────────────────────── */}
              {step === 4 && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  className="p-7 space-y-5 text-center"
                >
                  {/* Animated checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${GREEN})` }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY, fontFamily: "Georgia, serif" }}>
                      {name ? `Welcome, ${name}! 🎉` : "You're All Set! 🎉"}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Your TourChain profile is ready. Browse verified routes, book a guide, and start earning XP on every trek.
                    </p>
                  </div>

                  {/* Summary card */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2.5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Profile</p>
                    {[
                      { icon: "🧗", label: "Name",       value: name || "—" },
                      { icon: "🌍", label: "Country",    value: country || "—" },
                      { icon: "⛰️", label: "Experience", value: EXPERIENCE_LEVELS.find((e) => e.id === experience)?.label || "—" },
                      { icon: "🏠", label: "Trek Style", value: TREK_STYLES.find((s) => s.id === trekStyle)?.label || "—" },
                      { icon: "🔗", label: "Wallet",     value: connected ? `${publicKey?.toBase58().slice(0, 6)}…${publicKey?.toBase58().slice(-4)}` : "Not connected" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><span>{row.icon}</span>{row.label}</span>
                        <span className="font-semibold" style={{ color: NAVY }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* What's next */}
                  <div className="space-y-2">
                    {[
                      { icon: <MapPin className="w-4 h-4" />,  text: "Browse 6+ verified Nepal routes" },
                      { icon: <Clock className="w-4 h-4" />,   text: "Book a guide in under 5 minutes" },
                      { icon: <Zap className="w-4 h-4" />,     text: "Earn XP on every check-in" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GREEN}15`, color: GREEN }}>
                          {item.icon}
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => void finish()}
                    disabled={saving}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl disabled:opacity-70"
                    style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${GREEN} 100%)` }}
                  >
                    {saving ? "Setting up…" : "Explore Routes"}
                    <Compass className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Footer nav — back / continue */}
            {step > 0 && step < 4 && (
              <div className="px-7 pb-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={next}
                  disabled={!canNext()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                  style={{ background: canNext() ? `linear-gradient(135deg, ${NAVY}, ${GREEN})` : "#9ca3af" }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step label */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Step {step + 1} of {STEPS.length} — {STEPS[step].title}
          </p>
        </div>
      </div>
    </div>
  );
}

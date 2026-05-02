"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Map, LayoutDashboard, Award, Landmark,
  Sparkles, Trophy, CloudRain, Gift, Menu, X, Target,
  BookOpen, Swords, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

/* Brand colours matching the logo */
const NAVY  = "#1a2b4a";
const GREEN = "#2d6a4f";

const PRIMARY_NAV = [
  { name: "Explore",     href: "/explore",     icon: Map,             badge: null },
  { name: "AI Planner",  href: "/planner",     icon: Sparkles,        badge: "New" },
  { name: "Challenges",  href: "/challenges",  icon: Swords,          badge: null },
  { name: "Stories",     href: "/stories",     icon: BookOpen,        badge: null },
  { name: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard, badge: null },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy,          badge: null },
];

const SECONDARY_NAV = [
  { name: "Vibe",     href: "/vibe",     icon: Award,     badge: null },
  { name: "DAO",      href: "/dao",      icon: Landmark,  badge: null },
  { name: "Weather",  href: "/weather",  icon: CloudRain, badge: null },
  { name: "Quests",   href: "/quests",   icon: Target,    badge: null },
  { name: "Referral", href: "/referral", icon: Gift,      badge: null },
];

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];



export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-2xl border-b shadow-sm"
            : "bg-white/80 backdrop-blur-xl border-b border-transparent",
        )}
        style={{ borderColor: scrolled ? "#e5e7eb" : "transparent" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link href="/" className="flex items-center shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative w-[48px] h-[48px]"
            >
              <Image
                src="/logo.png"
                alt="TourChain"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <div className="hidden sm:flex flex-col leading-none ml-2">
              <span className="font-playfair text-[18px] tracking-tight leading-none" style={{ color: NAVY }}>
                Tour<span style={{ color: GREEN }}>Chain</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5" style={{ color: GREEN, opacity: 0.7 }}>
                Nepal
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "font-semibold"
                      : "hover:bg-gray-50",
                  )}
                  style={{
                    color: isActive ? GREEN : "#374151",
                  }}
                >
                  {/* Active pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: `${GREEN}12`, border: `1.5px solid ${GREEN}30` }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    className="w-4 h-4 relative z-10 shrink-0"
                    style={{ color: isActive ? GREEN : "#6b7280" }}
                  />
                  <span className="relative z-10">{item.name}</span>
                  {item.badge && (
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="relative z-10 text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      style={{ background: GREEN }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative group ml-1">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all"
              >
                More
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl"
                style={{ boxShadow: `0 8px 32px ${NAVY}18` }}
              >
                {/* Green top accent */}
                <div className="h-0.5 mx-3 mb-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${GREEN})` }} />
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors rounded-xl mx-1"
                      style={{
                        color: isActive ? GREEN : "#374151",
                        background: isActive ? `${GREEN}10` : undefined,
                        fontWeight: isActive ? 600 : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ""; }}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? GREEN : "#9ca3af" }} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right side ────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            <WalletMultiButton
              className="!rounded-xl !h-9 !px-4 !text-sm !font-semibold !transition-all"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${GREEN} 100%)`,
                border: "none",
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: NAVY }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90,  opacity: 0 }} transition={{ duration: 0.15 }}><X    className="w-5 h-5" /></motion.div>
                  : <motion.div key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[68px] z-40 bg-white border-b border-gray-100 shadow-xl md:hidden"
            style={{ boxShadow: `0 12px 40px ${NAVY}18` }}
          >
            {/* Top accent bar */}
            <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${GREEN})` }} />

            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="px-3 py-3 space-y-0.5 max-h-[80vh] overflow-y-auto"
            >
              {ALL_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        color: isActive ? GREEN : "#374151",
                        background: isActive ? `${GREEN}10` : undefined,
                        fontWeight: isActive ? 600 : undefined,
                        borderLeft: isActive ? `3px solid ${GREEN}` : "3px solid transparent",
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? GREEN : "#9ca3af" }} />
                      {item.name}
                      {item.badge && (
                        <span
                          className="text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase ml-auto"
                          style={{ background: GREEN }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile wallet button */}
              <div className="pt-2 pb-1 px-1">
                <WalletMultiButton
                  className="!w-full !rounded-xl !h-11 !text-sm !font-semibold"
                  style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${GREEN} 100%)`, border: "none" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

"use client";

/**
 * PageBackground — reusable animated background component.
 * Each variant is tuned to the mood of its page.
 */

import { useReducedMotion } from "framer-motion";

type Variant =
  | "home"       // deep mountain night sky
  | "explore"    // fresh alpine morning
  | "leaderboard"// dark competitive arena
  | "dao"        // deep space governance
  | "vibe"       // ocean-depth NFT gallery
  | "dashboard"  // clean warm trekker HQ
  | "trek"       // earthy trail
  | "planner"    // indigo AI space
  | "weather"    // sky blue
  | "referral"   // soft purple reward
  | "quests"     // warm adventure
  | "default";   // neutral summit white

interface PageBackgroundProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const CONFIGS: Record<Variant, {
  base: string;
  orbs: { color: string; size: string; pos: string; delay: string; duration: string }[];
  mesh?: string;
}> = {
  home: {
    base: "bg-[#0a1628]",
    mesh: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(26,43,74,0.8) 0%, transparent 60%)",
    orbs: [
      { color: "rgba(224,123,57,0.18)", size: "w-[600px] h-[600px]", pos: "top-[-100px] right-[-100px]", delay: "0s", duration: "18s" },
      { color: "rgba(45,106,79,0.15)",  size: "w-[500px] h-[500px]", pos: "bottom-[10%] left-[-80px]",   delay: "3s", duration: "22s" },
      { color: "rgba(214,40,40,0.10)",  size: "w-[400px] h-[400px]", pos: "top-[40%] left-[40%]",        delay: "6s", duration: "15s" },
    ],
  },
  explore: {
    base: "bg-[#f0f4ff]",
    mesh: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(224,123,57,0.08) 0%, transparent 70%)",
    orbs: [
      { color: "rgba(224,123,57,0.12)", size: "w-[500px] h-[500px]", pos: "top-[-60px] right-[-60px]",  delay: "0s", duration: "20s" },
      { color: "rgba(45,106,79,0.10)",  size: "w-[400px] h-[400px]", pos: "bottom-[5%] left-[-40px]",   delay: "4s", duration: "25s" },
      { color: "rgba(26,43,74,0.06)",   size: "w-[300px] h-[300px]", pos: "top-[50%] right-[20%]",      delay: "2s", duration: "18s" },
    ],
  },
  leaderboard: {
    base: "bg-[#080d1a]",
    mesh: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 60%)",
    orbs: [
      { color: "rgba(245,158,11,0.15)", size: "w-[500px] h-[500px]", pos: "top-[5%] left-[20%]",        delay: "0s", duration: "16s" },
      { color: "rgba(139,92,246,0.12)", size: "w-[400px] h-[400px]", pos: "bottom-[10%] right-[10%]",   delay: "5s", duration: "20s" },
      { color: "rgba(224,123,57,0.08)", size: "w-[300px] h-[300px]", pos: "top-[50%] left-[5%]",        delay: "2s", duration: "24s" },
    ],
  },
  dao: {
    base: "bg-[#06040f]",
    mesh: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)",
    orbs: [
      { color: "rgba(124,58,237,0.18)", size: "w-[600px] h-[600px]", pos: "top-[-80px] right-[10%]",    delay: "0s", duration: "20s" },
      { color: "rgba(37,99,235,0.15)",  size: "w-[500px] h-[500px]", pos: "bottom-[5%] left-[5%]",      delay: "4s", duration: "24s" },
      { color: "rgba(214,40,40,0.08)",  size: "w-[300px] h-[300px]", pos: "top-[40%] left-[40%]",       delay: "8s", duration: "18s" },
    ],
  },
  vibe: {
    base: "bg-[#060d1f]",
    mesh: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 60%)",
    orbs: [
      { color: "rgba(59,130,246,0.18)", size: "w-[500px] h-[500px]", pos: "top-[5%] left-[15%]",        delay: "0s", duration: "18s" },
      { color: "rgba(139,92,246,0.15)", size: "w-[450px] h-[450px]", pos: "bottom-[15%] right-[10%]",   delay: "3s", duration: "22s" },
      { color: "rgba(16,185,129,0.10)", size: "w-[350px] h-[350px]", pos: "top-[45%] left-[45%]",       delay: "6s", duration: "16s" },
    ],
  },
  dashboard: {
    base: "bg-[#fafbff]",
    mesh: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(224,123,57,0.06) 0%, transparent 70%)",
    orbs: [
      { color: "rgba(224,123,57,0.08)", size: "w-[400px] h-[400px]", pos: "top-[-40px] right-[-40px]",  delay: "0s", duration: "22s" },
      { color: "rgba(45,106,79,0.06)",  size: "w-[350px] h-[350px]", pos: "bottom-[10%] left-[-30px]",  delay: "5s", duration: "28s" },
    ],
  },
  trek: {
    base: "bg-[#f5f0e8]",
    mesh: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(45,106,79,0.08) 0%, transparent 60%)",
    orbs: [
      { color: "rgba(45,106,79,0.10)",  size: "w-[400px] h-[400px]", pos: "top-[-30px] right-[-30px]",  delay: "0s", duration: "20s" },
      { color: "rgba(224,123,57,0.08)", size: "w-[300px] h-[300px]", pos: "bottom-[15%] left-[-20px]",  delay: "4s", duration: "25s" },
    ],
  },
  planner: {
    base: "bg-[#080c1a]",
    mesh: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)",
    orbs: [
      { color: "rgba(99,102,241,0.18)", size: "w-[500px] h-[500px]", pos: "top-[5%] left-[20%]",        delay: "0s", duration: "18s" },
      { color: "rgba(249,115,22,0.12)", size: "w-[400px] h-[400px]", pos: "bottom-[10%] right-[10%]",   delay: "4s", duration: "22s" },
    ],
  },
  weather: {
    base: "bg-[#e8f4fd]",
    mesh: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
    orbs: [
      { color: "rgba(59,130,246,0.12)", size: "w-[500px] h-[500px]", pos: "top-[-50px] right-[-50px]",  delay: "0s", duration: "20s" },
      { color: "rgba(16,185,129,0.08)", size: "w-[350px] h-[350px]", pos: "bottom-[10%] left-[-30px]",  delay: "5s", duration: "26s" },
    ],
  },
  referral: {
    base: "bg-[#fafbff]",
    mesh: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)",
    orbs: [
      { color: "rgba(99,102,241,0.10)", size: "w-[450px] h-[450px]", pos: "top-[-40px] right-[-40px]",  delay: "0s", duration: "22s" },
      { color: "rgba(249,115,22,0.08)", size: "w-[350px] h-[350px]", pos: "bottom-[10%] left-[-30px]",  delay: "4s", duration: "28s" },
    ],
  },
  quests: {
    base: "bg-[#fafbff]",
    mesh: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)",
    orbs: [
      { color: "rgba(249,115,22,0.10)", size: "w-[450px] h-[450px]", pos: "top-[-40px] right-[-40px]",  delay: "0s", duration: "20s" },
      { color: "rgba(45,106,79,0.08)",  size: "w-[350px] h-[350px]", pos: "bottom-[10%] left-[-30px]",  delay: "4s", duration: "26s" },
    ],
  },
  default: {
    base: "bg-summit-white",
    orbs: [],
  },
};

export function PageBackground({ variant = "default", children, className = "" }: PageBackgroundProps) {
  const prefersReduced = useReducedMotion();
  const cfg = CONFIGS[variant];

  return (
    <div className={`relative min-h-screen ${cfg.base} ${className}`}>
      {/* Mesh gradient overlay */}
      {cfg.mesh && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: cfg.mesh }}
        />
      )}

      {/* Animated orbs */}
      {!prefersReduced && cfg.orbs.map((orb, i) => (
        <div
          key={i}
          className={`fixed rounded-full blur-3xl pointer-events-none z-0 ${orb.size} ${orb.pos}`}
          style={{
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            animation: `orb-float ${orb.duration} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}

      {/* Mountain silhouette for dark pages */}
      {(variant === "home" || variant === "leaderboard" || variant === "dao" || variant === "vibe" || variant === "planner") && (
        <div
          className="fixed bottom-0 left-0 right-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            height: "280px",
            background: "white",
            clipPath: "polygon(0% 100%, 0% 70%, 5% 65%, 10% 55%, 15% 60%, 20% 40%, 25% 45%, 30% 25%, 35% 30%, 40% 15%, 45% 20%, 50% 5%, 55% 18%, 60% 12%, 65% 28%, 70% 22%, 75% 38%, 80% 32%, 85% 48%, 90% 42%, 95% 58%, 100% 52%, 100% 100%)",
          }}
        />
      )}

      {/* Grid pattern for light pages */}
      {(variant === "explore" || variant === "dashboard" || variant === "quests" || variant === "referral") && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#1a2b4a 1px, transparent 1px), linear-gradient(90deg, #1a2b4a 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx global>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(20px, -30px) scale(1.05); }
          66%       { transform: translate(-15px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

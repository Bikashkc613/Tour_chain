import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  xp: number;
  level: number;
  level_name: string;
  treks_completed: number;
  nfts_minted: number;
  highest_altitude: number;
  badges: string[];
};

// XP rules
const XP_PER_TREK = 500;
const XP_PER_NFT = 300;
const XP_PER_CHECKIN = 50;
const XP_PER_1000M_ALT = 200;

const LEVELS = [
  { min: 0,     name: "Trail Starter",   emoji: "🥾" },
  { min: 500,   name: "Hill Walker",     emoji: "🚶" },
  { min: 1500,  name: "Ridge Trekker",   emoji: "🧗" },
  { min: 3000,  name: "Summit Seeker",   emoji: "⛰️" },
  { min: 6000,  name: "High Altitude Pro", emoji: "🏔️" },
  { min: 10000, name: "Himalayan Legend", emoji: "🦅" },
];

function getLevel(xp: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) level = l;
  }
  return { level: LEVELS.indexOf(level) + 1, name: level.name, emoji: level.emoji };
}

function getBadges(treks: number, nfts: number, alt: number): string[] {
  const badges: string[] = [];
  if (treks >= 1)  badges.push("🥾 First Trek");
  if (treks >= 5)  badges.push("🏅 5 Treks");
  if (treks >= 10) badges.push("🏆 10 Treks");
  if (nfts >= 1)   badges.push("🎖️ NFT Collector");
  if (nfts >= 5)   badges.push("💎 NFT Master");
  if (alt >= 5000) badges.push("⛰️ 5000m Club");
  if (alt >= 8000) badges.push("🦅 8000m Legend");
  return badges;
}

const AVATARS = ["🧗", "🏔️", "🌄", "⛰️", "🦅", "🏕️", "🗺️", "🧭", "🌿", "🦁"];

// Demo leaderboard for when DB is empty
const DEMO_BOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: "u1", display_name: "Pemba Sherpa",    avatar_emoji: "🦅", xp: 12400, level: 6, level_name: "Himalayan Legend",   treks_completed: 18, nfts_minted: 15, highest_altitude: 8516, badges: ["🥾 First Trek","🏅 5 Treks","🏆 10 Treks","🎖️ NFT Collector","💎 NFT Master","⛰️ 5000m Club","🦅 8000m Legend"] },
  { rank: 2, user_id: "u2", display_name: "Aarav Thapa",     avatar_emoji: "🏔️", xp: 8900,  level: 5, level_name: "High Altitude Pro",  treks_completed: 12, nfts_minted: 10, highest_altitude: 6812, badges: ["🥾 First Trek","🏅 5 Treks","🏆 10 Treks","🎖️ NFT Collector","💎 NFT Master","⛰️ 5000m Club"] },
  { rank: 3, user_id: "u3", display_name: "Sita Gurung",     avatar_emoji: "🌄", xp: 6200,  level: 5, level_name: "High Altitude Pro",  treks_completed: 9,  nfts_minted: 7,  highest_altitude: 5545, badges: ["🥾 First Trek","🏅 5 Treks","🎖️ NFT Collector","💎 NFT Master","⛰️ 5000m Club"] },
  { rank: 4, user_id: "u4", display_name: "Bikram Rai",      avatar_emoji: "⛰️", xp: 4100,  level: 4, level_name: "Summit Seeker",     treks_completed: 6,  nfts_minted: 5,  highest_altitude: 5364, badges: ["🥾 First Trek","🏅 5 Treks","🎖️ NFT Collector","💎 NFT Master","⛰️ 5000m Club"] },
  { rank: 5, user_id: "u5", display_name: "Nima Dolma",      avatar_emoji: "🧗", xp: 2800,  level: 3, level_name: "Ridge Trekker",     treks_completed: 4,  nfts_minted: 3,  highest_altitude: 4984, badges: ["🥾 First Trek","🎖️ NFT Collector","⛰️ 5000m Club"] },
  { rank: 6, user_id: "u6", display_name: "Rajesh Karki",    avatar_emoji: "🗺️", xp: 1900,  level: 3, level_name: "Ridge Trekker",     treks_completed: 3,  nfts_minted: 2,  highest_altitude: 4500, badges: ["🥾 First Trek","🎖️ NFT Collector"] },
  { rank: 7, user_id: "u7", display_name: "Sunita Magar",    avatar_emoji: "🌿", xp: 1200,  level: 2, level_name: "Hill Walker",       treks_completed: 2,  nfts_minted: 1,  highest_altitude: 3210, badges: ["🥾 First Trek","🎖️ NFT Collector"] },
  { rank: 8, user_id: "u8", display_name: "Dipesh Tamang",   avatar_emoji: "🧭", xp: 700,   level: 2, level_name: "Hill Walker",       treks_completed: 1,  nfts_minted: 1,  highest_altitude: 3210, badges: ["🥾 First Trek","🎖️ NFT Collector"] },
  { rank: 9, user_id: "u9", display_name: "Anita Shrestha",  avatar_emoji: "🏕️", xp: 500,   level: 1, level_name: "Trail Starter",     treks_completed: 1,  nfts_minted: 0,  highest_altitude: 2800, badges: ["🥾 First Trek"] },
  { rank:10, user_id:"u10", display_name: "Kiran Bhandari",  avatar_emoji: "🦁", xp: 200,   level: 1, level_name: "Trail Starter",     treks_completed: 0,  nfts_minted: 0,  highest_altitude: 0,    badges: [] },
];

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ leaderboard: DEMO_BOARD, source: "demo" });
    }

    // Pull users with their booking/proof counts
    const { data: users } = await supabase
      .from("users")
      .select("id,display_name,email")
      .eq("role", "tourist")
      .limit(50);

    if (!users || users.length === 0) {
      return NextResponse.json({ leaderboard: DEMO_BOARD, source: "demo" });
    }

    const userIds = users.map((u) => u.id);

    const [bookingsRes, proofsRes, checkinsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("tourist_id,status,route_id")
        .in("tourist_id", userIds)
        .eq("status", "completed"),
      supabase
        .from("completion_proofs")
        .select("user_id")
        .in("user_id", userIds),
      supabase
        .from("check_ins")
        .select("user_id")
        .in("user_id", userIds),
    ]);

    // Count per user
    const trekCount: Record<string, number> = {};
    const nftCount: Record<string, number> = {};
    const checkinCount: Record<string, number> = {};

    for (const b of bookingsRes.data ?? []) {
      trekCount[b.tourist_id] = (trekCount[b.tourist_id] ?? 0) + 1;
    }
    for (const p of proofsRes.data ?? []) {
      nftCount[p.user_id] = (nftCount[p.user_id] ?? 0) + 1;
    }
    for (const c of checkinsRes.data ?? []) {
      checkinCount[c.user_id] = (checkinCount[c.user_id] ?? 0) + 1;
    }

    const entries: LeaderboardEntry[] = users.map((u, i) => {
      const treks = trekCount[u.id] ?? 0;
      const nfts = nftCount[u.id] ?? 0;
      const checkins = checkinCount[u.id] ?? 0;
      const xp = treks * XP_PER_TREK + nfts * XP_PER_NFT + checkins * XP_PER_CHECKIN;
      const { level, name: levelName } = getLevel(xp);
      const displayName = u.display_name ?? u.email?.split("@")[0] ?? `Trekker ${i + 1}`;

      return {
        rank: 0,
        user_id: u.id,
        display_name: displayName,
        avatar_emoji: AVATARS[i % AVATARS.length],
        xp,
        level,
        level_name: levelName,
        treks_completed: treks,
        nfts_minted: nfts,
        highest_altitude: 0,
        badges: getBadges(treks, nfts, 0),
      };
    });

    entries.sort((a, b) => b.xp - a.xp);
    entries.forEach((e, i) => { e.rank = i + 1; });

    const board = entries.length >= 3 ? entries : DEMO_BOARD;
    return NextResponse.json({ leaderboard: board.slice(0, 20), source: entries.length >= 3 ? "live" : "demo" });
  } catch {
    return NextResponse.json({ leaderboard: DEMO_BOARD, source: "demo" });
  }
}

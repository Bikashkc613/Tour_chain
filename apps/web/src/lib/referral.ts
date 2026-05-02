/**
 * Referral code utilities
 * Codes are deterministic: base58(userId.slice(0,8)) — no DB needed for generation
 */

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function generateReferralCode(userId: string): string {
  // Take first 8 chars of userId, map each hex nibble to base58
  const seed = userId.replace(/-/g, "").slice(0, 8);
  let code = "";
  for (let i = 0; i < seed.length; i++) {
    const n = parseInt(seed[i], 16);
    code += BASE58[n % BASE58.length];
  }
  return code.toUpperCase().slice(0, 6);
}

export function buildReferralUrl(code: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "https://tourism-chain-nepal.vercel.app");
  return `${base}/signup?ref=${code}`;
}

export const REFERRAL_REWARDS = {
  referrer_xp: 500,       // XP for the person who referred
  referee_xp: 200,        // XP bonus for the new signup
  referrer_discount_pct: 10, // % discount on next booking
  referee_discount_pct: 5,   // % discount for new user
};

export type SharePlatform = "twitter" | "facebook" | "whatsapp" | "telegram" | "copy";

export function buildShareUrl(platform: SharePlatform, text: string, url: string): string {
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  switch (platform) {
    case "twitter":   return `https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`;
    case "facebook":  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "whatsapp":  return `https://wa.me/?text=${encoded}%20${encodedUrl}`;
    case "telegram":  return `https://t.me/share/url?url=${encodedUrl}&text=${encoded}`;
    default:          return url;
  }
}

export function buildAchievementShareText(routeName: string, xp: number, rank?: number): string {
  const rankText = rank ? ` I'm ranked #${rank} on the leaderboard!` : "";
  return `🏔️ Just completed the ${routeName} trek on Tourism Chain Nepal — verified on Solana blockchain! Earned ${xp} XP.${rankText} #TourismChainNepal #Solana #Nepal`;
}

export function buildReferralShareText(code: string): string {
  return `🧗 Join me on Tourism Chain Nepal — the first blockchain-verified trekking platform! Use my referral code ${code} for a 5% discount on your first trek. #TourismChainNepal #Nepal`;
}

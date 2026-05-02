import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

type Ctx = { params: Promise<{ id: string }> };

const DEMO_LB: Record<string, { rank: number; display_name: string; avatar: string; progress: number; target: number; pct: number }[]> = {
  c1: [
    { rank: 1, display_name: "Pemba Sherpa",  avatar: "🦅", progress: 48, target: 50,   pct: 96 },
    { rank: 2, display_name: "Aarav Thapa",   avatar: "🏔️", progress: 42, target: 50,   pct: 84 },
    { rank: 3, display_name: "Sita Gurung",   avatar: "🌄", progress: 38, target: 50,   pct: 76 },
    { rank: 4, display_name: "Bikram Rai",    avatar: "⛰️", progress: 31, target: 50,   pct: 62 },
    { rank: 5, display_name: "Nima Dolma",    avatar: "🧗", progress: 25, target: 50,   pct: 50 },
  ],
  c2: [
    { rank: 1, display_name: "Rajesh Karki",  avatar: "🗺️", progress: 5000, target: 5000, pct: 100 },
    { rank: 2, display_name: "Sunita Magar",  avatar: "🌿", progress: 4800, target: 5000, pct: 96  },
    { rank: 3, display_name: "Dipesh Tamang", avatar: "🧭", progress: 4200, target: 5000, pct: 84  },
  ],
  c3: [
    { rank: 1, display_name: "Anita Shrestha",avatar: "🏕️", progress: 3, target: 3, pct: 100 },
    { rank: 2, display_name: "Kiran Bhandari",avatar: "🦁", progress: 2, target: 3, pct: 67  },
    { rank: 3, display_name: "Pemba Sherpa",  avatar: "🦅", progress: 1, target: 3, pct: 33  },
  ],
  c4: [
    { rank: 1, display_name: "Aarav Thapa",   avatar: "🏔️", progress: 5, target: 5, pct: 100 },
    { rank: 2, display_name: "Sita Gurung",   avatar: "🌄", progress: 4, target: 5, pct: 80  },
    { rank: 3, display_name: "Bikram Rai",    avatar: "⛰️", progress: 3, target: 5, pct: 60  },
  ],
  c5: [],
  c6: [
    { rank: 1, display_name: "Nima Dolma",    avatar: "🧗", progress: 9,  target: 10, pct: 90 },
    { rank: 2, display_name: "Rajesh Karki",  avatar: "🗺️", progress: 7,  target: 10, pct: 70 },
    { rank: 3, display_name: "Sunita Magar",  avatar: "🌿", progress: 5,  target: 10, pct: 50 },
  ],
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  if (supabase) {
    const service = createServiceClient();
    const { data: challenge } = await service
      .from("challenges")
      .select("target_value")
      .eq("id", id)
      .maybeSingle();

    if (challenge) {
      const { data: participants } = await service
        .from("challenge_participants")
        .select("user_id, current_progress, status")
        .eq("challenge_id", id)
        .order("current_progress", { ascending: false })
        .limit(20);

      if (participants?.length) {
        const userIds = participants.map((p) => p.user_id);
        const { data: users } = await service
          .from("users")
          .select("id,display_name,email")
          .in("id", userIds);

        const userMap = new Map((users ?? []).map((u) => [u.id, u]));
        const AVATARS = ["🧗","🏔️","🌄","⛰️","🦅","🏕️","🗺️","🧭","🌿","🦁"];

        const leaderboard = participants.map((p, i) => {
          const u = userMap.get(p.user_id);
          return {
            rank: i + 1,
            display_name: u?.display_name ?? u?.email?.split("@")[0] ?? `Trekker ${i+1}`,
            avatar: AVATARS[i % AVATARS.length],
            progress: p.current_progress,
            target: challenge.target_value,
            pct: Math.min(100, Math.round((p.current_progress / challenge.target_value) * 100)),
            status: p.status,
          };
        });

        return jsonOk({ leaderboard, source: "live" });
      }
    }
  }

  // Demo fallback
  const demoLb = DEMO_LB[id] ?? DEMO_LB.c1;
  return jsonOk({ leaderboard: demoLb, source: "demo" });
}

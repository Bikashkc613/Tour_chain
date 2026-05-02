import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

type Ctx = { params: Promise<{ id: string }> };

// ── Demo stories (mirrors the list in /api/stories/route.ts) ──────────────
const DEMO_STORIES = [
  {
    id: "s1",
    slug: "my-first-ebc-trek",
    title: "My First EBC Trek — A Life-Changing Journey",
    excerpt: "Standing at 5364m, looking up at the world's highest peak, I understood why people dedicate their lives to the mountains.",
    content: `# My First EBC Trek — A Life-Changing Journey

Standing at 5364m, looking up at the world's highest peak, I finally understood why people dedicate their lives to the mountains.

## Day 1 — Arrival in Kathmandu

The moment I landed at Tribhuvan International Airport, the energy was electric. Kathmandu is chaotic, colourful, and completely overwhelming in the best possible way. I spent the first day acclimatising, visiting Boudhanath Stupa, and eating the best dal bhat of my life.

## Day 3 — The Flight to Lukla

The Lukla airport is famously one of the most dangerous in the world. The runway is short, tilted, and ends at a cliff. Our Twin Otter banked hard left and dropped onto the tarmac with a thud. Everyone clapped.

## Day 7 — Namche Bazaar

Namche is the gateway to the Khumbu. At 3440m, it's where altitude starts to bite. I spent two nights here acclimatising, hiking up to the Everest View Hotel for my first glimpse of the summit.

## Day 12 — Everest Base Camp

The final push to Base Camp is deceptively hard. The trail winds through the Khumbu Glacier, past prayer flags and memorial cairns. When I finally reached the sign, I sat down and cried.

## Tips for Future Trekkers

- **Acclimatise properly** — don't rush. The mountain will wait.
- **Hire a licensed guide** — it's worth every rupee.
- **Pack layers** — temperatures swing 30°C between day and night.
- **Drink 4L of water daily** — altitude dehydration is real.
- **Use Tourism Chain Nepal** — the blockchain check-ins gave me total peace of mind.

## Cost Breakdown

| Item | Cost (USD) |
|------|-----------|
| Flights (KTM–Lukla return) | $350 |
| TIMS + Sagarmatha permit | $50 |
| Guide (14 days) | $420 |
| Tea houses (14 nights) | $280 |
| Food & drinks | $200 |
| **Total** | **~$1,300** |

This trek changed my life. I came back a different person — humbler, stronger, and completely addicted to the mountains.`,
    cover_image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80",
    difficulty: "challenging",
    season: "autumn",
    duration_days: 14,
    cost_usd: 1300,
    upvotes: 247,
    downvotes: 3,
    views: 3421,
    is_featured: true,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    author_id: "demo-author-1",
    route_id: null,
    tags: ["EBC", "Khumbu", "Everest", "Beginner"],
    author: { display_name: "Sarah M.", id: "demo-author-1" },
  },
  {
    id: "s2",
    slug: "annapurna-circuit-solo",
    title: "Annapurna Circuit Solo — Tips Nobody Tells You",
    excerpt: "15 days, 160km, and one very sore pair of knees. Here's everything I wish I'd known before attempting the circuit solo.",
    content: `# Annapurna Circuit Solo — Tips Nobody Tells You

15 days, 160km, and one very sore pair of knees. Here's everything I wish I'd known before attempting the Annapurna Circuit solo.

## The Route

The classic circuit goes from Besisahar to Nayapul, crossing the Thorong La Pass at 5416m. It's one of the world's great treks — diverse landscapes, rich culture, and the highest pass most trekkers will ever cross.

## What Nobody Tells You

### 1. The Jeep Road is Depressing
Large sections of the lower circuit have been replaced by a jeep road. It's dusty, noisy, and soul-destroying. Take the high route whenever possible.

### 2. Thorong La is Brutal
Start at 3am. No exceptions. By 10am, the wind picks up and visibility drops. I saw three people turn back at the tea house below the pass.

### 3. Manang is Magic
Spend three nights in Manang, not two. The acclimatisation hike to Ice Lake is one of the best days of the entire trek.

### 4. The Food Gets Better
Contrary to popular belief, the food quality improves as you go higher. The apple pie in Manang is legendary.

## Solo Safety Tips

- Register with your embassy before departing
- Share your itinerary with someone at home
- Use the Tourism Chain Nepal app — the GPS check-ins mean someone always knows where you are
- Carry a personal locator beacon above 4000m

## Final Verdict

The Annapurna Circuit is still one of the world's great treks, jeep road and all. Do it before the road reaches Thorong La.`,
    cover_image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
    difficulty: "challenging",
    season: "spring",
    duration_days: 15,
    cost_usd: 900,
    upvotes: 189,
    downvotes: 5,
    views: 2811,
    is_featured: true,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    author_id: "demo-author-2",
    route_id: null,
    tags: ["Annapurna", "Solo", "Tips", "Circuit"],
    author: { display_name: "Yuki T.", id: "demo-author-2" },
  },
  {
    id: "s3",
    slug: "poon-hill-sunrise",
    title: "Poon Hill Sunrise — Worth Every Step",
    excerpt: "The 4am wake-up call felt brutal. But when the Annapurna range turned gold at sunrise, every step was worth it.",
    content: `# Poon Hill Sunrise — Worth Every Step

The alarm went off at 3:45am. Outside, it was pitch black and -5°C. Every part of me wanted to stay in my sleeping bag.

I'm so glad I didn't.

## The Trek

Poon Hill (3210m) is Nepal's most popular short trek — and for good reason. In just 4 days from Pokhara, you get panoramic views of Dhaulagiri, Annapurna South, Machhapuchhre (Fishtail), and on a clear day, Annapurna I.

## Day by Day

**Day 1:** Nayapul → Tikhedhunga (1540m). A gentle warm-up through terraced fields and rhododendron forests.

**Day 2:** Tikhedhunga → Ghorepani (2860m). The famous stone staircase. 3,000 steps. Worth it.

**Day 3:** Sunrise at Poon Hill, then Ghorepani → Tadapani. The best day of the trek.

**Day 4:** Tadapani → Ghandruk → Nayapul. A beautiful descent through the Gurung village of Ghandruk.

## The Sunrise

We left at 4:15am with headtorches. The trail was icy. By the time we reached the viewpoint, there were maybe 200 people already there.

Then the sun hit Dhaulagiri. The mountain turned from grey to pink to gold in about 90 seconds. Nobody spoke. A few people cried.

## Perfect For

- First-time trekkers
- Families with older children
- Anyone with limited time (4 days from Pokhara)
- Budget trekkers ($350 all-in is very achievable)`,
    cover_image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    difficulty: "easy",
    season: "winter",
    duration_days: 4,
    cost_usd: 350,
    upvotes: 312,
    downvotes: 2,
    views: 5101,
    is_featured: false,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    author_id: "demo-author-3",
    route_id: null,
    tags: ["PoonHill", "Sunrise", "Beginner", "Annapurna"],
    author: { display_name: "Priya S.", id: "demo-author-3" },
  },
  {
    id: "s4",
    slug: "langtang-valley-rebuild",
    title: "Langtang Valley After the Earthquake — Rebuilding Together",
    excerpt: "Trekking through Langtang in 2024 was a humbling experience. The community's resilience is extraordinary.",
    content: `# Langtang Valley After the Earthquake — Rebuilding Together

In April 2015, a massive avalanche triggered by the Gorkha earthquake buried the village of Langtang. Over 300 people died. The entire village was destroyed in seconds.

Nine years later, I trekked through Langtang Valley. What I found was extraordinary.

## The Valley Today

The new Langtang village has been rebuilt — not in the same location, but on safer ground nearby. The tea houses are modern, the trails are well-maintained, and the community is thriving.

But the scars remain. Memorial stupas line the trail. Plaques bear the names of those lost. The old village site is now a sacred place, marked by prayer flags.

## Why You Should Go

Langtang is one of Nepal's most underrated treks. Just 3-4 hours from Kathmandu by bus, it offers:

- Stunning views of Langtang Lirung (7227m)
- Authentic Tamang culture
- Excellent yak cheese (seriously, it's incredible)
- Far fewer tourists than Annapurna or Khumbu

## Supporting the Community

Every rupee you spend in Langtang goes directly to families rebuilding their lives. Stay in locally-owned tea houses. Hire local guides. Buy local products.

The Langtang community doesn't need your pity. They need your business.

## Practical Info

- **Best season:** March-May, October-November
- **Duration:** 7-10 days
- **Difficulty:** Moderate
- **Cost:** ~$600 all-in
- **Permit:** Langtang National Park entry fee ($30)`,
    cover_image_url: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1200&q=80",
    difficulty: "moderate",
    season: "autumn",
    duration_days: 8,
    cost_usd: 600,
    upvotes: 156,
    downvotes: 1,
    views: 1891,
    is_featured: false,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 31).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    author_id: "demo-author-4",
    route_id: null,
    tags: ["Langtang", "Culture", "Community", "Moderate"],
    author: { display_name: "James K.", id: "demo-author-4" },
  },
];

const DEMO_COMMENTS: Record<string, { id: string; content: string; author_name: string; created_at: string; upvotes: number }[]> = {
  s1: [
    { id: "c1", content: "This is exactly the guide I needed before my EBC trip next month. Thank you!", author_name: "Marco R.", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), upvotes: 12 },
    { id: "c2", content: "The cost breakdown is super helpful. Did you use a porter as well?", author_name: "Aiko T.", created_at: new Date(Date.now() - 86400000 * 3).toISOString(), upvotes: 5 },
  ],
  s2: [
    { id: "c3", content: "The jeep road section is so disappointing. Totally agree about taking the high route.", author_name: "Lena K.", created_at: new Date(Date.now() - 86400000 * 8).toISOString(), upvotes: 8 },
  ],
  s3: [
    { id: "c4", content: "Poon Hill was my first trek in Nepal. Your description of the sunrise is perfect.", author_name: "David M.", created_at: new Date(Date.now() - 86400000 * 15).toISOString(), upvotes: 22 },
    { id: "c5", content: "Going next month! Any tips on which tea house to stay at in Ghorepani?", author_name: "Sofia B.", created_at: new Date(Date.now() - 86400000 * 18).toISOString(), upvotes: 3 },
  ],
  s4: [
    { id: "c6", content: "Thank you for writing this. The Langtang community deserves more visitors.", author_name: "Pemba S.", created_at: new Date(Date.now() - 86400000 * 25).toISOString(), upvotes: 31 },
  ],
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  // ── Try Supabase first ────────────────────────────────────────
  const supabase = await createClient();
  if (supabase) {
    const service = createServiceClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = service.from("stories").select("*");
    const { data: story } = await (isUuid ? query.eq("id", id) : query.eq("slug", id)).maybeSingle();

    if (story) {
      // Increment views
      await service.from("stories").update({ views: (story.views ?? 0) + 1 }).eq("id", story.id);

      const [tagsRes, authorRes, commentsRes] = await Promise.all([
        service.from("story_tags").select("tag").eq("story_id", story.id),
        service.from("users").select("id,display_name,email").eq("id", story.author_id).maybeSingle(),
        service.from("story_comments").select("*").eq("story_id", story.id).is("parent_comment_id", null).order("created_at", { ascending: false }).limit(20),
      ]);

      const userIds = [...new Set((commentsRes.data ?? []).map((c) => c.user_id).filter(Boolean))];
      const { data: commentUsers } = userIds.length
        ? await service.from("users").select("id,display_name,email").in("id", userIds)
        : { data: [] };
      const userMap = new Map((commentUsers ?? []).map((u) => [u.id, u]));

      return jsonOk({
        story: {
          ...story,
          tags: (tagsRes.data ?? []).map((t) => t.tag),
          author: authorRes.data
            ? { display_name: authorRes.data.display_name ?? authorRes.data.email?.split("@")[0], id: authorRes.data.id }
            : null,
        },
        comments: (commentsRes.data ?? []).map((c) => {
          const u = userMap.get(c.user_id);
          return { ...c, author_name: u?.display_name ?? u?.email?.split("@")[0] ?? "Trekker" };
        }),
      });
    }
  }

  // ── Fall back to demo data ────────────────────────────────────
  const demo = DEMO_STORIES.find((s) => s.id === id || s.slug === id);
  if (!demo) return jsonError(404, "not_found", "Story not found");

  return jsonOk({
    story: demo,
    comments: DEMO_COMMENTS[demo.id] ?? [],
  });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonError } from "@/lib/api/response";

const DEMO_STORIES = [
  { id: "s1", title: "My First EBC Trek — A Life-Changing Journey", slug: "my-first-ebc-trek", excerpt: "Standing at 5364m, looking up at the world's highest peak, I understood why people dedicate their lives to the mountains.", cover_image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80", difficulty: "challenging", season: "autumn", duration_days: 14, cost_usd: 1200, upvotes: 247, views: 3420, is_featured: true, published_at: new Date(Date.now()-86400000*5).toISOString(), author: { display_name: "Sarah M.", avatar: "🇺🇸" }, tags: ["EBC","Khumbu","Everest"] },
  { id: "s2", title: "Annapurna Circuit Solo — Tips Nobody Tells You", slug: "annapurna-circuit-solo", excerpt: "15 days, 160km, and one very sore pair of knees. Here's everything I wish I'd known before attempting the circuit solo.", cover_image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", difficulty: "challenging", season: "spring", duration_days: 15, cost_usd: 900, upvotes: 189, views: 2810, is_featured: true, published_at: new Date(Date.now()-86400000*12).toISOString(), author: { display_name: "Yuki T.", avatar: "🇯🇵" }, tags: ["Annapurna","Solo","Tips"] },
  { id: "s3", title: "Poon Hill Sunrise — Worth Every Step", slug: "poon-hill-sunrise", excerpt: "The 4am wake-up call felt brutal. But when the Annapurna range turned gold at sunrise, every step was worth it.", cover_image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", difficulty: "easy", season: "winter", duration_days: 4, cost_usd: 350, upvotes: 312, views: 5100, is_featured: false, published_at: new Date(Date.now()-86400000*20).toISOString(), author: { display_name: "Priya S.", avatar: "🇮🇳" }, tags: ["PoonHill","Sunrise","Beginner"] },
  { id: "s4", title: "Langtang Valley After the Earthquake — Rebuilding Together", slug: "langtang-valley-rebuild", excerpt: "Trekking through Langtang in 2024 was a humbling experience. The community's resilience is extraordinary.", cover_image_url: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&q=80", difficulty: "moderate", season: "autumn", duration_days: 8, cost_usd: 600, upvotes: 156, views: 1890, is_featured: false, published_at: new Date(Date.now()-86400000*30).toISOString(), author: { display_name: "James K.", avatar: "🇬🇧" }, tags: ["Langtang","Culture","Community"] },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "recent";
  const difficulty = searchParams.get("difficulty");
  const season = searchParams.get("season");
  const featured = searchParams.get("featured");
  const search = searchParams.get("q");

  const supabase = await createClient();
  if (!supabase) return jsonOk({ stories: DEMO_STORIES, source: "demo" });

  let query = supabase
    .from("stories")
    .select("id,title,slug,excerpt,cover_image_url,difficulty,season,duration_days,cost_usd,upvotes,views,is_featured,published_at,author_id")
    .eq("is_published", true);

  if (difficulty) query = query.eq("difficulty", difficulty);
  if (season) query = query.eq("season", season);
  if (featured === "true") query = query.eq("is_featured", true);
  if (search) query = query.ilike("title", `%${search}%`);

  if (sort === "popular") query = query.order("upvotes", { ascending: false });
  else if (sort === "trending") query = query.order("views", { ascending: false });
  else query = query.order("published_at", { ascending: false });

  const { data, error } = await query.limit(20);
  if (error || !data?.length) return jsonOk({ stories: DEMO_STORIES, source: "demo" });

  return jsonOk({ stories: data, source: "live" });
}

const CreateStorySchema = z.object({
  title:           z.string().min(5).max(200),
  content:         z.string().min(50),
  excerpt:         z.string().max(300).optional(),
  cover_image_url: z.string().url().optional(),
  route_id:        z.string().uuid().optional(),
  difficulty:      z.string().optional(),
  season:          z.string().optional(),
  duration_days:   z.number().int().positive().optional(),
  cost_usd:        z.number().nonnegative().optional(),
  tags:            z.array(z.string()).optional(),
  is_published:    z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return jsonError(503, "unavailable", "Service unavailable");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError(401, "unauthorized", "Unauthorized");

  const parsed = CreateStorySchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(400, "validation_error", "Invalid input", parsed.error.flatten());

  const { tags, ...storyData } = parsed.data;
  const slug = storyData.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Date.now().toString(36);

  const service = createServiceClient();
  const { data: story, error } = await service
    .from("stories")
    .insert({
      ...storyData,
      author_id: user.id,
      slug,
      published_at: storyData.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return jsonError(500, "db_error", error.message);

  // Insert tags
  if (tags?.length && story) {
    await service.from("story_tags").insert(tags.map((tag) => ({ story_id: story.id, tag })));
  }

  return jsonOk({ story }, { status: 201 });
}

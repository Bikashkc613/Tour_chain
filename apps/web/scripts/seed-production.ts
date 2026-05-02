/**
 * seed-production.ts
 * Pushes demo routes, places, guides, services, and stories
 * directly to the production Supabase via the service-role key.
 *
 * Run:  npx tsx scripts/seed-production.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsert(table: string, rows: object[], conflict = "id") {
  const { error } = await sb.from(table).upsert(rows as never[], { onConflict: conflict, ignoreDuplicates: true });
  if (error) console.warn(`  ⚠  ${table}: ${error.message}`);
  else       console.log(`  ✓  ${table} (${rows.length} rows)`);
}

// ── data ─────────────────────────────────────────────────────────────────────

const ROUTES = [
  {
    id: "a1b2c3d4-0001-0001-0001-000000000001",
    name: "Everest Base Camp",
    region: "Khumbu",
    difficulty: "challenging",
    duration_days: 14,
    max_altitude_meters: 5364,
    image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80",
    description: "The world's most iconic trek. Walk in the footsteps of legends to the base of the highest mountain on Earth.",
    is_active: true,
  },
  {
    id: "a1b2c3d4-0002-0002-0002-000000000002",
    name: "Annapurna Circuit",
    region: "Annapurna",
    difficulty: "challenging",
    duration_days: 15,
    max_altitude_meters: 5416,
    image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
    description: "A classic circumnavigation of the Annapurna massif crossing the legendary Thorong La pass at 5,416m.",
    is_active: true,
  },
  {
    id: "a1b2c3d4-0003-0003-0003-000000000003",
    name: "Poon Hill Sunrise Trek",
    region: "Annapurna",
    difficulty: "easy",
    duration_days: 4,
    max_altitude_meters: 3210,
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    description: "Nepal's most popular short trek. Witness a breathtaking sunrise over the Annapurna and Dhaulagiri ranges.",
    is_active: true,
  },
  {
    id: "a1b2c3d4-0004-0004-0004-000000000004",
    name: "Langtang Valley",
    region: "Langtang",
    difficulty: "moderate",
    duration_days: 8,
    max_altitude_meters: 4984,
    image_url: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1200&q=80",
    description: "The valley of glaciers. A serene trek through rhododendron forests and Tamang villages close to Kathmandu.",
    is_active: true,
  },
  {
    id: "a1b2c3d4-0005-0005-0005-000000000005",
    name: "Mardi Himal Trek",
    region: "Annapurna",
    difficulty: "moderate",
    duration_days: 6,
    max_altitude_meters: 4500,
    image_url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&q=80",
    description: "A hidden gem off the beaten path. Stunning close-up views of Machhapuchhre (Fishtail) and Mardi Himal.",
    is_active: true,
  },
  {
    id: "a1b2c3d4-0006-0006-0006-000000000006",
    name: "Manaslu Circuit",
    region: "Gorkha",
    difficulty: "extreme",
    duration_days: 16,
    max_altitude_meters: 5106,
    image_url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80",
    description: "A remote and challenging circuit around the world's eighth highest mountain. Restricted area permit required.",
    is_active: true,
  },
];

const PLACES = [
  // EBC checkpoints
  { id: "p001", name: "Lukla Airport",       latitude: 27.6869, longitude: 86.7314, description: "Gateway to the Khumbu — the world's most thrilling airport landing." },
  { id: "p002", name: "Namche Bazaar",       latitude: 27.8069, longitude: 86.7139, description: "The Sherpa capital at 3,440m. Acclimatisation stop and trekking hub." },
  { id: "p003", name: "Tengboche Monastery", latitude: 27.8361, longitude: 86.7639, description: "Sacred monastery with a jaw-dropping view of Ama Dablam and Everest." },
  { id: "p004", name: "Dingboche",           latitude: 27.8939, longitude: 86.8306, description: "High-altitude village at 4,410m. Second acclimatisation day here." },
  { id: "p005", name: "Everest Base Camp",   latitude: 28.0025, longitude: 86.8528, description: "The legendary base camp at 5,364m. The end goal of the EBC trek." },
  // Annapurna checkpoints
  { id: "p006", name: "Pokhara",             latitude: 28.2096, longitude: 83.9856, description: "Nepal's adventure capital. Starting point for Annapurna treks." },
  { id: "p007", name: "Ghorepani",           latitude: 28.3997, longitude: 83.6997, description: "Village at 2,860m. Base for the famous Poon Hill sunrise hike." },
  { id: "p008", name: "Poon Hill",           latitude: 28.4006, longitude: 83.6931, description: "Iconic viewpoint at 3,210m. Best sunrise panorama in Nepal." },
  { id: "p009", name: "Thorong La Pass",     latitude: 28.7997, longitude: 83.9331, description: "The highest point of the Annapurna Circuit at 5,416m." },
  { id: "p010", name: "Muktinath Temple",    latitude: 28.8167, longitude: 83.8722, description: "Sacred Hindu and Buddhist pilgrimage site at 3,710m." },
  // Langtang checkpoints
  { id: "p011", name: "Syabrubesi",          latitude: 28.1597, longitude: 85.3481, description: "Starting village for the Langtang Valley trek at 1,503m." },
  { id: "p012", name: "Langtang Village",    latitude: 28.2139, longitude: 85.5167, description: "Rebuilt Tamang village at 3,430m after the 2015 earthquake." },
  { id: "p013", name: "Kyanjin Gompa",       latitude: 28.2122, longitude: 85.5636, description: "Ancient monastery at 3,870m with views of Langtang Lirung." },
  // Manaslu checkpoints
  { id: "p014", name: "Soti Khola",          latitude: 28.3667, longitude: 84.8833, description: "Starting point of the Manaslu Circuit at 730m." },
  { id: "p015", name: "Larkya La Pass",      latitude: 28.6833, longitude: 84.6167, description: "The high point of the Manaslu Circuit at 5,106m." },
];

const GUIDE_USER_ID = "b0000000-0000-0000-0000-000000000001";
const GUIDE_USER_ID2 = "b0000000-0000-0000-0000-000000000002";
const GUIDE_USER_ID3 = "b0000000-0000-0000-0000-000000000003";

const USERS = [
  {
    id: GUIDE_USER_ID,
    email: "pemba.sherpa@tourchain.demo",
    display_name: "Pemba Sherpa",
    role: "guide",
    wallet_address: null,
  },
  {
    id: GUIDE_USER_ID2,
    email: "aarav.thapa@tourchain.demo",
    display_name: "Aarav Thapa",
    role: "guide",
    wallet_address: null,
  },
  {
    id: GUIDE_USER_ID3,
    email: "sita.gurung@tourchain.demo",
    display_name: "Sita Gurung",
    role: "guide",
    wallet_address: null,
  },
];

const SERVICES = [
  // EBC services
  {
    id: "s001",
    guide_id: GUIDE_USER_ID,
    route_id: "a1b2c3d4-0001-0001-0001-000000000001",
    title: "Budget Trek Package",
    price_usd: 199,
  },
  {
    id: "s002",
    guide_id: GUIDE_USER_ID,
    route_id: "a1b2c3d4-0001-0001-0001-000000000001",
    title: "Standard Guide + Porter",
    price_usd: 349,
  },
  {
    id: "s003",
    guide_id: GUIDE_USER_ID,
    route_id: "a1b2c3d4-0001-0001-0001-000000000001",
    title: "Premium All-Inclusive",
    price_usd: 699,
  },
  {
    id: "s004",
    guide_id: GUIDE_USER_ID,
    route_id: "a1b2c3d4-0001-0001-0001-000000000001",
    title: "Luxury Summit Experience",
    price_usd: 1299,
  },
  // Annapurna Circuit services
  {
    id: "s005",
    guide_id: GUIDE_USER_ID2,
    route_id: "a1b2c3d4-0002-0002-0002-000000000002",
    title: "Budget Trek Package",
    price_usd: 199,
  },
  {
    id: "s006",
    guide_id: GUIDE_USER_ID2,
    route_id: "a1b2c3d4-0002-0002-0002-000000000002",
    title: "Standard Guide + Porter",
    price_usd: 349,
  },
  {
    id: "s007",
    guide_id: GUIDE_USER_ID2,
    route_id: "a1b2c3d4-0002-0002-0002-000000000002",
    title: "Premium All-Inclusive",
    price_usd: 699,
  },
  {
    id: "s008",
    guide_id: GUIDE_USER_ID2,
    route_id: "a1b2c3d4-0002-0002-0002-000000000002",
    title: "Luxury Summit Experience",
    price_usd: 1299,
  },
  // Poon Hill services
  {
    id: "s009",
    guide_id: GUIDE_USER_ID3,
    route_id: "a1b2c3d4-0003-0003-0003-000000000003",
    title: "Budget Trek Package",
    price_usd: 99,
  },
  {
    id: "s010",
    guide_id: GUIDE_USER_ID3,
    route_id: "a1b2c3d4-0003-0003-0003-000000000003",
    title: "Standard Guide + Porter",
    price_usd: 199,
  },
  // Global fallback services (no route_id)
  {
    id: "s011",
    guide_id: GUIDE_USER_ID,
    route_id: null,
    title: "Budget Trek Package",
    price_usd: 199,
  },
  {
    id: "s012",
    guide_id: GUIDE_USER_ID,
    route_id: null,
    title: "Standard Guide + Porter",
    price_usd: 349,
  },
  {
    id: "s013",
    guide_id: GUIDE_USER_ID,
    route_id: null,
    title: "Premium All-Inclusive",
    price_usd: 699,
  },
  {
    id: "s014",
    guide_id: GUIDE_USER_ID,
    route_id: null,
    title: "Luxury Summit Experience",
    price_usd: 1299,
  },
];

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding TourChain production database…\n");
  console.log(`   URL: ${SUPABASE_URL}\n`);

  // 1. Users (guides) — insert only, skip if exists
  await upsert("users", USERS, "id");

  // 2. Routes
  await upsert("routes", ROUTES, "id");

  // 3. Places
  await upsert("places", PLACES, "id");

  // 4. Services
  await upsert("services", SERVICES, "id");

  // 5. Verify counts
  console.log("\n📊  Verifying counts…");
  for (const table of ["routes", "places", "services", "users"]) {
    const { count } = await sb.from(table).select("*", { count: "exact", head: true });
    console.log(`   ${table}: ${count ?? 0} rows`);
  }

  console.log("\n✅  Seed complete! Refresh https://tour-chain.vercel.app/explore");
}

main().catch((e) => { console.error(e); process.exit(1); });

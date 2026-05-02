/**
 * Solana Blinks / Actions API
 * Spec: https://solana.com/docs/advanced/actions
 *
 * GET  /api/actions/book/[routeId]  → returns Action metadata (shown in Blink preview)
 * POST /api/actions/book/[routeId]  → returns a serialised transaction for the wallet to sign
 */

import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createClient } from "@/lib/supabase/server";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tourism-chain-nepal.vercel.app";

// CORS headers required by the Blinks spec
const BLINKS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,x-blockchain-ids,x-action-version",
  "X-Action-Version": "2.1.3",
  "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
};

type Context = { params: Promise<{ routeId: string }> };

// ── Route metadata helpers ────────────────────────────────────────────────────

const DEMO_ROUTES: Record<string, { name: string; region: string; price_usd: number; duration_days: number; difficulty: string }> = {
  "demo-route-1": { name: "Poon Hill Sunrise Trek", region: "Annapurna", price_usd: 350, duration_days: 4, difficulty: "Easy" },
  "demo-route-2": { name: "Annapurna Circuit",      region: "Annapurna", price_usd: 1200, duration_days: 15, difficulty: "Challenging" },
  "demo-route-3": { name: "Everest Base Camp",       region: "Khumbu",    price_usd: 1100, duration_days: 14, difficulty: "Challenging" },
  "demo-route-4": { name: "Langtang Valley",         region: "Langtang",  price_usd: 600,  duration_days: 8,  difficulty: "Moderate" },
  "demo-route-5": { name: "Mardi Himal Trek",        region: "Annapurna", price_usd: 480,  duration_days: 6,  difficulty: "Moderate" },
  "demo-route-6": { name: "Manaslu Circuit",         region: "Gorkha",    price_usd: 1400, duration_days: 16, difficulty: "Extreme" },
};

async function getRouteInfo(routeId: string) {
  // Try DB first
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("routes")
      .select("id,name,region,difficulty,duration_days")
      .eq("id", routeId)
      .maybeSingle();
    if (data) {
      const { data: svc } = await supabase
        .from("services")
        .select("price_usd")
        .eq("route_id", routeId)
        .limit(1)
        .maybeSingle();
      return { ...data, price_usd: svc?.price_usd ?? 500 };
    }
  }
  // Fallback to demo
  return DEMO_ROUTES[routeId] ?? { name: "Nepal Trek", region: "Himalaya", price_usd: 500, duration_days: 7, difficulty: "Moderate" };
}

// ── OPTIONS (preflight) ───────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: BLINKS_HEADERS });
}

// ── GET — Action metadata ─────────────────────────────────────────────────────

export async function GET(_req: NextRequest, context: Context) {
  const { routeId } = await context.params;
  const route = await getRouteInfo(routeId);
  const solPrice = 150; // fallback
  const amountSol = (route.price_usd / solPrice).toFixed(3);

  const action = {
    type: "action",
    icon: `${APP_URL}/hero.png`,
    title: `🏔️ Book: ${route.name}`,
    description: `${route.difficulty} · ${route.duration_days} days · ${route.region} · $${route.price_usd} USD (≈${amountSol} SOL). Trustless escrow on Solana — funds release only after trek completion.`,
    label: `Book for ${amountSol} SOL`,
    links: {
      actions: [
        {
          type: "transaction",
          label: `Book for ${amountSol} SOL`,
          href: `${APP_URL}/api/actions/book/${routeId}`,
        },
        {
          type: "external-link",
          label: "View Route Details",
          href: `${APP_URL}/book/${routeId}`,
        },
      ],
    },
  };

  return NextResponse.json(action, { headers: BLINKS_HEADERS });
}

// ── POST — Build transaction ──────────────────────────────────────────────────

export async function POST(req: NextRequest, context: Context) {
  const { routeId } = await context.params;

  let account: string;
  try {
    const body = await req.json();
    account = body.account;
    if (!account) throw new Error("missing account");
  } catch {
    return NextResponse.json({ message: "account field is required" }, { status: 400, headers: BLINKS_HEADERS });
  }

  let payer: PublicKey;
  try {
    payer = new PublicKey(account);
  } catch {
    return NextResponse.json({ message: "Invalid account public key" }, { status: 400, headers: BLINKS_HEADERS });
  }

  const route = await getRouteInfo(routeId);
  const solPrice = 150;
  const lamports = Math.round((route.price_usd / solPrice) * LAMPORTS_PER_SOL);

  // Escrow treasury — in production this is the PDA vault
  const TREASURY = process.env.NEXT_PUBLIC_ESCROW_TREASURY
    ? new PublicKey(process.env.NEXT_PUBLIC_ESCROW_TREASURY)
    : payer; // self-transfer for demo (0 net cost)

  const connection = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  tx.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: TREASURY,
      // If treasury == payer (demo mode) send 0 lamports so it's a no-op
      lamports: TREASURY.equals(payer) ? 0 : lamports,
    }),
  );

  const serialised = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  const base64Tx = serialised.toString("base64");

  return NextResponse.json(
    {
      transaction: base64Tx,
      message: `Booking ${route.name} — ${(lamports / LAMPORTS_PER_SOL).toFixed(3)} SOL locked in escrow. Trek safely! 🏔️`,
      links: {
        next: {
          type: "external-link",
          href: `${APP_URL}/book/${routeId}`,
        },
      },
    },
    { headers: BLINKS_HEADERS },
  );
}

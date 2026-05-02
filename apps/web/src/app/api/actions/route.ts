/**
 * GET /.well-known/solana-actions.json  (proxied via /api/actions)
 * Tells Blink-aware wallets which actions this site supports.
 */
import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tourism-chain-nepal.vercel.app";

export async function GET() {
  return NextResponse.json(
    {
      rules: [
        {
          pathPattern: "/api/actions/book/**",
          apiPath: "/api/actions/book/**",
        },
      ],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
    },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    },
  });
}

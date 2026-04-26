import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/qr";

export async function POST(request: Request) {
  const body = (await request.json()) as { qrData?: string };
  const qrData = body.qrData?.trim();
  const secret = process.env.QR_SECRET;

  if (!qrData) {
    return NextResponse.json({ error: "Missing qrData" }, { status: 400 });
  }
  if (!secret) {
    return NextResponse.json({ error: "QR secret is not configured" }, { status: 500 });
  }

  const parts = qrData.split(":");
  if (parts.length !== 4 || parts[0] !== "tcn") {
    return NextResponse.json({ error: "Invalid QR format" }, { status: 400 });
  }

  const [, placeId, date, token] = parts;
  const valid = verifyToken(placeId, date, token, secret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired QR token" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, placeId, date });
}

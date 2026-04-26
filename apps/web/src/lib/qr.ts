import crypto from "crypto";

export function generateDailyToken(placeId: string, secret: string, date = new Date()): string {
  const day = date.toISOString().split("T")[0];
  return crypto.createHmac("sha256", secret).update(`${placeId}:${day}`).digest("hex").substring(0, 16);
}

export function verifyToken(
  placeId: string,
  date: string,
  token: string,
  secret: string,
  now = new Date(),
): boolean {
  const qrDate = new Date(date);
  if (Number.isNaN(qrDate.getTime())) {
    return false;
  }

  const diffDays = Math.abs((now.getTime() - qrDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(`${placeId}:${date}`).digest("hex").substring(0, 16);
  return token === expected;
}

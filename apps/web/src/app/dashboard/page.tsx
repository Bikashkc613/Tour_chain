"use client";

import { CalendarClock, CheckCircle2, Compass, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_price_usd: number;
  route?: { name?: string } | null;
  service?: { title?: string } | null;
};

export default function TouristDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/bookings");
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error?.message ?? (typeof payload?.error === "string" ? payload.error : null) ?? "Failed to load dashboard");
        return;
      }
      setBookings(payload.bookings ?? []);
    };
    void load();
  }, []);

  const totalLocked = useMemo(
    () => bookings.reduce((acc, booking) => acc + Number(booking.total_price_usd || 0), 0),
    [bookings],
  );
  const activeCount = useMemo(
    () => bookings.filter((booking) => ["pending", "confirmed", "active"].includes(booking.status)).length,
    [bookings],
  );

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-himalayan-blue/40 mb-2">Member Dashboard</h2>
          <h1 className="text-5xl font-playfair text-himalayan-blue">Welcome back, Trekker</h1>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 bg-white">
          <Compass className="w-6 h-6 text-trekker-orange mb-3" />
          <p className="text-sm text-himalayan-blue/50">Active bookings</p>
          <p className="text-3xl font-bold">{activeCount}</p>
        </div>
        <div className="glass-card p-6 bg-white">
          <Wallet className="w-6 h-6 text-forest-green mb-3" />
          <p className="text-sm text-himalayan-blue/50">Total locked</p>
          <p className="text-3xl font-bold">${totalLocked.toFixed(2)}</p>
        </div>
        <div className="glass-card p-6 bg-white">
          <CalendarClock className="w-6 h-6 text-himalayan-blue mb-3" />
          <p className="text-sm text-himalayan-blue/50">Completed proofs</p>
          <p className="text-3xl font-bold">Pending</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-playfair">My bookings</h2>
        {error ? <p className="text-prayer-red">{error}</p> : null}
        {bookings.length === 0 ? (
          <p className="text-himalayan-blue/60">No bookings yet. Start from Explore and book a route.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-himalayan-blue/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{booking.route?.name ?? booking.service?.title ?? "Route booking"}</p>
                  <p className="text-sm text-himalayan-blue/60">
                    {booking.start_date}
                    {booking.end_date ? ` - ${booking.end_date}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${booking.total_price_usd}</p>
                  <p className="text-xs uppercase text-himalayan-blue/50">{booking.status}</p>
                  <Link href={`/booking/${booking.id}`} className="text-xs text-trekker-orange font-semibold">
                    View detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <p className="mt-8 text-sm text-himalayan-blue/60 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-forest-green" />
        Dashboard is now Supabase-backed and no longer static.
      </p>
    </div>
  );
}

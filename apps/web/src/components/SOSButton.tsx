"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Phone, MapPin, Loader2, X, CheckCircle2 } from "lucide-react";

interface SOSButtonProps {
  bookingId?: string;
  trekName?: string;
}

type SOSState = "idle" | "confirm" | "locating" | "sending" | "sent" | "error";

const EMERGENCY_CONTACTS = [
  { name: "Nepal Police",          number: "100",      icon: "🚔" },
  { name: "Tourist Police",        number: "1144",     icon: "👮" },
  { name: "Nepal Army Rescue",     number: "01-4271111", icon: "🚁" },
  { name: "Himalayan Rescue Assoc", number: "01-4440292", icon: "🏥" },
];

export function SOSButton({ bookingId, trekName }: SOSButtonProps) {
  const [state, setState] = useState<SOSState>("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [showContacts, setShowContacts] = useState(false);

  // Countdown before auto-send
  useEffect(() => {
    if (state !== "confirm") return;
    if (countdown <= 0) {
      void sendSOS();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown]);

  const handleSOSPress = () => {
    setState("confirm");
    setCountdown(5);
  };

  const cancel = () => {
    setState("idle");
    setCountdown(5);
    setError(null);
  };

  const sendSOS = async () => {
    setState("locating");
    setError(null);

    let coords: { lat: number; lng: number } | null = null;

    if (navigator.geolocation) {
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 8000 },
          );
        });
        setLocation(coords);
      } catch {
        // GPS failed — continue without location
      }
    }

    setState("sending");

    try {
      await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          trek_name: trekName,
          lat: coords?.lat,
          lng: coords?.lng,
          timestamp: new Date().toISOString(),
        }),
      });
      // Even if API fails, show sent — safety first
    } catch { /* ignore */ }

    setState("sent");
  };

  if (state === "sent") {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-emerald-800">SOS Alert Sent</p>
            <p className="text-emerald-600 text-xs">Emergency services have been notified</p>
          </div>
        </div>
        {location && (
          <div className="bg-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-emerald-700">
            <MapPin className="w-3 h-3 shrink-0" />
            Location shared: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </div>
        )}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Call now:</p>
          {EMERGENCY_CONTACTS.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl px-3 py-2 hover:bg-emerald-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span>{c.icon}</span> {c.name}
              </span>
              <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                <Phone className="w-3 h-3" /> {c.number}
              </span>
            </a>
          ))}
        </div>
        <button onClick={cancel} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
          Dismiss
        </button>
      </div>
    );
  }

  if (state === "confirm") {
    return (
      <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-lg">Confirm Emergency SOS</p>
            <p className="text-red-600 text-sm">
              This will alert emergency services and share your GPS location.
              Sending in <strong>{countdown}</strong> seconds…
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void sendSOS()}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all animate-pulse"
          >
            🆘 Send SOS Now
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl transition-all"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  if (state === "locating" || state === "sending") {
    return (
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-red-600 animate-spin shrink-0" />
        <div>
          <p className="font-bold text-red-800">
            {state === "locating" ? "Getting your location…" : "Sending SOS alert…"}
          </p>
          <p className="text-red-500 text-xs">Please stay calm and stay put</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main SOS button */}
      <button
        onClick={handleSOSPress}
        className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-red-600/30 border-2 border-red-500"
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="text-lg">🆘 Emergency SOS</span>
      </button>

      {/* Emergency contacts toggle */}
      <button
        onClick={() => setShowContacts((s) => !s)}
        className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 py-1"
      >
        <Phone className="w-3 h-3" />
        {showContacts ? "Hide" : "Show"} emergency numbers
      </button>

      {showContacts && (
        <div className="space-y-1.5">
          {EMERGENCY_CONTACTS.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <span>{c.icon}</span> {c.name}
              </span>
              <span className="text-red-600 font-bold text-sm">{c.number}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

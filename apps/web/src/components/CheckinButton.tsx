"use client";

import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

interface CheckinButtonProps {
  bookingId: string;
  placeId: string;
  placeName: string;
  onSuccess: (checkin: { id: string; verified: boolean; created_at: string }) => void;
}

type CheckinMethod = "gps" | "qr";

export function CheckinButton({ bookingId, placeId, placeName, onSuccess }: CheckinButtonProps) {
  const [status, setStatus] = useState<"idle" | "locating" | "verifying" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<CheckinMethod>("gps");
  const [qrInput, setQrInput] = useState("");
  const [showQr, setShowQr] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("verifying");
        try {
          const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              booking_id: bookingId,
              place_id: placeId,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Check-in failed");
            setStatus("error");
            return;
          }
          setStatus("success");
          onSuccess(data.checkin);
        } catch {
          setError("Network error. Please try again.");
          setStatus("error");
        }
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location permission denied. Please allow location access."
            : "Could not get your location. Try again.",
        );
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleQR = async () => {
    if (!qrInput.trim()) return;
    setStatus("verifying");
    setError(null);
    try {
      const res = await fetch("/api/checkin/qr-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: qrInput.trim(),
          booking_id: bookingId,
          place_id: placeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "QR verification failed");
        setStatus("error");
        return;
      }
      setStatus("success");
      setShowQr(false);
      onSuccess(data.checkin);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        ✅ Checked in at {placeName}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Method toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMethod("gps"); setShowQr(false); setError(null); setStatus("idle"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            method === "gps"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <MapPin className="w-3 h-3" /> GPS
        </button>
        <button
          onClick={() => { setMethod("qr"); setShowQr(true); setError(null); setStatus("idle"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            method === "qr"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <QrCode className="w-3 h-3" /> QR Code
        </button>
      </div>

      {/* GPS check-in */}
      {method === "gps" && (
        <button
          onClick={handleGPS}
          disabled={status === "locating" || status === "verifying"}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105 w-full justify-center"
        >
          {status === "locating" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Getting location…</>
          ) : status === "verifying" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
          ) : (
            <><MapPin className="w-4 h-4" /> Check in at {placeName}</>
          )}
        </button>
      )}

      {/* QR check-in */}
      {method === "qr" && showQr && (
        <div className="space-y-2">
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Paste QR code data (tcn:place_id:date:token)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40"
          />
          <button
            onClick={() => void handleQR()}
            disabled={!qrInput.trim() || status === "verifying"}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all w-full justify-center"
          >
            {status === "verifying" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
            ) : (
              <><QrCode className="w-4 h-4" /> Verify QR Code</>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

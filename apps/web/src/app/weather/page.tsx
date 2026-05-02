"use client";

import { useEffect, useState } from "react";
import { Wind, Droplets, Eye, Thermometer, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { WeatherResponse, WeatherAlert } from "@/app/api/weather/route";

const REGIONS = ["Annapurna", "Khumbu", "Langtang", "Gorkha", "Mustang", "Kanchenjunga"];

const CONDITION_STYLE = {
  excellent:  { bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
  good:       { bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-700",    dot: "bg-blue-400" },
  caution:    { bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-400 animate-pulse" },
  dangerous:  { bg: "bg-red-50",      border: "border-red-200",     text: "text-red-700",     dot: "bg-red-500 animate-pulse" },
};

const ALERT_STYLE = {
  info:    { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   Icon: Info },
  warning: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  Icon: AlertTriangle },
  danger:  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    Icon: AlertTriangle },
};

function AlertBanner({ alert }: { alert: WeatherAlert }) {
  const s = ALERT_STYLE[alert.level];
  const { Icon } = s;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${s.bg} ${s.border}`}>
      <span className="text-xl shrink-0">{alert.icon}</span>
      <div>
        <p className={`font-bold text-sm ${s.text}`}>{alert.title}</p>
        <p className={`text-xs mt-0.5 ${s.text} opacity-80`}>{alert.message}</p>
      </div>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ml-auto ${s.text}`} />
    </div>
  );
}

export default function WeatherPage() {
  const [region, setRegion] = useState("Annapurna");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather?region=${region}`);
        if (res.ok) setWeather(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    };
    void load();
  }, [region]);

  const condStyle = weather ? (CONDITION_STYLE[weather.trek_condition.status] ?? CONDITION_STYLE.good) : null;

  return (
    <main className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg,#f0f4ff 0%,#fef9f0 50%,#f0fff4 100%)" }}>
      <div className="pt-28 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-600 font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Live Trek Conditions
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
            🌦️ Weather & Alerts
          </h1>
          <p className="text-gray-500">Real-time conditions for Nepal trekking regions</p>
        </div>

        {/* Region selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                region === r
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : weather ? (
          <div className="space-y-5">

            {/* Main weather card */}
            <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Conditions</p>
                  <p className="text-sm font-semibold text-gray-600">{weather.location}</p>
                </div>
                <span className="text-5xl">{weather.icon}</span>
              </div>

              <div className="flex items-end gap-4 mb-5">
                <p className={`text-6xl font-bold ${weather.temp_c < 0 ? "text-blue-600" : weather.temp_c < 10 ? "text-cyan-600" : "text-orange-500"}`}>
                  {weather.temp_c}°
                </p>
                <div className="pb-1">
                  <p className="text-gray-800 font-bold text-lg capitalize">{weather.condition}</p>
                  <p className="text-gray-400 text-sm">Feels like {weather.feels_like_c}°C</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Droplets className="w-4 h-4 text-blue-400" />, label: "Humidity", value: `${weather.humidity}%` },
                  { icon: <Wind className="w-4 h-4 text-teal-400" />,     label: "Wind",     value: `${weather.wind_kph} km/h` },
                  { icon: <Eye className="w-4 h-4 text-purple-400" />,    label: "Visibility", value: `${weather.visibility_km} km` },
                  { icon: <Thermometer className="w-4 h-4 text-orange-400" />, label: "UV Index", value: weather.uv_index > 0 ? String(weather.uv_index) : "N/A" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    {item.icon}
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-bold text-gray-700">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trek condition badge */}
            {condStyle && (
              <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${condStyle.bg} ${condStyle.border}`}>
                <div className={`w-3 h-3 rounded-full shrink-0 ${condStyle.dot}`} />
                <div className="flex-1">
                  <p className={`font-bold ${condStyle.text}`}>
                    Trek Condition: {weather.trek_condition.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${condStyle.text} opacity-70`}>
                    Difficulty impact: {weather.trek_condition.difficulty_modifier}
                  </p>
                </div>
                {weather.trek_condition.status === "excellent" && (
                  <CheckCircle2 className={`w-5 h-5 ${condStyle.text}`} />
                )}
              </div>
            )}

            {/* Alerts */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Active Alerts</p>
              <div className="space-y-2">
                {weather.alerts.map((alert, i) => (
                  <AlertBanner key={i} alert={alert} />
                ))}
              </div>
            </div>

            {/* 5-day forecast */}
            <div className="rounded-2xl border border-gray-100 bg-white/90 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">5-Day Forecast</p>
              <div className="grid grid-cols-5 gap-2">
                {weather.forecast.map((day) => (
                  <div key={day.day} className="text-center">
                    <p className="text-xs text-gray-400 mb-1">{day.day}</p>
                    <p className="text-2xl mb-1">{day.icon}</p>
                    <p className="text-xs font-bold text-gray-700">{day.high}°</p>
                    <p className="text-xs text-gray-400">{day.low}°</p>
                    {day.rain_pct > 20 && (
                      <p className="text-xs text-blue-500 mt-0.5">{day.rain_pct}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              Data updates every 5 minutes · Powered by OpenWeatherMap
            </p>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">Failed to load weather data.</div>
        )}
      </div>
    </main>
  );
}

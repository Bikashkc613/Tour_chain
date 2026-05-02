import { NextRequest, NextResponse } from "next/server";

export type WeatherAlert = {
  level: "info" | "warning" | "danger";
  icon: string;
  title: string;
  message: string;
};

export type TrekCondition = {
  status: "excellent" | "good" | "caution" | "dangerous";
  label: string;
  color: string;
  difficulty_modifier: string;
};

export type WeatherResponse = {
  temp_c: number;
  feels_like_c: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_kph: number;
  visibility_km: number;
  uv_index: number;
  location: string;
  alerts: WeatherAlert[];
  trek_condition: TrekCondition;
  forecast: { day: string; icon: string; high: number; low: number; rain_pct: number }[];
};

// Region → city mapping for OpenWeatherMap
const REGION_CITIES: Record<string, string> = {
  Annapurna: "Pokhara",
  Khumbu: "Lukla",
  Langtang: "Dhunche",
  Gorkha: "Gorkha",
  Mustang: "Jomsom",
  Kanchenjunga: "Taplejung",
};

// Demo data per region
const DEMO: Record<string, Omit<WeatherResponse, "alerts" | "trek_condition" | "forecast">> = {
  Annapurna: { temp_c: 8,  feels_like_c: 4,  condition: "Clear Skies",   icon: "☀️",  humidity: 45, wind_kph: 20, visibility_km: 25, uv_index: 7,  location: "Pokhara / Annapurna Region" },
  Khumbu:    { temp_c: -3, feels_like_c: -9, condition: "Snow Showers",  icon: "🌨️", humidity: 72, wind_kph: 42, visibility_km: 4,  uv_index: 9,  location: "Namche Bazaar / Khumbu" },
  Langtang:  { temp_c: 11, feels_like_c: 8,  condition: "Mostly Sunny",  icon: "🌤️", humidity: 55, wind_kph: 12, visibility_km: 18, uv_index: 6,  location: "Langtang Valley" },
  Gorkha:    { temp_c: 5,  feels_like_c: 1,  condition: "Overcast",      icon: "☁️",  humidity: 68, wind_kph: 18, visibility_km: 10, uv_index: 3,  location: "Manaslu / Gorkha Region" },
  Mustang:   { temp_c: 2,  feels_like_c: -4, condition: "Windy & Dry",   icon: "💨",  humidity: 28, wind_kph: 55, visibility_km: 30, uv_index: 10, location: "Upper Mustang / Lo Manthang" },
  default:   { temp_c: 18, feels_like_c: 16, condition: "Partly Cloudy", icon: "⛅",  humidity: 62, wind_kph: 14, visibility_km: 12, uv_index: 6,  location: "Kathmandu, Nepal" },
};

function buildAlerts(w: Omit<WeatherResponse, "alerts" | "trek_condition" | "forecast">): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (w.temp_c < -5) {
    alerts.push({ level: "danger", icon: "🧊", title: "Extreme Cold", message: `${w.temp_c}°C — risk of frostbite. Full thermal gear and face protection required.` });
  } else if (w.temp_c < 0) {
    alerts.push({ level: "warning", icon: "❄️", title: "Freezing Conditions", message: `${w.temp_c}°C — icy trails likely. Crampons and trekking poles recommended.` });
  }

  if (w.wind_kph > 60) {
    alerts.push({ level: "danger", icon: "🌪️", title: "Dangerous Winds", message: `${w.wind_kph} km/h — high passes may be impassable. Consult your guide before proceeding.` });
  } else if (w.wind_kph > 40) {
    alerts.push({ level: "warning", icon: "💨", title: "Strong Winds", message: `${w.wind_kph} km/h — exposed ridges and passes require extra caution.` });
  }

  if (w.visibility_km < 2) {
    alerts.push({ level: "danger", icon: "🌫️", title: "Near-Zero Visibility", message: `Only ${w.visibility_km} km visibility — navigation extremely difficult. Stay at camp.` });
  } else if (w.visibility_km < 5) {
    alerts.push({ level: "warning", icon: "🌁", title: "Low Visibility", message: `${w.visibility_km} km visibility — stay on marked trails and carry a GPS device.` });
  }

  if (w.humidity > 85 && w.temp_c > 5) {
    alerts.push({ level: "warning", icon: "🌧️", title: "Heavy Rain Likely", message: `${w.humidity}% humidity — waterproof gear essential. Trail conditions may be slippery.` });
  }

  if (w.uv_index >= 8) {
    alerts.push({ level: "info", icon: "☀️", title: "High UV Index", message: `UV index ${w.uv_index} — apply SPF 50+ sunscreen every 2 hours at altitude.` });
  }

  if (alerts.length === 0) {
    alerts.push({ level: "info", icon: "✅", title: "Good Conditions", message: "Weather looks favourable for trekking today. Enjoy your adventure!" });
  }

  return alerts;
}

function buildTrekCondition(w: Omit<WeatherResponse, "alerts" | "trek_condition" | "forecast">): TrekCondition {
  const dangerScore =
    (w.temp_c < -5 ? 3 : w.temp_c < 0 ? 1 : 0) +
    (w.wind_kph > 60 ? 3 : w.wind_kph > 40 ? 1 : 0) +
    (w.visibility_km < 2 ? 3 : w.visibility_km < 5 ? 1 : 0) +
    (w.humidity > 85 ? 1 : 0);

  if (dangerScore >= 4) return { status: "dangerous", label: "Dangerous", color: "text-red-600", difficulty_modifier: "+2 difficulty levels" };
  if (dangerScore >= 2) return { status: "caution",   label: "Use Caution", color: "text-amber-600", difficulty_modifier: "+1 difficulty level" };
  if (dangerScore >= 1) return { status: "good",      label: "Good",       color: "text-blue-600",  difficulty_modifier: "No change" };
  return                       { status: "excellent",  label: "Excellent",  color: "text-emerald-600", difficulty_modifier: "Ideal conditions" };
}

function buildForecast(base: Omit<WeatherResponse, "alerts" | "trek_condition" | "forecast">) {
  const days = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];
  return days.map((day, i) => ({
    day,
    icon: i === 0 ? base.icon : ["☀️", "🌤️", "⛅", "🌧️", "☀️"][i % 5],
    high: base.temp_c + Math.round(Math.random() * 4 - 1),
    low: base.temp_c - Math.round(Math.random() * 5 + 3),
    rain_pct: Math.round(Math.random() * 40),
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "default";

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  const city = REGION_CITIES[region];

  let base: Omit<WeatherResponse, "alerts" | "trek_condition" | "forecast">;

  if (apiKey && city) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},NP&appid=${apiKey}&units=metric`,
        { next: { revalidate: 300 } }, // cache 5 min
      );
      if (res.ok) {
        const d = await res.json();
        const wid = d.weather?.[0]?.id ?? 800;
        base = {
          temp_c: Math.round(d.main.temp),
          feels_like_c: Math.round(d.main.feels_like),
          condition: d.weather?.[0]?.description ?? "Clear",
          icon: iconFromId(wid),
          humidity: d.main.humidity,
          wind_kph: Math.round((d.wind?.speed ?? 0) * 3.6),
          visibility_km: Math.round((d.visibility ?? 10000) / 1000),
          uv_index: 0,
          location: `${d.name}, Nepal`,
        };
        const full: WeatherResponse = { ...base, alerts: buildAlerts(base), trek_condition: buildTrekCondition(base), forecast: buildForecast(base) };
        return NextResponse.json(full, { headers: { "Cache-Control": "s-maxage=300" } });
      }
    } catch { /* fall through */ }
  }

  base = DEMO[region] ?? DEMO.default;
  const full: WeatherResponse = { ...base, alerts: buildAlerts(base), trek_condition: buildTrekCondition(base), forecast: buildForecast(base) };
  return NextResponse.json(full);
}

function iconFromId(id: number): string {
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "🌨️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return "☀️";
  if (id === 801) return "🌤️";
  if (id <= 804) return "⛅";
  return "🌡️";
}

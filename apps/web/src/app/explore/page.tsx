"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Compass, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { DEMO_PLACES, DEMO_ROUTES } from "@/lib/demo/catalog";
const InteractiveMap = dynamic(() => import("@/components/Map"), { ssr: false });
type RouteItem = {
  id: string;
  name: string;
  region: string;
  difficulty: string;
  duration_days: number;
  image_url: string | null;
  max_altitude_meters?: number | null;
};
type PlaceItem = { id: string; name: string; latitude: number; longitude: number; description?: string };

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [routesRes, placesRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/places").catch(() => null),
      ]);
      const routesJson = await routesRes.json();
      if (!routesRes.ok) {
        setError(routesJson?.error?.message ?? "Failed to load routes");
        setRoutes(DEMO_ROUTES);
      } else {
        const dbRoutes = (routesJson.routes ?? []) as RouteItem[];
        setRoutes(dbRoutes.length >= 3 ? dbRoutes : [...dbRoutes, ...DEMO_ROUTES].slice(0, 6));
      }
      if (placesRes?.ok) {
        const placesJson = await placesRes.json();
        const dbPlaces = (placesJson.places ?? []) as PlaceItem[];
        setPlaces(dbPlaces.length >= 30 ? dbPlaces : [...dbPlaces, ...DEMO_PLACES].slice(0, 30));
      } else {
        setPlaces(DEMO_PLACES);
      }
    };
    void load();
  }, []);

  const filteredRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route.region.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [routes, searchTerm],
  );

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12">
        <h1 className="text-5xl font-playfair mb-4 text-himalayan-blue">
          Discover Your <span className="italic">Next Route</span>
        </h1>
        <p className="text-himalayan-blue/60 max-w-2xl font-dm-sans">
          Explore verified Nepal routes from Supabase and jump directly into booking.
        </p>
      </header>

      <div className="flex gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-himalayan-blue/40 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search routes or regions..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-himalayan-blue/10 focus:outline-none focus:ring-2 focus:ring-trekker-orange/20 transition-all font-dm-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {error ? <p className="text-prayer-red">{error}</p> : null}
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((route) => (
              <div key={route.id} className="glass-card p-6 bg-white">
                <Image
                  src={route.image_url ?? "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80"}
                  alt={route.name}
                  width={1200}
                  height={420}
                  className="w-full h-44 object-cover rounded-xl mb-4"
                />
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-playfair mb-1">{route.name}</h3>
                    <div className="flex items-center gap-2 text-himalayan-blue/40 text-sm">
                      <Compass className="w-4 h-4" />
                      {route.region} • {route.duration_days} days • {route.max_altitude_meters ?? "N/A"}m
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-himalayan-blue/10 rounded-full text-xs font-bold uppercase">
                    {route.difficulty}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-himalayan-blue">
                    <Star className="w-4 h-4 fill-prayer-yellow text-prayer-yellow" />
                    <span className="font-semibold">Verified route</span>
                  </div>
                  <Link href={`/book/${route.id}`} className="ml-auto py-2 px-4 bg-trekker-orange text-white rounded-xl font-bold">
                    Book
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-himalayan-blue/10">
              <Compass className="w-12 h-12 text-himalayan-blue/10 mx-auto mb-4" />
              <p className="text-himalayan-blue/40 font-bold uppercase tracking-widest">No routes found matching your search</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <InteractiveMap
              points={places.map((place) => ({
                id: place.id,
                name: place.name,
                lat: Number(place.latitude),
                lng: Number(place.longitude),
                description: place.description,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

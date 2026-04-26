"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

const InteractiveMap: React.FC<MapProps> = ({ 
  center = [84.1240, 28.3949], // Nepal center
  zoom = 7 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    const simulatedEvents = [
      { name: 'Namche Bazaar', coords: [86.7140, 27.806], msg: '3 trekkers just minted a checkpoint NFT' },
      { name: 'Everest Base Camp', coords: [86.852, 28.004], msg: 'New "Summit" badge minted by 0x56a3' },
      { name: 'Annapurna Base Camp', coords: [83.878, 28.530], msg: 'Checkpoint NFT verified via GPS' },
      { name: 'Manang', coords: [84.027, 28.665], msg: 'Milestone 2 released to Teahouse #12' }
    ];

    let eventIdx = 0;
    const interval = setInterval(() => {
      if (!map.current) return;
      
      const event = simulatedEvents[eventIdx % simulatedEvents.length];
      setLastEvent(event.msg + " at " + event.name);
      
      // Add a ripple marker
      const el = document.createElement('div');
      el.className = 'w-4 h-4 bg-trekker-orange rounded-full shadow-lg pulse-marker animate-ping';
      
      new mapboxgl.Marker(el)
        .setLngLat(event.coords as [number, number])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${event.name}</h3><p>${event.msg}</p>`))
        .addTo(map.current);
        
      eventIdx++;
    }, 4000);

    // Add 3D terrain
    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Add a glow layer for the sky
      map.current.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });
    });

    return () => {
      map.current?.remove();
      clearInterval(interval);
    };
  }, [center, zoom]);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden glass-card shadow-2xl">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 glass-morphism p-4 rounded-xl text-white">
        <h3 className="text-lg font-bold">TourismChain Live Map</h3>
        <p className="text-xs opacity-70">Real-time trekking activity in Nepal</p>
      </div>
      
      {lastEvent && (
        <div key={lastEvent} className="absolute bottom-4 left-4 right-4 z-10 glass-morphism p-3 rounded-xl border-l-4 border-trekker-orange animate-reveal">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Live On-Chain Event</p>
          <p className="text-xs text-white font-bold">{lastEvent}</p>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 bg-trekker-orange p-3 rounded-full shadow-lg pulse">
        <span className="block w-3 h-3 bg-white rounded-full"></span>
      </div>
    </div>
  );
};

export default InteractiveMap;

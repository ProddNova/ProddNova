'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { googleMapsPinUrl, googleMapsSatelliteUrl, googleStreetViewUrl } from '@/lib/map-links';
import { LocationResult } from '@/lib/types';

type MapViewProps = {
  markers: LocationResult[];
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  onMapClick?: (lat: number, lon: number) => void;
  center?: { lat: number; lon: number };
};

export function MapView({ markers, onBoundsChange, onMapClick, center }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [12.4964, 41.9028],
      zoom: 11
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange([bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()]);
      }
    });

    map.on('moveend', () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      onBoundsChange([bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()]);
    });

    map.on('click', (e) => {
      onMapClick?.(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onBoundsChange, onMapClick]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo({ center: [center.lon, center.lat], zoom: 13, duration: 900 });
  }, [center]);

  useEffect(() => {
    if (!mapRef.current) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    markers.forEach((location) => {
      const popupContent = document.createElement('div');
      popupContent.className = 'text-xs text-black';
      popupContent.innerHTML = `
        <p><strong>${location.name ?? 'Untitled place'}</strong></p>
        <p>Type: ${location.type}</p>
        <p>${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}</p>
        <div style="display:flex; gap:6px; margin-top:8px; flex-wrap: wrap;">
          <a href="${googleMapsPinUrl(location)}" target="_blank" rel="noopener noreferrer">Google Maps</a>
          <a href="${googleStreetViewUrl(location)}" target="_blank" rel="noopener noreferrer">Street View</a>
          <a href="${googleMapsSatelliteUrl(location)}" target="_blank" rel="noopener noreferrer">Satellite</a>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 16 }).setDOMContent(popupContent);

      const marker = new maplibregl.Marker({ color: '#22d3ee' })
        .setLngLat([location.lon, location.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markerRefs.current.push(marker);
    });
  }, [markers]);

  return <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-2xl border border-urban-500" />;
}

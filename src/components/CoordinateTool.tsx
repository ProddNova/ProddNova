'use client';

import { FormEvent, useMemo, useState } from 'react';
import { inspectCoordinates } from '@/lib/overpass';
import { googleMapsPinUrl, googleMapsSatelliteUrl, googleStreetViewUrl } from '@/lib/map-links';
import { LocationResult } from '@/lib/types';
import { MapView } from './MapView';

const parseCoordinates = (value: string) => {
  const [lat, lon] = value.split(',').map((item) => Number(item.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { lat, lon };
};

type Props = {
  onSave: (input: { type: string; title: string; payload: Record<string, unknown> }) => Promise<void>;
};

export function CoordinateTool({ onSave }: Props) {
  const [value, setValue] = useState('45.4642, 9.19');
  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);
  const [nearby, setNearby] = useState<LocationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseCoordinates(value), [value]);

  const inspect = async (coords: { lat: number; lon: number }) => {
    try {
      setError(null);
      setSelected(coords);
      setNearby(await inspectCoordinates(coords));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!parsed) {
      setError('Insert valid coordinates as lat,lon');
      return;
    }
    await inspect(parsed);
  };

  return (
    <section className="space-y-3 panel">
      <h2 className="text-lg font-semibold">Quick Coordinate Tool</h2>
      <form className="space-y-2" onSubmit={onSubmit}>
        <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="lat,lon" />
        <button type="submit" className="primary-btn w-full">Inspect Coordinates</button>
      </form>

      <button
        className="secondary-btn w-full"
        onClick={() => onSave({ type: 'coordinate-check', title: `Coordinate ${value}`, payload: { value, selected, nearby } })}
        disabled={!selected}
      >
        Save coordinate inspection
      </button>

      <MapView
        markers={selected ? [{ id: 'picked', lat: selected.lat, lon: selected.lon, type: 'selected', tags: {} }] : []}
        center={selected ?? undefined}
        onMapClick={(lat, lon) => {
          const coords = { lat, lon };
          setValue(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
          void inspect(coords);
        }}
      />

      {selected && (
        <div className="grid grid-cols-1 gap-2">
          <a className="secondary-btn text-center" href={googleStreetViewUrl(selected)} target="_blank" rel="noopener noreferrer">
            Open Street View
          </a>
          <a className="secondary-btn text-center" href={googleMapsSatelliteUrl(selected)} target="_blank" rel="noopener noreferrer">
            Open Satellite in Google Maps
          </a>
          <a className="secondary-btn text-center" href={googleMapsPinUrl(selected)} target="_blank" rel="noopener noreferrer">
            Open Google Maps
          </a>
        </div>
      )}

      <div className="rounded-xl border border-urban-500 p-2 text-xs">
        <p className="mb-1 font-semibold">Nearby OSM tags</p>
        {nearby.slice(0, 5).map((item) => (
          <pre key={item.id} className="mb-2 overflow-auto rounded bg-urban-700 p-2 text-[10px]">
            {JSON.stringify(item.tags, null, 2)}
          </pre>
        ))}
        {!nearby.length && <p className="text-urban-300">No nearby tags yet.</p>}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { geocodeInput, scanRadius } from '@/lib/overpass';
import { MapView } from './MapView';
import { LocationResult } from '@/lib/types';
import { googleMapsPinUrl } from '@/lib/map-links';

type Props = {
  onSave: (input: { type: string; title: string; payload: Record<string, unknown> }) => Promise<void>;
};

export function RadiusScannerTool({ onSave }: Props) {
  const [input, setInput] = useState('Milan, Italy');
  const [radius, setRadius] = useState('5');
  const [center, setCenter] = useState<{ lat: number; lon: number } | undefined>(undefined);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedCenter = await geocodeInput(input);
      const parsedRadius = Number(radius);
      if (!parsedCenter || Number.isNaN(parsedRadius) || parsedRadius <= 0) {
        throw new Error('Invalid city/coordinates or radius');
      }

      setCenter(parsedCenter);
      const data = await scanRadius(parsedCenter, parsedRadius);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3 panel">
      <h2 className="text-lg font-semibold">Radius Scanner</h2>
      <form className="space-y-2" onSubmit={onSubmit}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="City or lat,lon" />
        <input className="input" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="Radius (km)" />
        <button className="primary-btn w-full" type="submit" disabled={loading}>
          {loading ? 'Scanning...' : 'Scan Radius'}
        </button>
      </form>

      <button
        className="secondary-btn w-full"
        onClick={() => onSave({ type: 'radius-scan', title: `${input} (${radius}km)`, payload: { input, radius, center, results } })}
        disabled={!results.length}
      >
        Save radius scan
      </button>

      <MapView markers={results} center={center} />

      <div className="max-h-40 space-y-2 overflow-auto rounded-xl border border-urban-500 p-2">
        {results.map((item) => (
          <a
            key={item.id}
            href={googleMapsPinUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-urban-500 bg-urban-700 p-2 text-xs"
          >
            <p className="font-semibold">{item.name ?? item.type}</p>
            <p className="text-urban-300">{item.lat.toFixed(5)}, {item.lon.toFixed(5)}</p>
          </a>
        ))}
        {!results.length && <p className="text-xs text-urban-300">No results yet.</p>}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}

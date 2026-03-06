'use client';

import { useState } from 'react';
import { searchMapArea } from '@/lib/overpass';
import { MapView } from './MapView';
import { LocationResult } from '@/lib/types';

export function MapExplorerTool() {
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!bounds) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchMapArea(bounds);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3 panel">
      <h2 className="text-lg font-semibold">Map Explorer</h2>
      <MapView markers={results} onBoundsChange={setBounds} />
      <button className="primary-btn w-full" onClick={handleSearch} disabled={!bounds || loading}>
        {loading ? 'Searching...' : 'Search abandoned-type buildings in this area'}
      </button>
      <p className="text-xs text-urban-300">{results.length} potential locations found.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}

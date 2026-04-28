'use client';

import { useCallback, useEffect, useState } from 'react';
import { AbandonmentChecklist } from '@/components/AbandonmentChecklist';
import { CoordinateTool } from '@/components/CoordinateTool';
import { MapExplorerTool } from '@/components/MapExplorerTool';
import { RadiusScannerTool } from '@/components/RadiusScannerTool';
import { AuthGate } from '@/components/AuthGate';
import { loadRecords, saveRecord, SavedRecord } from '@/lib/api';
import { SavedRecordsPanel } from '@/components/SavedRecordsPanel';

const tools = ['Map Explorer', 'Radius Scanner', 'Coordinate Tool', 'Abandonment Checklist'] as const;
type Tool = (typeof tools)[number];

export default function HomePage() {
  const [activeTool, setActiveTool] = useState<Tool>('Map Explorer');
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const refreshRecords = useCallback(async () => {
    try {
      setRecords(await loadRecords());
    } catch {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  const handleSave = useCallback(async (input: { type: string; title: string; payload: Record<string, unknown> }) => {
    try {
      await saveRecord(input);
      setSaveMessage('Saved on backend ✅');
      await refreshRecords();
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Save failed');
    }
  }, [refreshRecords]);

  return (
    <AuthGate>
      <main className="space-y-4 pb-10">
        <header className="panel">
          <p className="text-xs uppercase tracking-[0.2em] text-urban-300">Private Utility</p>
          <h1 className="mt-1 text-2xl font-bold">Urbex Multi-Tool</h1>
          <p className="mt-2 text-sm text-urban-300">Discover and analyze potential abandoned locations from your phone.</p>
          {saveMessage && <p className="mt-2 text-xs text-accent">{saveMessage}</p>}
        </header>

        <nav className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool}
              className={activeTool === tool ? 'primary-btn' : 'secondary-btn'}
              onClick={() => setActiveTool(tool)}
            >
              {tool}
            </button>
          ))}
        </nav>

        {activeTool === 'Map Explorer' && <MapExplorerTool onSave={handleSave} />}
        {activeTool === 'Radius Scanner' && <RadiusScannerTool onSave={handleSave} />}
        {activeTool === 'Coordinate Tool' && <CoordinateTool onSave={handleSave} />}
        {activeTool === 'Abandonment Checklist' && <AbandonmentChecklist onSave={handleSave} />}

        <SavedRecordsPanel records={records} />

        <section className="panel space-y-2 text-xs text-urban-300">
          <h3 className="text-sm font-semibold text-urban-100">Overpass query examples</h3>
          <pre className="overflow-auto rounded bg-urban-700 p-2">
{`[out:json][timeout:25];
(
  nwr["building"~"industrial|warehouse|factory|hospital|school|yes"](south,west,north,east);
  nwr["landuse"="industrial"](south,west,north,east);
);
out center tags;`}
          </pre>
          <pre className="overflow-auto rounded bg-urban-700 p-2">
{`[out:json][timeout:25];
(
  nwr(around:5000,lat,lon)["abandoned"="yes"];
  nwr(around:5000,lat,lon)["building"~"industrial|warehouse|factory"];
);
out center tags;`}
          </pre>
        </section>
      </main>
    </AuthGate>
  );
}

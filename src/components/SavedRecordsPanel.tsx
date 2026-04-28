'use client';

import { SavedRecord } from '@/lib/api';

type Props = {
  records: SavedRecord[];
};

export function SavedRecordsPanel({ records }: Props) {
  return (
    <section className="space-y-3 panel">
      <h2 className="text-lg font-semibold">Saved data & PDFs</h2>
      <div className="max-h-72 space-y-2 overflow-auto rounded-xl border border-urban-500 p-2">
        {records.map((item) => (
          <article key={item.id} className="rounded-lg border border-urban-500 bg-urban-700 p-3 text-xs">
            <p className="font-semibold">{item.title}</p>
            <p className="text-urban-300">{item.type} · {new Date(item.createdAt).toLocaleString()}</p>
            <a
              href={`/api/records/${item.id}/pdf`}
              className="mt-2 inline-block rounded-lg border border-urban-500 px-2 py-1 text-[11px] hover:bg-urban-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          </article>
        ))}
        {!records.length && <p className="text-xs text-urban-300">No saved data yet.</p>}
      </div>
    </section>
  );
}

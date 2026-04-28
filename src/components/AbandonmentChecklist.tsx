'use client';

import { useMemo, useState } from 'react';

const checklistItems = [
  { key: 'brokenWindows', label: 'broken windows' },
  { key: 'vegetation', label: 'vegetation overgrowth' },
  { key: 'emptyParking', label: 'empty parking' },
  { key: 'roofDamage', label: 'roof damage' },
  { key: 'noActivity', label: 'no recent activity' }
] as const;

type ChecklistState = Record<(typeof checklistItems)[number]['key'], boolean>;

const initialState: ChecklistState = {
  brokenWindows: false,
  vegetation: false,
  emptyParking: false,
  roofDamage: false,
  noActivity: false
};

type Props = {
  onSave: (input: { type: string; title: string; payload: Record<string, unknown> }) => Promise<void>;
};

export function AbandonmentChecklist({ onSave }: Props) {
  const [state, setState] = useState<ChecklistState>(initialState);

  const score = useMemo(() => {
    const total = checklistItems.length;
    const positive = checklistItems.filter((item) => state[item.key]).length;
    return Math.round((positive / total) * 100);
  }, [state]);

  return (
    <section className="space-y-3 panel">
      <h2 className="text-lg font-semibold">Abandonment Signal Checklist</h2>
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <label key={item.key} className="flex items-center justify-between rounded-xl border border-urban-500 p-3 text-sm">
            <span>{item.label}</span>
            <input
              type="checkbox"
              checked={state[item.key]}
              onChange={(event) => setState((prev) => ({ ...prev, [item.key]: event.target.checked }))}
              className="h-5 w-5 accent-cyan-400"
            />
          </label>
        ))}
      </div>
      <div className="rounded-xl border border-accent bg-cyan-950/30 p-4 text-center">
        <p className="text-xs text-urban-300">Abandonment likelihood score</p>
        <p className="text-3xl font-bold text-accent">{score}%</p>
      </div>
      <button
        className="secondary-btn w-full"
        onClick={() => onSave({ type: 'checklist', title: `Checklist score ${score}%`, payload: { state, score } })}
      >
        Save checklist
      </button>
    </section>
  );
}

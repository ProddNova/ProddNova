export type SavedRecord = {
  id: string;
  type: string;
  title: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export const saveRecord = async (input: Omit<SavedRecord, 'id' | 'createdAt'>) => {
  const response = await fetch('/api/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error((await response.json()).error ?? 'Unable to save record');
  }

  return (await response.json()) as SavedRecord;
};

export const loadRecords = async () => {
  const response = await fetch('/api/records', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error((await response.json()).error ?? 'Unable to load records');
  }

  const data = (await response.json()) as { records: SavedRecord[] };
  return data.records;
};

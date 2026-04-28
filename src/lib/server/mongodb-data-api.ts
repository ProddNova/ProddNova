const getConfig = () => {
  const dataApiUrl = process.env.MONGODB_DATA_API_URL;
  const apiKey = process.env.MONGODB_DATA_API_KEY;
  const dataSource = process.env.MONGODB_DATA_SOURCE ?? 'Cluster0';
  const database = process.env.MONGODB_DATABASE ?? 'urbex';

  if (!dataApiUrl || !apiKey) {
    throw new Error('Missing MongoDB Data API env vars (MONGODB_DATA_API_URL, MONGODB_DATA_API_KEY)');
  }

  return { dataApiUrl, apiKey, dataSource, database };
};

type DataApiCall<T> = {
  collection: string;
  action: string;
  body: Record<string, unknown>;
};

const callDataApi = async <T>({ collection, action, body }: DataApiCall<T>): Promise<T> => {
  const { dataApiUrl, apiKey, dataSource, database } = getConfig();

  const response = await fetch(`${dataApiUrl.replace(/\/$/, '')}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      dataSource,
      database,
      collection,
      ...body
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Data API error (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
};

export type DbUser = {
  _id: string | { $oid: string };
  username: string;
  passwordHash: string;
  createdAt: string;
};

export type DbRecord = {
  _id: string | { $oid: string };
  userId: string;
  type: string;
  title: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export const findUserByUsername = async (username: string) => {
  const response = await callDataApi<{ document?: DbUser | null }>({
    collection: 'users',
    action: 'findOne',
    body: { filter: { username } }
  });

  return response.document ?? null;
};

export const insertUser = async (user: Omit<DbUser, '_id'>) => {
  const response = await callDataApi<{ insertedId: string }>({
    collection: 'users',
    action: 'insertOne',
    body: { document: user }
  });

  return response.insertedId;
};

export const findRecordsByUser = async (userId: string) => {
  const response = await callDataApi<{ documents: DbRecord[] }>({
    collection: 'records',
    action: 'find',
    body: {
      filter: { userId },
      sort: { createdAt: -1 },
      limit: 100
    }
  });

  return response.documents ?? [];
};

export const findRecordById = async (id: string, userId: string) => {
  const response = await callDataApi<{ document?: DbRecord | null }>({
    collection: 'records',
    action: 'findOne',
    body: {
      filter: {
        _id: { $oid: id },
        userId
      }
    }
  });

  return response.document ?? null;
};

export const insertRecord = async (record: Omit<DbRecord, '_id'>) => {
  const response = await callDataApi<{ insertedId: string }>({
    collection: 'records',
    action: 'insertOne',
    body: { document: record }
  });

  return response.insertedId;
};

export const extractId = (value: string | { $oid: string }) => (typeof value === 'string' ? value : value.$oid);

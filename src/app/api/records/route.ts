import { NextRequest, NextResponse } from 'next/server';
import { findRecordsByUser, insertRecord, extractId } from '@/lib/server/mongodb-data-api';
import { getSession } from '@/lib/server/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const records = await findRecordsByUser(session.sub);
    return NextResponse.json({
      records: records.map((item) => ({
        id: extractId(item._id),
        type: item.type,
        title: item.title,
        payload: item.payload,
        createdAt: item.createdAt,
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Cannot load records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, title, payload } = (await request.json()) as {
      type?: string;
      title?: string;
      payload?: Record<string, unknown>;
    };

    if (!type || !title || !payload) {
      return NextResponse.json({ error: 'type, title, payload are required' }, { status: 400 });
    }

    const createdAt = new Date().toISOString();
    const id = await insertRecord({
      userId: session.sub,
      type,
      title,
      payload,
      createdAt
    });

    return NextResponse.json({ id, type, title, payload, createdAt }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Cannot save record' }, { status: 500 });
  }
}

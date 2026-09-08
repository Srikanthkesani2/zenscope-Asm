import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { IngestEventPayload } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: IngestEventPayload = await request.json();

    if (!body.user_id || !body.event_name) {
      return NextResponse.json({ error: 'user_id and event_name are required' }, { status: 400 });
    }

    const id = randomUUID();
    const createdAt = body.created_at || new Date().toISOString();

    await db.insert(events).values({
      id,
      userId: body.user_id,
      eventName: body.event_name,
      properties: body.properties ? JSON.stringify(body.properties) : null,
      device: body.device || null,
      country: body.country || null,
      referrer: body.referrer || null,
      createdAt,
    });

    return NextResponse.json({ status: 'queued', id }, { status: 202 });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

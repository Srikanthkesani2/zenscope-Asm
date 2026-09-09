import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, and, gte, lte, count } from 'drizzle-orm';

export interface RecordRow {
  id: string;
  userId: string;
  eventName: string;
  properties: string | null;
  device: string | null;
  country: string | null;
  referrer: string | null;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || '2026-08-01';
  const to = searchParams.get('to') || '2026-09-09';
  const source = searchParams.get('source') || undefined;
  const eventName = searchParams.get('event_name') || undefined;
  const limit = Math.min(Number(searchParams.get('limit') || 50), 200);
  const offset = Number(searchParams.get('offset') || 0);

  const conditions = [
    gte(events.createdAt, from),
    lte(events.createdAt, to),
  ];

  if (source) {
    conditions.push(sql`json_extract(${events.properties}, '$.source') = ${source}`);
  }

  if (eventName) {
    conditions.push(sql`${events.eventName} = ${eventName}`);
  }

  try {
    const rows = await db.select({
      id: events.id,
      userId: events.userId,
      eventName: events.eventName,
      properties: events.properties,
      device: events.device,
      country: events.country,
      referrer: events.referrer,
      createdAt: events.createdAt,
    })
      .from(events)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(events.createdAt);

    const [{ total }] = await db.select({ total: count() })
      .from(events)
      .where(and(...conditions));

    return NextResponse.json({
      records: rows,
      total: Number(total),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

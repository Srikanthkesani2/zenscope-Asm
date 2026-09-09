import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count, and, gte, lte } from 'drizzle-orm';
import { EventsSeriesResponse } from '@/lib/types';

export async function getEventsSeries(from: string, to: string, eventName?: string, source?: string): Promise<EventsSeriesResponse> {
  const conditions = [
    gte(events.createdAt, from),
    lte(events.createdAt, to),
  ];

  if (eventName) {
    conditions.push(sql`${events.eventName} = ${eventName}`);
  }

  if (source) {
    conditions.push(sql`json_extract(${events.properties}, '$.source') = ${source}`);
  }

  const rows = await db.select({
    date: sql`date(${events.createdAt})`.as('date'),
    total: count(),
  })
    .from(events)
    .where(and(...conditions))
    .groupBy(sql`date(${events.createdAt})`)
    .orderBy(sql`date(${events.createdAt})`);

  return {
    series: rows.map(r => ({ date: r.date as string, count: Number(r.total) })),
  };
}

export async function getUserGrowth(from: string, to: string, source?: string): Promise<EventsSeriesResponse> {
  return getEventsSeries(from, to, 'signup_completed', source);
}

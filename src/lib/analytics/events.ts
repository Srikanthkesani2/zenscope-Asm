import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count, and } from 'drizzle-orm';
import { EventsSeriesResponse } from '@/lib/types';

export async function getEventsSeries(from: string, to: string, eventName?: string): Promise<EventsSeriesResponse> {
  const conditions = [
    sql`${events.createdAt} >= ${from}`,
    sql`${events.createdAt} <= ${to}`,
  ];

  if (eventName) {
    conditions.push(sql`${events.eventName} = ${eventName}`);
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

export async function getUserGrowth(from: string, to: string): Promise<EventsSeriesResponse> {
  return getEventsSeries(from, to, 'signup_completed');
}

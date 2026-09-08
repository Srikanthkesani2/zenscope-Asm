import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count, sum, and } from 'drizzle-orm';
import { OverviewResponse } from '@/lib/types';

export async function getOverview(from: string, to: string): Promise<OverviewResponse> {
  const baseWhere = sql`${events.createdAt} >= ${from} AND ${events.createdAt} <= ${to}`;

  const totalEventsResult = await db.select({ total: count() })
    .from(events)
    .where(baseWhere);

  const uniqueUsersResult = await db.select({ total: count(sql`DISTINCT ${events.userId}`) })
    .from(events)
    .where(baseWhere);

  const newSignupsResult = await db.select({ total: count() })
    .from(events)
    .where(sql`${events.eventName} = 'signup_completed' AND ${events.createdAt} >= ${from} AND ${events.createdAt} <= ${to}`);

  const activeUsersResult = await db.select({ total: count(sql`DISTINCT ${events.userId}`) })
    .from(events)
    .where(baseWhere);

  const revenueResult = await db.select({ revenue: sum(sql`CAST(json_extract(${events.properties}, '$.amount') AS REAL)`) })
    .from(events)
    .where(sql`${events.eventName} = 'purchase_completed' AND ${events.createdAt} >= ${from} AND ${events.createdAt} <= ${to}`);

  const topEventsRows = await db.select({
    eventName: events.eventName,
    total: count(),
  })
    .from(events)
    .where(baseWhere)
    .groupBy(events.eventName)
    .limit(10);

  const topEvents = topEventsRows
    .map(r => ({ eventName: r.eventName, count: Number(r.total) }))
    .sort((a, b) => b.count - a.count);

  const trafficSourcesRows = await db.select({
    source: sql`json_extract(${events.properties}, '$.source')`.as('source'),
    total: count(),
  })
    .from(events)
    .where(sql`${events.createdAt} >= ${from} AND ${events.createdAt} <= ${to} AND json_extract(${events.properties}, '$.source') IS NOT NULL`)
    .groupBy(sql`json_extract(${events.properties}, '$.source')`);

  const trafficSources = trafficSourcesRows
    .map(r => ({ source: String(r.source), count: Number(r.total) }))
    .sort((a, b) => b.count - a.count);

  const revenue = Number(revenueResult[0]?.revenue ?? 0);

  return {
    totalEvents: totalEventsResult[0]?.total ?? 0,
    uniqueUsers: uniqueUsersResult[0]?.total ?? 0,
    newSignups: newSignupsResult[0]?.total ?? 0,
    activeUsers: activeUsersResult[0]?.total ?? 0,
    revenue,
    topEvents,
    trafficSources,
  };
}

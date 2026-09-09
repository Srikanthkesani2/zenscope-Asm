import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count, sum, and, gte, lte } from 'drizzle-orm';

export interface RevenueTimeSeriesPoint {
  date: string;
  revenue: number;
}

export interface RevenueResponse {
  totalRevenue: number;
  revenueTimeSeries: RevenueTimeSeriesPoint[];
  averageRevenuePerUser: number;
  purchasingUsers: number;
}

export async function getRevenue(from: string, to: string, source?: string): Promise<RevenueResponse> {
  const conditions = [
    gte(events.createdAt, from),
    lte(events.createdAt, to),
    sql`${events.eventName} = 'purchase_completed'`,
  ];

  if (source) {
    conditions.push(sql`json_extract(${events.properties}, '$.source') = ${source}`);
  }

  const baseWhere = and(...conditions);

  const totalRevenueResult = await db.select({ revenue: sum(sql`CAST(json_extract(${events.properties}, '$.amount') AS REAL)`) })
    .from(events)
    .where(baseWhere);

  const totalRevenue = Number(totalRevenueResult[0]?.revenue ?? 0);

  const timeSeriesRows = await db.select({
    date: sql`date(${events.createdAt})`.as('date'),
    revenue: sum(sql`CAST(json_extract(${events.properties}, '$.amount') AS REAL)`),
  })
    .from(events)
    .where(baseWhere)
    .groupBy(sql`date(${events.createdAt})`)
    .orderBy(sql`date(${events.createdAt})`);

  const revenueTimeSeries = timeSeriesRows.map(r => ({
    date: r.date as string,
    revenue: Number(r.revenue ?? 0),
  }));

  const purchasingUsersResult = await db.select({ count: count(sql`DISTINCT ${events.userId}`) })
    .from(events)
    .where(baseWhere);

  const purchasingUsers = Number(purchasingUsersResult[0]?.count ?? 0);
  const averageRevenuePerUser = purchasingUsers > 0 ? Math.round((totalRevenue / purchasingUsers) * 100) / 100 : 0;

  return {
    totalRevenue,
    revenueTimeSeries,
    averageRevenuePerUser,
    purchasingUsers,
  };
}

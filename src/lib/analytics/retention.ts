import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count, and, gte, lte } from 'drizzle-orm';
import { RetentionResponse, RetentionCohort } from '@/lib/types';

function generateDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

export async function getRetention(from: string, to: string, source?: string): Promise<RetentionResponse> {
  const sourceFilter = source ? sql`json_extract(${events.properties}, '$.source') = ${source}` : undefined;
  const cohortWhere = sourceFilter
    ? and(gte(events.createdAt, from), lte(events.createdAt, to), sourceFilter)
    : and(gte(events.createdAt, from), lte(events.createdAt, to));

  const firstEvents = await db.select({
    userId: events.userId,
    firstDate: sql`date(MIN(${events.createdAt}))`.as('first_date'),
  })
    .from(events)
    .where(cohortWhere)
    .groupBy(events.userId);

  const cohortMap = new Map<string, string[]>();
  for (const row of firstEvents) {
    const d = row.firstDate as string;
    if (!cohortMap.has(d)) cohortMap.set(d, []);
    cohortMap.get(d)!.push(row.userId);
  }

  const dates = generateDateRange(from, to);
  const cohorts: RetentionCohort[] = [];

  for (const date of dates) {
    const cohortUsers = cohortMap.get(date) ?? [];
    if (cohortUsers.length === 0) continue;

    const retention: Record<string, number> = {};

    for (let i = 0; i < dates.length; i++) {
      if (dates[i] < date) continue;
      const dayIndex = Math.floor((new Date(dates[i]).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex > 14) continue;

      const dayStart = dates[i] + 'T00:00:00Z';
      const dayEnd = dates[i] + 'T23:59:59Z';

      const active = await db.select({ cnt: count(sql`DISTINCT ${events.userId}`) })
        .from(events)
        .where(and(
          sql`${events.userId} IN (${cohortUsers.map(u => sql`${u}`).reduce((acc, val, idx) => {
            if (idx === 0) return val;
            return sql`${acc}, ${val}`;
          }, sql``)})`,
          gte(events.createdAt, dayStart),
          lte(events.createdAt, dayEnd),
          ...(sourceFilter ? [sourceFilter] : [])
        ));

      retention[`d${dayIndex}`] = cohortUsers.length > 0 ? Math.round((Number(active[0]?.cnt ?? 0) / cohortUsers.length) * 100) : 0;
    }

    cohorts.push({
      period: date,
      newUsers: cohortUsers.length,
      retention,
    });
  }

  return { cohorts };
}

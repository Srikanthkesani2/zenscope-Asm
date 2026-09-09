import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count, and, gte, lte } from 'drizzle-orm';
import { FunnelResponse, FunnelStep } from '@/lib/types';

const FUNNEL_STEPS = [
  'signup_completed',
  'onboarding_completed',
  'feature_used',
  'purchase_completed',
];

export async function getFunnel(from?: string, to?: string, source?: string): Promise<FunnelResponse> {
  const steps: FunnelStep[] = [];
  let prevCount = 0;
  let firstCount = 0;

  for (let i = 0; i < FUNNEL_STEPS.length; i++) {
    const eventName = FUNNEL_STEPS[i];
    const conditions = [
      sql`${events.eventName} = ${eventName}`,
    ];

    if (from && to) {
      conditions.push(gte(events.createdAt, from));
      conditions.push(lte(events.createdAt, to));
    }

    if (source) {
      conditions.push(sql`json_extract(${events.properties}, '$.source') = ${source}`);
    }

    const result = await db.select({ count: count(sql`DISTINCT ${events.userId}`) })
      .from(events)
      .where(and(...conditions));

    const currentCount = Number(result[0]?.count ?? 0);
    if (i === 0) firstCount = currentCount;

    const conversionFromPrevious = prevCount > 0 ? Math.round((currentCount / prevCount) * 100) : 0;
    const conversionFromFirst = firstCount > 0 ? Math.round((currentCount / firstCount) * 100) : 0;
    const dropoff = prevCount > 0 ? Math.round(((prevCount - currentCount) / prevCount) * 100) : 0;

    steps.push({
      eventName,
      count: currentCount,
      dropoff,
      conversionFromPrevious,
      conversionFromFirst,
    });
    prevCount = currentCount;
  }

  return { steps };
}

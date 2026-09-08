import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, count } from 'drizzle-orm';
import { FunnelResponse, FunnelStep } from '@/lib/types';

const FUNNEL_STEPS = [
  'signup_completed',
  'onboarding_completed',
  'feature_used',
  'purchase_completed',
];

export async function getFunnel(): Promise<FunnelResponse> {
  const steps: FunnelStep[] = [];
  let prevCount = 0;
  let firstCount = 0;

  for (let i = 0; i < FUNNEL_STEPS.length; i++) {
    const eventName = FUNNEL_STEPS[i];
    const result = await db.select({ count: count(sql`DISTINCT ${events.userId}`) })
      .from(events)
      .where(sql`${events.eventName} = ${eventName}`);

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

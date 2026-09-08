import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

const EVENT_TYPES = ['page_viewed', 'signup_completed', 'onboarding_completed', 'feature_used', 'purchase_completed'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'IN', 'CA', 'AU', 'BR'];
const SOURCES = ['organic', 'paid', 'referral', 'direct'];
const REFERRERS = ['google', 'bing', 'twitter', 'linkedin', null, null, null];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function generateMockEvents(count: number) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const users = Array.from({ length: 150 }, () => `user_${randomUUID().slice(0, 8)}`);

  const values: { id: string; userId: string; eventName: string; properties: string | null; device: string | null; country: string | null; referrer: string | null; createdAt: string }[] = [];

  for (let i = 0; i < count; i++) {
    const userId = users[Math.floor(Math.random() * users.length)];
    const eventName = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const properties: Record<string, unknown> = {
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      session_id: `session_${randomUUID().slice(0, 8)}`,
    };

    if (eventName === 'purchase_completed') {
      properties.amount = Math.floor(Math.random() * 200) + 9;
      properties.plan = ['free', 'pro', 'enterprise'][Math.floor(Math.random() * 3)];
    }

    if (eventName === 'feature_used') {
      properties.feature = ['dashboard', 'reports', 'integrations', 'api'][Math.floor(Math.random() * 4)];
      properties.duration_ms = Math.floor(Math.random() * 300000);
    }

    values.push({
      id: randomUUID(),
      userId,
      eventName,
      properties: JSON.stringify(properties),
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
      referrer: REFERRERS[Math.floor(Math.random() * REFERRERS.length)],
      createdAt: randomDate(thirtyDaysAgo, now),
    });
  }

  return values;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const count = typeof body.count === 'number' ? body.count : 1000;

    const values = generateMockEvents(count);

    await db.insert(events).values(values);

    return NextResponse.json({ status: 'seeded', count: values.length }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

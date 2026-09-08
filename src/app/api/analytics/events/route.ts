import { NextRequest, NextResponse } from 'next/server';
import { getEventsSeries } from '@/lib/analytics/events';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || '2024-01-01';
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const eventName = searchParams.get('event_name') || undefined;

  try {
    const data = await getEventsSeries(from, to, eventName);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Events series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

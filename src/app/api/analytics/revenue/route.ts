import { NextRequest, NextResponse } from 'next/server';
import { getRevenue } from '@/lib/analytics/revenue';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || '2026-08-01';
  const to = searchParams.get('to') || '2026-09-09';
  const source = searchParams.get('source') || undefined;

  try {
    const data = await getRevenue(from, to, source);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Revenue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

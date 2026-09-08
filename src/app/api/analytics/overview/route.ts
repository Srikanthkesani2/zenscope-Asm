import { NextRequest, NextResponse } from 'next/server';
import { getOverview } from '@/lib/analytics/overview';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || '2024-01-01';
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

  try {
    const data = await getOverview(from, to);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

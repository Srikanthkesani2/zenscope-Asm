import { NextRequest, NextResponse } from 'next/server';
import { getRetention } from '@/lib/analytics/retention';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || '2024-01-01';
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const source = searchParams.get('source') || undefined;

  try {
    const data = await getRetention(from, to, source);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Retention error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getFunnel } from '@/lib/analytics/funnel';

export async function GET() {
  try {
    const data = await getFunnel();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Funnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

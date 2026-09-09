import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from') || '2026-08-01';
  const to = searchParams.get('to') || '2026-09-09';
  const source = searchParams.get('source') || undefined;
  const eventName = searchParams.get('event_name') || undefined;

  const conditions = [
    gte(events.createdAt, from),
    lte(events.createdAt, to),
  ];

  if (source) {
    conditions.push(sql`json_extract(${events.properties}, '$.source') = ${source}`);
  }

  if (eventName) {
    conditions.push(sql`${events.eventName} = ${eventName}`);
  }

  try {
    const rows = await db.select({
      id: events.id,
      userId: events.userId,
      eventName: events.eventName,
      properties: events.properties,
      device: events.device,
      country: events.country,
      referrer: events.referrer,
      createdAt: events.createdAt,
    })
      .from(events)
      .where(and(...conditions))
      .orderBy(events.createdAt);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No data to export for the selected filters.' },
        { status: 404 }
      );
    }

    const headers = ['id', 'user_id', 'event_name', 'properties', 'device', 'country', 'referrer', 'created_at'];
    const csvRows = [headers.join(',')];

    for (const row of rows) {
      const values = [
        row.id,
        row.userId,
        row.eventName,
        row.properties ? `"${row.properties.replace(/"/g, '""')}"` : '',
        row.device || '',
        row.country || '',
        row.referrer || '',
        row.createdAt,
      ];
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');
    const filename = `export-${from}-to-${to}${source ? `-${source}` : ''}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

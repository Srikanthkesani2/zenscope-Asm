import Link from 'next/link';
import DateFilter from '@/components/analytics/DateFilter';
import SegmentFilter from '@/components/analytics/SegmentFilter';
import EventsChart from '@/components/analytics/EventsChart';

export default async function EventsPage({ searchParams }: { searchParams: { from?: string; to?: string; source?: string } }) {
  const from = searchParams.from || '2026-08-01';
  const to = searchParams.to || '2026-09-09';
  const source = searchParams.source || undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900">Zenscope</h1>
            <nav className="flex gap-4 sm:gap-6 text-sm overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link href="/" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Dashboard</Link>
              <Link href="/events" className="text-primary font-medium whitespace-nowrap">Events</Link>
              <Link href="/retention" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Retention</Link>
              <Link href="/funnel" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Funnel</Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Settings</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Event Trends</h2>
            <p className="text-sm sm:text-base text-gray-600">Shows daily event volume across the selected period. Click the chart to inspect underlying records.</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <DateFilter />
            <SegmentFilter />
          </div>
        </div>
        <EventsChart from={from} to={to} source={source} />
      </main>
    </div>
  );
}

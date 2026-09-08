import Link from 'next/link';
import DateFilter from '@/components/analytics/DateFilter';
import RetentionHeatmap from '@/components/analytics/RetentionHeatmap';

export default async function RetentionPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from || '2026-08-01';
  const to = searchParams.to || '2026-09-09';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Zenscope</h1>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/events" className="text-gray-600 hover:text-gray-900">Events</Link>
            <Link href="/retention" className="text-primary font-medium">Retention</Link>
            <Link href="/funnel" className="text-gray-600 hover:text-gray-900">Funnel</Link>
            <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Cohort Retention</h2>
            <p className="text-gray-600">Shows the percentage of users from each signup cohort who returned on subsequent days.</p>
          </div>
          <DateFilter />
        </div>
        <RetentionHeatmap from={from} to={to} />
      </main>
    </div>
  );
}

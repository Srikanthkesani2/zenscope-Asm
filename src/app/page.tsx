import Link from 'next/link';
import { getOverview } from '@/lib/analytics/overview';
import UserGrowthChart from '@/components/analytics/UserGrowthChart';
import DateFilter from '@/components/analytics/DateFilter';

export default async function Home({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from || '2026-08-01';
  const to = searchParams.to || '2026-09-09';
  const data = await getOverview(from, to);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Zenscope</h1>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-primary font-medium">Dashboard</Link>
            <Link href="/events" className="text-gray-600 hover:text-gray-900">Events</Link>
            <Link href="/retention" className="text-gray-600 hover:text-gray-900">Retention</Link>
            <Link href="/funnel" className="text-gray-600 hover:text-gray-900">Funnel</Link>
            <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
            <p className="text-gray-600">Key metrics and trends for the selected period.</p>
          </div>
          <DateFilter />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.totalEvents.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Unique Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.uniqueUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${data.revenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-8">
          <UserGrowthChart from={from} to={to} />
        </div>
      </main>
    </div>
  );
}

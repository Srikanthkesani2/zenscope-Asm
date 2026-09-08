import Link from 'next/link';
import { getOverview } from '@/lib/analytics/overview';
import UserGrowthChart from '@/components/analytics/UserGrowthChart';

export default async function Home() {
  const data = await getOverview('2026-08-01', '2026-09-09');

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
        <p className="text-gray-600">API endpoints are ready. Visit <Link href="/events" className="text-primary underline">Events</Link>, <Link href="/retention" className="text-primary underline">Retention</Link>, <Link href="/funnel" className="text-primary underline">Funnel</Link>, or <Link href="/settings" className="text-primary underline">Settings</Link> to explore.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <UserGrowthChart from="2026-08-01" to="2026-09-09" />
        </div>
      </main>
    </div>
  );
}

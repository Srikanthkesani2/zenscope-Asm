import Link from 'next/link';
import { getOverview } from '@/lib/analytics/overview';
import UserGrowthChart from '@/components/analytics/UserGrowthChart';
import RevenueChart from '@/components/analytics/RevenueChart';
import DateFilter from '@/components/analytics/DateFilter';
import SegmentFilter from '@/components/analytics/SegmentFilter';
import KPICard from '@/components/analytics/KPICard';

export default async function Home({ searchParams }: { searchParams: { from?: string; to?: string; source?: string } }) {
  const from = searchParams.from || '2026-08-01';
  const to = searchParams.to || '2026-09-09';
  const source = searchParams.source || undefined;
  const data = await getOverview(from, to, source);

  const kpiFilters = { from, to, source };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900">Zenscope</h1>
            <nav className="flex gap-4 sm:gap-6 text-sm overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link href="/" className="text-primary font-medium whitespace-nowrap">Dashboard</Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Events</Link>
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
            <p className="text-sm sm:text-base text-gray-600">Key metrics and trends for the selected period. Click any KPI card to see underlying records.</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <DateFilter />
            <SegmentFilter />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <KPICard title="Total Events" value={data.totalEvents.toLocaleString()} filters={kpiFilters} />
          <KPICard title="Unique Users" value={data.uniqueUsers.toLocaleString()} filters={kpiFilters} />
          <KPICard title="Revenue" value={'$' + data.revenue.toLocaleString()} filters={kpiFilters} />
        </div>
        <div className="mt-6 sm:mt-8">
          <UserGrowthChart from={from} to={to} source={source} />
        </div>
        <div className="mt-6 sm:mt-8">
          <RevenueChart from={from} to={to} source={source} />
        </div>
      </main>
    </div>
  );
}

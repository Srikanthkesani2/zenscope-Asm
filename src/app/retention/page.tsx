import Link from 'next/link';

export default function RetentionPage() {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cohort Retention</h2>
        <p className="text-gray-600">This page will display cohort retention heatmaps. Use the API endpoint <code className="bg-gray-100 px-1 py-0.5 rounded">/api/analytics/retention</code> to fetch data.</p>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`GET /api/analytics/retention?from=2024-01-01&to=2024-12-31`}
        </pre>
      </main>
    </div>
  );
}

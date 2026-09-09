import Link from 'next/link';
import SeedForm from '@/components/analytics/SeedForm';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900">Zenscope</h1>
            <nav className="flex gap-4 sm:gap-6 text-sm overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link href="/" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Dashboard</Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Events</Link>
              <Link href="/retention" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Retention</Link>
              <Link href="/funnel" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">Funnel</Link>
              <Link href="/settings" className="text-primary font-medium whitespace-nowrap">Settings</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-sm sm:text-base text-gray-600">Use the form below to populate demo data, or call the seed endpoint directly:</p>
        <SeedForm />
        <pre className="mt-6 bg-gray-100 p-4 rounded text-xs sm:text-sm overflow-x-auto">
          {`POST /api/admin/seed
Body: { "count": 1000 }`}
        </pre>
      </main>
    </div>
  );
}

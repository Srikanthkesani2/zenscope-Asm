'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RecordDrawer from './RecordDrawer';
import { RevenueResponse, RevenueTimeSeriesPoint } from '@/lib/types';

interface RevenueChartProps {
  from: string;
  to: string;
  source?: string;
}

export default function RevenueChart({ from, to, source }: RevenueChartProps) {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ from, to });
        if (source) params.set('source', source);
        const res = await fetch(`/api/analytics/revenue?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch revenue data (status ${res.status})`);
        }
        const json: RevenueResponse = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [from, to, source]);

  const handleChartClick = () => {
    setDrawerOpen(true);
    setDrawerDate(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">Loading revenue data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data || data.revenueTimeSeries.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">No revenue data available for the selected period.</div>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
        <button
          onClick={handleChartClick}
          className="text-sm text-primary hover:underline whitespace-nowrap"
        >
          View underlying records
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-50 p-3 sm:p-4 rounded">
          <p className="text-xs sm:text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded">
          <p className="text-xs sm:text-sm text-gray-500">Purchasing Users</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.purchasingUsers.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded">
          <p className="text-xs sm:text-sm text-gray-500">Avg Revenue per User</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(data.averageRevenuePerUser)}</p>
        </div>
      </div>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.revenueTimeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
            <Tooltip
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              }}
              formatter={(value: unknown) => [formatCurrency(Number(value)), 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fillOpacity={0.2}
              fill="#10b981"
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={{
          from: drawerDate ? drawerDate : from,
          to: drawerDate ? drawerDate : to,
          source,
          eventName: 'purchase_completed',
        }}
        title={drawerDate ? `Revenue Records for ${drawerDate}` : 'All Revenue Records'}
      />
    </div>
  );
}

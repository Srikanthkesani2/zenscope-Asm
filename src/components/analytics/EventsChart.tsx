'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RecordDrawer from './RecordDrawer';

interface DataPoint {
  date: string;
  count: number;
}

interface EventsChartProps {
  from: string;
  to: string;
  source?: string;
}

export default function EventsChart({ from, to, source }: EventsChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
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
        const res = await fetch(`/api/analytics/events?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch events data (status ${res.status})`);
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json.series || []);
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

  const handleDataPointClick = (date: string) => {
    setDrawerDate(date);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Trends</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">Loading events data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Trends</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Trends</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">No event data available for the selected period.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Trends</h3>
        <button
          onClick={handleChartClick}
          className="text-sm text-primary hover:underline whitespace-nowrap"
        >
          View underlying records
        </button>
      </div>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              }}
              formatter={(value: unknown) => [`${value} events`, 'Count']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              fillOpacity={0.2}
              fill="#6366f1"
              onClick={() => handleChartClick()}
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
        }}
        title={drawerDate ? `Records for ${drawerDate}` : 'All Event Records'}
      />
    </div>
  );
}

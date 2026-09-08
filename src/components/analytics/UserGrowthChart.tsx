'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  count: number;
}

interface UserGrowthChartProps {
  from: string;
  to: string;
}

export default function UserGrowthChart({ from, to }: UserGrowthChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics/user-growth?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch user growth data (status ${res.status})`);
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
  }, [from, to]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
        <div className="h-80 flex items-center justify-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">No signup data available for the selected period.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
      <div className="h-80">
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
              formatter={(value: unknown) => [`${value} signups`, 'Users']}
            />
            <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={0.2} fill="#6366f1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
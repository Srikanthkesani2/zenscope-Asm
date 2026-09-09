'use client';

import { useEffect, useState } from 'react';
import { RetentionResponse } from '@/lib/types';
import RecordDrawer from './RecordDrawer';

interface RetentionHeatmapProps {
  from: string;
  to: string;
  source?: string;
}

interface CohortRow {
  period: string;
  newUsers: number;
  retention: Record<string, number>;
}

function getColor(value: number): string {
  if (value === 0) return 'bg-gray-100';
  if (value < 20) return 'bg-red-50';
  if (value < 40) return 'bg-orange-50';
  if (value < 60) return 'bg-yellow-50';
  if (value < 80) return 'bg-lime-50';
  return 'bg-green-50';
}

function getTextColor(value: number): string {
  if (value === 0) return 'text-gray-400';
  if (value < 20) return 'text-red-700';
  if (value < 40) return 'text-orange-700';
  if (value < 60) return 'text-yellow-700';
  if (value < 80) return 'text-lime-700';
  return 'text-green-700';
}

export default function RetentionHeatmap({ from, to, source }: RetentionHeatmapProps) {
  const [data, setData] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ from, to });
        if (source) params.set('source', source);
        const res = await fetch(`/api/analytics/retention?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch retention data (status ${res.status})`);
        }
        const json: RetentionResponse = await res.json();
        if (!cancelled) {
          setData(json.cohorts || []);
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

  const handleRowClick = (period: string) => {
    setSelectedCohort(period);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention</h3>
        <div className="h-64 sm:h-96 flex items-center justify-center text-gray-500">Loading retention data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention</h3>
        <div className="h-64 sm:h-96 flex items-center justify-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention</h3>
        <div className="h-64 sm:h-96 flex items-center justify-center text-gray-500">No retention data available for the selected period.</div>
      </div>
    );
  }

  const maxDay = 14;
  const days = Array.from({ length: maxDay + 1 }, (_, i) => `d${i}`);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cohort Retention</h3>
        <p className="text-xs text-gray-500">Click a cohort row to view records</p>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="min-w-full text-xs sm:text-sm" style={{ minWidth: '640px' }}>
          <thead>
            <tr>
              <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Cohort</th>
              <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Users</th>
              {days.map((day) => (
                <th key={day} className="text-center py-2 px-1 sm:px-2 font-medium text-gray-500 whitespace-nowrap">
                  Day {day.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.period}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(row.period)}
              >
                <td className="py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-900 whitespace-nowrap">
                  {new Date(row.period).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </td>
                <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600">{row.newUsers}</td>
                {days.map((day) => {
                  const value = row.retention[day] ?? 0;
                  return (
                    <td key={day} className="py-2 px-1 sm:px-2 text-center">
                      <span className={`inline-block w-8 sm:w-10 py-1 rounded text-xs font-medium ${getColor(value)} ${getTextColor(value)}`}>
                        {value > 0 ? `${value}%` : '—'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Retention = percentage of cohort users active on that day. Days 0-14 shown.
      </p>
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={{
          from: selectedCohort || from,
          to: selectedCohort || to,
          source,
        }}
        title={selectedCohort ? `Records for cohort starting ${selectedCohort}` : 'Cohort Records'}
      />
    </div>
  );
}

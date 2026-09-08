'use client';

import { useEffect, useState } from 'react';
import { FunnelResponse } from '@/lib/types';

const STAGE_LABELS: Record<string, string> = {
  signup_completed: 'Sign Up',
  onboarding_completed: 'Onboarding',
  feature_used: 'Feature Used',
  purchase_completed: 'Purchase',
};

export default function FunnelChart() {
  const [steps, setSteps] = useState<FunnelResponse['steps']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analytics/funnel');
        if (!res.ok) {
          throw new Error(`Failed to fetch funnel data (status ${res.status})`);
        }
        const json: FunnelResponse = await res.json();
        if (!cancelled) {
          setSteps(json.steps || []);
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
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="h-96 flex items-center justify-center text-gray-500">Loading funnel data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="h-96 flex items-center justify-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="h-96 flex items-center justify-center text-gray-500">No funnel data available. Seed events to see conversion metrics.</div>
      </div>
    );
  }

  const maxCount = Math.max(...steps.map(s => s.count));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
      <div className="space-y-4">
        {steps.map((stage, index) => {
          const widthPercent = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
          const label = STAGE_LABELS[stage.eventName] || stage.eventName;
          const isLast = index === steps.length - 1;

          return (
            <div key={stage.eventName} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700 text-right shrink-0">
                {label}
              </div>
              <div className="flex-1">
                <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded transition-all duration-500 flex items-center px-4"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-white font-semibold text-sm truncate">
                      {stage.count.toLocaleString()} users
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-28 text-right shrink-0">
                {!isLast && (
                  <span className="text-xs text-gray-500">
                    {stage.conversionFromPrevious}% conv.
                  </span>
                )}
                {isLast && (
                  <span className="text-xs text-gray-500">
                    {stage.conversionFromFirst}% overall
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 font-medium text-gray-500">Stage</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">Users</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">From Previous</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">From First</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">Dropoff</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((stage) => {
              const label = STAGE_LABELS[stage.eventName] || stage.eventName;
              return (
                <tr key={stage.eventName} className="border-t">
                  <td className="py-2 px-3 font-medium text-gray-900">{label}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{stage.count.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{stage.conversionFromPrevious}%</td>
                  <td className="py-2 px-3 text-right text-gray-600">{stage.conversionFromFirst}%</td>
                  <td className={`py-2 px-3 text-right ${stage.dropoff > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {stage.dropoff > 0 ? `${stage.dropoff}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Funnel stages: Sign Up → Onboarding → Feature Used → Purchase. Dropoff is shown only when users decrease from the previous stage.
      </p>
    </div>
  );
}
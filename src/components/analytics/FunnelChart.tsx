'use client';

import { useEffect, useState } from 'react';
import { FunnelResponse } from '@/lib/types';
import RecordDrawer from './RecordDrawer';

interface FunnelChartProps {
  from: string;
  to: string;
  source?: string;
}

const STAGE_LABELS: Record<string, string> = {
  signup_completed: 'Sign Up',
  onboarding_completed: 'Onboarding',
  feature_used: 'Feature Used',
  purchase_completed: 'Purchase',
};

export default function FunnelChart({ from, to, source }: FunnelChartProps) {
  const [steps, setSteps] = useState<FunnelResponse['steps']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ from, to });
        if (source) params.set('source', source);
        const res = await fetch(`/api/analytics/funnel?${params.toString()}`);
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
  }, [from, to, source]);

  const handleStageClick = (eventName: string) => {
    setSelectedStage(eventName);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="h-64 sm:h-96 flex items-center justify-center text-gray-500">Loading funnel data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="h-64 sm:h-96 flex items-center justify-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="h-64 sm:h-96 flex items-center justify-center text-gray-500">No funnel data available. Seed events to see conversion metrics.</div>
      </div>
    );
  }

  const maxCount = Math.max(...steps.map(s => s.count));

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
        <p className="text-xs text-gray-500">Click a stage to view records</p>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {steps.map((stage, index) => {
          const widthPercent = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
          const label = STAGE_LABELS[stage.eventName] || stage.eventName;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={stage.eventName}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer"
              onClick={() => handleStageClick(stage.eventName)}
            >
              <div className="w-24 sm:w-32 text-xs sm:text-sm font-medium text-gray-700 text-right shrink-0">
                {label}
              </div>
              <div className="flex-1">
                <div className="relative h-10 sm:h-12 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded transition-all duration-500 flex items-center px-3 sm:px-4"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-white font-semibold text-xs sm:text-sm truncate">
                      {stage.count.toLocaleString()} users
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-20 sm:w-28 text-right shrink-0">
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
      <div className="mt-4 sm:mt-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="min-w-full text-xs sm:text-sm" style={{ minWidth: '480px' }}>
          <thead>
            <tr>
              <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Stage</th>
              <th className="text-right py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Users</th>
              <th className="text-right py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">From Previous</th>
              <th className="text-right py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">From First</th>
              <th className="text-right py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Dropoff</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((stage) => {
              const label = STAGE_LABELS[stage.eventName] || stage.eventName;
              return (
                <tr
                  key={stage.eventName}
                  className="border-t cursor-pointer hover:bg-gray-50"
                  onClick={() => handleStageClick(stage.eventName)}
                >
                  <td className="py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-900">{label}</td>
                  <td className="py-2 px-2 sm:py-2 sm:px-3 text-right text-gray-600">{stage.count.toLocaleString()}</td>
                  <td className="py-2 px-2 sm:py-2 sm:px-3 text-right text-gray-600">{stage.conversionFromPrevious}%</td>
                  <td className="py-2 px-2 sm:py-2 sm:px-3 text-right text-gray-600">{stage.conversionFromFirst}%</td>
                  <td className={`py-2 px-2 sm:py-2 sm:px-3 text-right ${stage.dropoff > 0 ? 'text-red-600' : 'text-gray-400'}`}>
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
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={{
          from,
          to,
          source,
          eventName: selectedStage || undefined,
        }}
        title={selectedStage ? `${STAGE_LABELS[selectedStage] || selectedStage} Records` : 'Funnel Records'}
      />
    </div>
  );
}

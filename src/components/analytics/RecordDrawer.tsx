'use client';

import { useEffect, useState } from 'react';

interface RecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    from: string;
    to: string;
    source?: string;
    eventName?: string;
  };
  title?: string;
}

interface RecordRow {
  id: string;
  userId: string;
  eventName: string;
  properties: string | null;
  device: string | null;
  country: string | null;
  referrer: string | null;
  createdAt: string;
}

export default function RecordDrawer({ isOpen, onClose, filters, title = 'Underlying Records' }: RecordDrawerProps) {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function fetchRecords() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          from: filters.from,
          to: filters.to,
          limit: '50',
          offset: '0',
        });
        if (filters.source) params.set('source', filters.source);
        if (filters.eventName) params.set('event_name', filters.eventName);

        const res = await fetch(`/api/records?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch records (status ${res.status})`);
        }
        const json = await res.json();
        if (!cancelled) {
          setRecords(json.records || []);
          setTotal(json.total || 0);
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

    fetchRecords();
    return () => {
      cancelled = true;
    };
  }, [isOpen, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-4 border-b text-xs sm:text-sm text-gray-600">
          Showing {records.length} of {total} records
          {filters.source && <span> · Segment: {filters.source}</span>}
          {filters.eventName && <span> · Event: {filters.eventName}</span>}
        </div>
        <div className="flex-1 overflow-auto p-3 sm:p-4">
          {loading && <div className="text-center text-gray-500 py-12">Loading records...</div>}
          {error && <div className="text-center text-red-600 py-12">Error: {error}</div>}
          {!loading && !error && records.length === 0 && (
            <div className="text-center text-gray-500 py-12">No records found for the selected filters.</div>
          )}
          {!loading && !error && records.length > 0 && (
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <table className="min-w-full text-xs sm:text-sm" style={{ minWidth: '640px' }}>
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Time</th>
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">User</th>
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Event</th>
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Device</th>
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Country</th>
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Referrer</th>
                    <th className="text-left py-2 px-2 sm:py-2 sm:px-3 font-medium text-gray-500">Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600 whitespace-nowrap">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600 font-mono text-xs">{record.userId}</td>
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-900 font-medium">{record.eventName}</td>
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600 capitalize">{record.device || '—'}</td>
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600 uppercase">{record.country || '—'}</td>
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600">{record.referrer || '—'}</td>
                      <td className="py-2 px-2 sm:py-2 sm:px-3 text-gray-600">
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {record.properties ? JSON.stringify(JSON.parse(record.properties)) : '—'}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <button
            type="button"
            onClick={async () => {
              const params = new URLSearchParams({
                from: filters.from,
                to: filters.to,
              });
              if (filters.source) params.set('source', filters.source);
              if (filters.eventName) params.set('event_name', filters.eventName);

              const res = await fetch(`/api/export?${params.toString()}`);
              if (res.status === 204 || res.status === 404) {
                alert('No data to export for the selected filters.');
                return;
              }
              if (!res.ok) {
                alert('Failed to export data.');
                return;
              }
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `export-${filters.from}-to-${filters.to}${filters.source ? `-${filters.source}` : ''}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm w-full sm:w-auto"
          >
            Export CSV
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

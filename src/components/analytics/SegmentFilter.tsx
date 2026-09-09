'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const SEGMENTS = [
  { value: '', label: 'All' },
  { value: 'organic', label: 'Organic' },
  { value: 'paid', label: 'Paid' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
];

const VALID_SEGMENT_VALUES = new Set(SEGMENTS.map(s => s.value));

export default function SegmentFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSource = searchParams.get('source') || '';
  const [selected, setSelected] = useState(VALID_SEGMENT_VALUES.has(initialSource) ? initialSource : '');

  useEffect(() => {
    const urlSource = searchParams.get('source');
    if (urlSource !== null && VALID_SEGMENT_VALUES.has(urlSource)) {
      setSelected(urlSource);
    } else if (urlSource !== null && !VALID_SEGMENT_VALUES.has(urlSource)) {
      setSelected('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('source');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newSource = e.target.value;
    setSelected(newSource);
    const params = new URLSearchParams(searchParams.toString());
    if (newSource) {
      params.set('source', newSource);
    } else {
      params.delete('source');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <label className="text-xs sm:text-sm text-gray-700">Segment</label>
      <select
        value={selected}
        onChange={handleChange}
        className="border border-gray-300 rounded px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {SEGMENTS.map((seg) => (
          <option key={seg.value} value={seg.value}>
            {seg.label}
          </option>
        ))}
      </select>
    </div>
  );
}

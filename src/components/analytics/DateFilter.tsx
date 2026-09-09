'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(searchParams.get('from') || '2026-08-01');
  const [to, setTo] = useState(searchParams.get('to') || '2026-09-09');

  useEffect(() => {
    const urlFrom = searchParams.get('from');
    const urlTo = searchParams.get('to');
    if (urlFrom) setFrom(urlFrom);
    if (urlTo) setTo(urlTo);
  }, [searchParams]);

  useEffect(() => {
    if (from && to && from > to) {
      const corrected = from;
      setFrom(corrected);
      setTo(corrected);
      const params = new URLSearchParams(searchParams.toString());
      params.set('from', corrected);
      params.set('to', corrected);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [from, to, searchParams, router]);

  function updateDates(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', newFrom);
    params.set('to', newTo);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFrom = e.target.value;
    setFrom(newFrom);
    if (newFrom && to && newFrom > to) {
      setTo(newFrom);
      updateDates(newFrom, newFrom);
    } else {
      updateDates(newFrom, to);
    }
  }

  function handleToChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTo = e.target.value;
    setTo(newTo);
    if (newTo && from && newTo < from) {
      setFrom(newTo);
      updateDates(newTo, newTo);
    } else {
      updateDates(from, newTo);
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
        <span>From</span>
        <input
          type="date"
          value={from}
          onChange={handleFromChange}
          className="border border-gray-300 rounded px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>
      <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
        <span>To</span>
        <input
          type="date"
          value={to}
          onChange={handleToChange}
          className="border border-gray-300 rounded px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>
    </div>
  );
}

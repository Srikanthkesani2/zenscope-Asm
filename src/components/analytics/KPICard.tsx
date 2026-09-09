'use client';

import { useState } from 'react';
import RecordDrawer from './RecordDrawer';

interface KPICardProps {
  title: string;
  value: string | number;
  filters: {
    from: string;
    to: string;
    source?: string;
    eventName?: string;
  };
}

export default function KPICard({ title, value, filters }: KPICardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="w-full text-left bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <h3 className="text-xs sm:text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </button>
      <RecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        title={`${title} - Underlying Records`}
      />
    </>
  );
}

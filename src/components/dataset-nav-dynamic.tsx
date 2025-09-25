// src/components/dataset-nav-dynamic.tsx
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

// Dynamically import DatasetNav with SSR turned off
const DatasetNav = dynamic(() => import('./dataset-nav').then(mod => mod.DatasetNav), {
  ssr: false,
  loading: () => <Skeleton className="h-8 w-full" />,
});

interface DynamicDatasetNavProps {
  isMobile?: boolean;
}

export function DynamicDatasetNav({ isMobile = false }: DynamicDatasetNavProps) {
  return <DatasetNav isMobile={isMobile} />;
}

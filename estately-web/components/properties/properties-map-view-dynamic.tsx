'use client';

import dynamic from 'next/dynamic';
import type { MapProperty } from './properties-map-view';

const PropertiesMapView = dynamic(
  () => import('./properties-map-view').then((module) => module.PropertiesMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[460px] items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-estate-soft">
        <p className="text-sm font-semibold text-stone-600">Loading map...</p>
      </div>
    ),
  },
);

export function PropertiesMapViewDynamic({ properties }: { properties: MapProperty[] }) {
  return <PropertiesMapView properties={properties} />;
}

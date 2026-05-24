'use client';

import { useEffect } from 'react';

interface PropertyViewTrackerProps {
  propertyId: number;
}

export function PropertyViewTracker({ propertyId }: PropertyViewTrackerProps) {
  useEffect(() => {
    const key = `estately:viewed:${propertyId}`;

    if (window.sessionStorage.getItem(key)) {
      return;
    }

    window.sessionStorage.setItem(key, 'true');

    void fetch(`/api/properties/${propertyId}/view`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      keepalive: true,
    });
  }, [propertyId]);

  return null;
}

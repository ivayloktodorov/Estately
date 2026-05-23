'use client';

import Image from 'next/image';
import Link from 'next/link';
import L from 'leaflet';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

export interface MapProperty {
  id: number;
  title: string;
  price: string;
  city: string;
  address: string;
  areaSqm: number;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
}

interface PropertiesMapViewProps {
  properties: MapProperty[];
}

interface MapContentProps {
  properties: MapProperty[];
  selectedPropertyId: number | null;
  onSelectProperty: (propertyId: number) => void;
}

const bulgariaCenter: [number, number] = [42.7339, 25.4858];

function markerIcon(price: string, isSelected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="${
      isSelected ? 'bg-estate-700 text-white ring-estate-700/20' : 'bg-white text-charcoal-950 ring-black/10'
    } rounded-full px-3 py-1 text-xs font-bold shadow-estate-soft ring-4 whitespace-nowrap">${price}</div>`,
    iconAnchor: [32, 14],
    popupAnchor: [0, -16],
  });
}

function MapBounds({ properties }: { properties: MapProperty[] }) {
  const map = useMap();

  useEffect(() => {
    const points = properties
      .filter((property) => property.latitude !== null && property.longitude !== null)
      .map((property) => [property.latitude as number, property.longitude as number] as [number, number]);

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 13 });
    }
  }, [map, properties]);

  return null;
}

function MapContent({ properties, selectedPropertyId, onSelectProperty }: MapContentProps) {
  return (
    <MapContainer
      center={bulgariaCenter}
      className="h-full min-h-[420px] w-full rounded-2xl"
      scrollWheelZoom={false}
      zoom={7}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds properties={properties} />
      {properties.map((property) =>
        property.latitude !== null && property.longitude !== null ? (
          <Marker
            eventHandlers={{ click: () => onSelectProperty(property.id) }}
            icon={markerIcon(property.price, selectedPropertyId === property.id)}
            key={property.id}
            position={[property.latitude, property.longitude]}
          />
        ) : null,
      )}
    </MapContainer>
  );
}

function PropertyPreview({ property }: { property: MapProperty }) {
  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-estate-soft">
      <div className="relative h-28 w-full">
        <Image
          alt={property.title}
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 320px, 100vw"
          src={property.imageUrl}
        />
      </div>
      <div className="p-4">
        <p className="text-base font-bold text-charcoal-950">{property.price}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-charcoal-950">{property.title}</h3>
        <p className="mt-1 text-sm text-stone-600">{property.city}</p>
        <Link
          className="mt-3 inline-flex rounded-lg bg-estate-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-estate-800 focus:outline-none focus:ring-4 focus:ring-estate-700/20"
          href={`/properties/${property.id}`}
        >
          View details
        </Link>
      </div>
    </article>
  );
}

const MemoizedMapContent = memo(MapContent);

export function PropertiesMapView({ properties }: PropertiesMapViewProps) {
  const mappedProperties = useMemo(
    () => properties.filter((property) => property.latitude !== null && property.longitude !== null),
    [properties],
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    mappedProperties[0]?.id ?? null,
  );
  const selectedProperty = useMemo(
    () => mappedProperties.find((property) => property.id === selectedPropertyId) ?? mappedProperties[0],
    [mappedProperties, selectedPropertyId],
  );
  const handleSelectProperty = useCallback((propertyId: number) => {
    setSelectedPropertyId(propertyId);
  }, []);

  if (mappedProperties.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
        <h2 className="text-xl font-semibold text-charcoal-950">
          No map locations available for these properties.
        </h2>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(320px,0.92fr)_minmax(520px,1.4fr)]">
      <div className="order-2 grid max-h-none gap-4 overflow-visible lg:order-1 lg:max-h-[760px] lg:overflow-y-auto lg:pr-2">
        {mappedProperties.map((property) => (
          <button
            aria-label={`Select ${property.title}`}
            className={`grid gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-estate-600 md:grid-cols-[120px_1fr] ${
              selectedProperty?.id === property.id ? 'border-estate-700 ring-4 ring-estate-700/10' : 'border-stone-200'
            }`}
            key={property.id}
            onClick={() => setSelectedPropertyId(property.id)}
            type="button"
          >
            <span className="relative block aspect-video w-full overflow-hidden rounded-xl bg-stone-100 md:aspect-square">
              <Image
                alt={property.title}
                className="object-cover"
                fill
                sizes="(min-width: 768px) 120px, 100vw"
                src={property.imageUrl}
              />
            </span>
            <span>
              <span className="block text-lg font-bold text-charcoal-950">{property.price}</span>
              <span className="mt-1 block font-semibold text-charcoal-950">{property.title}</span>
              <span className="mt-1 block text-sm text-stone-600">
                {property.city} · {property.areaSqm.toLocaleString()} m²
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="order-1 lg:sticky lg:top-6 lg:order-2 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-estate-soft">
          <div className="h-[460px] lg:h-[760px]">
            <MemoizedMapContent
              properties={mappedProperties}
              selectedPropertyId={selectedProperty?.id ?? null}
              onSelectProperty={handleSelectProperty}
            />
          </div>
          {selectedProperty ? (
            <div className="absolute bottom-4 left-4 right-4 z-[500] max-w-sm">
              <PropertyPreview property={selectedProperty} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

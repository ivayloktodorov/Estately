import { eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PropertyDebugPageProps {
  params: Promise<{
    id: string;
  }>;
}

function parsePropertyId(id: string): number | null {
  const propertyId = Number(id);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

async function getPropertyByIdOnly(propertyId: number) {
  return db
    .select({
      id: properties.id,
      title: properties.title,
      isPublished: properties.isPublished,
      moderationStatus: properties.moderationStatus,
      listingType: properties.listingType,
    })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((results) => results[0] ?? null);
}

export default async function PropertyDebugPage({ params }: PropertyDebugPageProps) {
  const { id } = await params;
  const propertyId = parsePropertyId(id);
  const property = propertyId ? await getPropertyByIdOnly(propertyId) : null;

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Property Debug Page</h1>
      <dl>
        <dt>Requested id</dt>
        <dd>{id}</dd>
        <dt>Parsed id</dt>
        <dd>{propertyId ?? 'invalid'}</dd>
        <dt>Found by id only</dt>
        <dd>{property ? 'true' : 'false'}</dd>
        <dt>Title</dt>
        <dd>{property?.title ?? 'null'}</dd>
        <dt>isPublished</dt>
        <dd>{property ? String(property.isPublished) : 'null'}</dd>
        <dt>moderationStatus</dt>
        <dd>{property?.moderationStatus ?? 'null'}</dd>
        <dt>listingType</dt>
        <dd>{property?.listingType ?? 'null'}</dd>
      </dl>
    </main>
  );
}

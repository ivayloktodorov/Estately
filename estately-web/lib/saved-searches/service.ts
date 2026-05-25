import { and, desc, eq, gte, ilike, isNull, lte, or } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, savedSearches } from '@/src/db/schema';
import { createNotification } from '@/lib/notifications/service';
import { LISTING_TYPES, PROPERTY_TYPES, type ListingType, type PropertyType } from '@/lib/properties/constants';
import type { PropertySearchFilters } from '@/lib/properties/search';

export interface SavedSearchInput {
  title: string;
  city?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface SavedSearchListItem extends SavedSearchInput {
  id: number;
  createdAt: Date;
}

export interface MatchingProperty {
  id: number;
  title: string;
  city: string;
  price: string;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
}

function cleanText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanNumber(value: FormDataEntryValue | null): number | undefined {
  const text = cleanText(value);

  if (!text) {
    return undefined;
  }

  const numberValue = Number(text);

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
}

function cleanPropertyType(value: FormDataEntryValue | null): PropertyType | undefined {
  const text = cleanText(value);
  return PROPERTY_TYPES.find((type) => type === text);
}

function cleanListingType(value: FormDataEntryValue | null): ListingType | undefined {
  const text = cleanText(value);
  return LISTING_TYPES.find((type) => type === text);
}

export function savedSearchFromFormData(formData: FormData): SavedSearchInput {
  const title = cleanText(formData.get('title'));

  if (!title) {
    throw new Error('Search name is required.');
  }

  if (title.length > 120) {
    throw new Error('Search name must be 120 characters or fewer.');
  }

  return {
    title,
    city: cleanText(formData.get('city')) || undefined,
    propertyType: cleanPropertyType(formData.get('type') ?? formData.get('propertyType')),
    listingType: cleanListingType(formData.get('listing') ?? formData.get('listingType')),
    minPrice: cleanNumber(formData.get('minPrice')),
    maxPrice: cleanNumber(formData.get('maxPrice')),
    bedrooms: cleanNumber(formData.get('bedrooms')),
    bathrooms: cleanNumber(formData.get('bathrooms')),
  };
}

function toListItem(row: typeof savedSearches.$inferSelect): SavedSearchListItem {
  return {
    id: row.id,
    title: row.title,
    city: row.city ?? undefined,
    propertyType: (PROPERTY_TYPES.find((type) => type === row.propertyType) ?? undefined) as PropertyType | undefined,
    listingType: (LISTING_TYPES.find((type) => type === row.listingType) ?? undefined) as ListingType | undefined,
    minPrice: row.minPrice ?? undefined,
    maxPrice: row.maxPrice ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function createSavedSearch(userId: number, input: SavedSearchInput): Promise<void> {
  await db.insert(savedSearches).values({
    userId,
    title: input.title,
    city: input.city,
    propertyType: input.propertyType,
    listingType: input.listingType,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
  });
}

export async function updateSavedSearch(userId: number, savedSearchId: number, input: SavedSearchInput): Promise<void> {
  await db
    .update(savedSearches)
    .set({
      title: input.title,
      city: input.city ?? null,
      propertyType: input.propertyType ?? null,
      listingType: input.listingType ?? null,
      minPrice: input.minPrice ?? null,
      maxPrice: input.maxPrice ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
    })
    .where(and(eq(savedSearches.id, savedSearchId), eq(savedSearches.userId, userId)));
}

export async function deleteSavedSearch(userId: number, savedSearchId: number): Promise<void> {
  await db.delete(savedSearches).where(and(eq(savedSearches.id, savedSearchId), eq(savedSearches.userId, userId)));
}

export async function getUserSavedSearches(userId: number): Promise<SavedSearchListItem[]> {
  const rows = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt), desc(savedSearches.id));

  return rows.map(toListItem);
}

export function savedSearchToPropertyFilters(search: SavedSearchListItem): PropertySearchFilters {
  return {
    city: search.city,
    type: search.propertyType,
    listing: search.listingType,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    bedrooms: search.bedrooms,
    bathrooms: search.bathrooms,
  };
}

export function savedSearchResultsHref(search: SavedSearchListItem): string {
  const params = new URLSearchParams();

  if (search.city) params.set('city', search.city);
  if (search.propertyType) params.set('type', search.propertyType);
  if (search.listingType) params.set('listing', search.listingType);
  if (search.minPrice !== undefined) params.set('minPrice', search.minPrice.toString());
  if (search.maxPrice !== undefined) params.set('maxPrice', search.maxPrice.toString());
  if (search.bedrooms !== undefined) params.set('bedrooms', search.bedrooms.toString());
  if (search.bathrooms !== undefined) params.set('bathrooms', search.bathrooms.toString());

  const query = params.toString();
  return query ? `/properties?${query}` : '/properties';
}

export async function notifySavedSearchMatchesForProperty(propertyId: number): Promise<void> {
  const property = await db.select().from(properties).where(eq(properties.id, propertyId)).then((rows) => rows[0]);

  if (!property || property.moderationStatus !== 'approved') {
    return;
  }

  const matchingSearches = await db
    .select()
    .from(savedSearches)
    .where(
      and(
        or(isNull(savedSearches.city), ilike(savedSearches.city, property.city)),
        or(isNull(savedSearches.propertyType), eq(savedSearches.propertyType, property.propertyType)),
        or(isNull(savedSearches.listingType), eq(savedSearches.listingType, property.listingType)),
        or(isNull(savedSearches.minPrice), lte(savedSearches.minPrice, Number(property.price))),
        or(isNull(savedSearches.maxPrice), gte(savedSearches.maxPrice, Number(property.price))),
        or(isNull(savedSearches.bedrooms), lte(savedSearches.bedrooms, property.bedrooms)),
        or(isNull(savedSearches.bathrooms), lte(savedSearches.bathrooms, property.bathrooms)),
      ),
    );

  await Promise.all(
    matchingSearches.map((search) =>
      createNotification({
        userId: search.userId,
        type: 'system',
        title: 'New property matches your search',
        message: `"${property.title}" in ${property.city} matches "${search.title}".`,
        entityType: 'property',
        entityId: property.id,
        href: `/property/${property.id}`,
      }),
    ),
  );
}

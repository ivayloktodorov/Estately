import { and, asc, count, desc, eq, gte, ilike, lte, or, type SQL } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, propertyImages } from '@/src/db/schema';
import type { MobilePropertyFilters } from './validation';

type PropertySort = MobilePropertyFilters['sort'];

function buildMobilePropertyConditions(filters: MobilePropertyFilters): SQL[] {
  const conditions: SQL[] = [eq(properties.moderationStatus, 'approved')];

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    const searchCondition = or(
      ilike(properties.title, searchPattern),
      ilike(properties.city, searchPattern),
      ilike(properties.address, searchPattern),
      ilike(properties.description, searchPattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.city) {
    conditions.push(ilike(properties.city, filters.city));
  }

  if (filters.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType));
  }

  if (filters.listingType) {
    conditions.push(eq(properties.listingType, filters.listingType));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(properties.price, filters.minPrice.toString()));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(properties.price, filters.maxPrice.toString()));
  }

  if (filters.bedrooms !== undefined) {
    conditions.push(gte(properties.bedrooms, filters.bedrooms));
  }

  if (filters.bathrooms !== undefined) {
    conditions.push(gte(properties.bathrooms, filters.bathrooms));
  }

  return conditions;
}

function mobilePropertySortOrder(sort: PropertySort) {
  switch (sort) {
    case 'oldest':
      return [asc(properties.createdAt), asc(properties.id)];
    case 'price_asc':
      return [asc(properties.price), desc(properties.createdAt)];
    case 'price_desc':
      return [desc(properties.price), desc(properties.createdAt)];
    case 'area_asc':
      return [asc(properties.areaSqm), desc(properties.createdAt)];
    case 'area_desc':
      return [desc(properties.areaSqm), desc(properties.createdAt)];
    case 'newest':
    default:
      return [desc(properties.createdAt), desc(properties.id)];
  }
}

export async function getMobilePaginatedProperties(filters: MobilePropertyFilters) {
  const whereClause = and(...buildMobilePropertyConditions(filters));
  const totalRows = await db.select({ value: count() }).from(properties).where(whereClause);
  const total = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const page = Math.min(filters.page, totalPages);
  const offset = (page - 1) * filters.limit;

  const rows =
    total > 0
      ? await db
          .select()
          .from(properties)
          .where(whereClause)
          .orderBy(...mobilePropertySortOrder(filters.sort))
          .limit(filters.limit)
          .offset(offset)
      : [];

  return {
    properties: rows,
    pagination: {
      page,
      limit: filters.limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

export async function getMobilePropertyDetails(propertyId: number) {
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) {
    return null;
  }

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.id));

  return { ...property, images };
}

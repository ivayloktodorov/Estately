import { and, asc, count, desc, eq, gte, ilike, lte, ne, or, sql, type SQL } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import {
  LISTING_TYPES,
  PROPERTY_SORT_OPTIONS,
  PROPERTY_TYPES,
  type ListingType,
  type PropertySortValue,
  type PropertyType,
} from './constants';

export interface PropertySearchFilters {
  search?: string;
  city?: string;
  type?: PropertyType;
  listing?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface PropertyPagination {
  page: number;
  pageSize: number;
}

export interface PaginatedPropertiesResult {
  properties: (typeof properties.$inferSelect)[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

type SearchParamValue = string | string[] | undefined;
export type PropertySearchParams = Record<string, SearchParamValue>;

export const DEFAULT_PROPERTIES_PAGE_SIZE = 12;
const MIN_PAGE = 1;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 48;

function firstParam(value: SearchParamValue): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function cleanText(value: SearchParamValue): string | undefined {
  const text = firstParam(value).trim();
  return text.length > 0 ? text : undefined;
}

function cleanNumber(value: SearchParamValue): number | undefined {
  const text = firstParam(value).trim();

  if (!text) {
    return undefined;
  }

  const numberValue = Number(text);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

function cleanPositiveInteger(
  value: SearchParamValue,
  fallback: number,
  options?: { max?: number },
): number {
  const text = firstParam(value).trim();
  const numberValue = Number(text);

  if (!Number.isInteger(numberValue) || numberValue < MIN_PAGE_SIZE) {
    return fallback;
  }

  return options?.max ? Math.min(numberValue, options.max) : numberValue;
}

function cleanPropertyType(value: SearchParamValue): PropertyType | undefined {
  const text = cleanText(value);
  return PROPERTY_TYPES.find((propertyType) => propertyType === text);
}

function cleanListingType(value: SearchParamValue): ListingType | undefined {
  const text = cleanText(value);
  return LISTING_TYPES.find((listingType) => listingType === text);
}

export function parsePropertySortParam(searchParams: PropertySearchParams): PropertySortValue {
  const sort = cleanText(searchParams.sort);
  return PROPERTY_SORT_OPTIONS.some((option) => option.value === sort)
    ? (sort as PropertySortValue)
    : 'newest';
}

export function parsePropertySearchParams(
  searchParams: PropertySearchParams,
): PropertySearchFilters {
  return {
    search: cleanText(searchParams.search ?? searchParams.q),
    city: cleanText(searchParams.city),
    type: cleanPropertyType(searchParams.type),
    listing: cleanListingType(searchParams.listing),
    minPrice: cleanNumber(searchParams.minPrice),
    maxPrice: cleanNumber(searchParams.maxPrice),
    bedrooms: cleanNumber(searchParams.bedrooms),
    bathrooms: cleanNumber(searchParams.bathrooms),
  };
}

export function parsePropertyPaginationParams(
  searchParams: PropertySearchParams,
): PropertyPagination {
  return {
    page: cleanPositiveInteger(searchParams.page, MIN_PAGE),
    pageSize: cleanPositiveInteger(searchParams.pageSize, DEFAULT_PROPERTIES_PAGE_SIZE, {
      max: MAX_PAGE_SIZE,
    }),
  };
}

function buildPropertyConditions(filters: PropertySearchFilters): SQL[] {
  const conditions: SQL[] = [
    eq(properties.moderationStatus, 'approved'),
    eq(properties.isPublished, true),
  ];

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

  if (filters.type) {
    conditions.push(eq(properties.propertyType, filters.type));
  }

  if (filters.listing) {
    conditions.push(eq(properties.listingType, filters.listing));
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    conditions.push(gte(properties.price, filters.minPrice.toString()));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    conditions.push(lte(properties.price, filters.maxPrice.toString()));
  }

  if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
    conditions.push(gte(properties.bedrooms, filters.bedrooms));
  }

  if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
    conditions.push(gte(properties.bathrooms, filters.bathrooms));
  }

  return conditions;
}

function propertySortOrder(sort: PropertySortValue) {
  switch (sort) {
    case 'oldest':
      return [asc(properties.createdAt), asc(properties.id)];
    case 'price_asc':
      return [asc(properties.price), desc(properties.createdAt)];
    case 'price_desc':
      return [desc(properties.price), desc(properties.createdAt)];
    case 'area_desc':
      return [desc(properties.areaSqm), desc(properties.createdAt)];
    case 'area_asc':
      return [asc(properties.areaSqm), desc(properties.createdAt)];
    case 'newest':
    default:
      return [desc(properties.createdAt), desc(properties.id)];
  }
}

export async function getFilteredProperties(filters: PropertySearchFilters) {
  return db
    .select()
    .from(properties)
    .where(and(...buildPropertyConditions(filters)))
    .orderBy(desc(properties.createdAt), desc(properties.id));
}

export async function getPaginatedProperties(
  filters: PropertySearchFilters,
  pagination: PropertyPagination,
  sort: PropertySortValue = 'newest',
): Promise<PaginatedPropertiesResult> {
  const conditions = buildPropertyConditions(filters);
  const whereClause = and(...conditions);

  const totalRows = await db
    .select({ value: count() })
    .from(properties)
    .where(whereClause);

  const totalCount = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));
  const currentPage = Math.min(pagination.page, totalPages);
  const offset = (currentPage - 1) * pagination.pageSize;

  const pageProperties =
    totalCount > 0
      ? await db
          .select()
          .from(properties)
          .where(whereClause)
          .orderBy(...propertySortOrder(sort))
          .limit(pagination.pageSize)
          .offset(offset)
      : [];

  return {
    properties: pageProperties,
    totalCount,
    currentPage,
    pageSize: pagination.pageSize,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

export function propertyResultsHref(basePath: string, searchParams: PropertySearchParams): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const paramValue = firstParam(value).trim();

    if (paramValue) {
      params.set(key, paramValue);
    }
  });

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function propertyDetailsHref(propertyId: number, returnTo: string): string {
  const params = new URLSearchParams({ returnTo });
  return `/properties/${propertyId}?${params.toString()}`;
}

export async function getSimilarProperties(
  property: typeof properties.$inferSelect,
  limit = 6,
) {
  const price = Number(property.price);
  const minPrice = Number.isFinite(price) ? (price * 0.7).toFixed(2) : undefined;
  const maxPrice = Number.isFinite(price) ? (price * 1.3).toFixed(2) : undefined;
  const conditions: SQL[] = [
    eq(properties.moderationStatus, 'approved'),
    eq(properties.isPublished, true),
    ne(properties.id, property.id),
    eq(properties.listingType, property.listingType),
  ];

  if (minPrice && maxPrice) {
    conditions.push(gte(properties.price, minPrice), lte(properties.price, maxPrice));
  }

  return db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(
      desc(sql<number>`case when ${properties.propertyType} = ${property.propertyType} then 1 else 0 end`),
      desc(sql<number>`case when lower(${properties.city}) = lower(${property.city}) then 1 else 0 end`),
      asc(sql<number>`abs(${properties.price}::numeric - ${property.price}::numeric)`),
      desc(properties.createdAt),
    )
    .limit(Math.min(Math.max(limit, 1), 6));
}

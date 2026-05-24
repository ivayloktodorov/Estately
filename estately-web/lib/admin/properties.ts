import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, propertyImages, users } from '@/src/db/schema';

export const MODERATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

const LISTING_FILTERS = ['sale', 'rent'] as const;
const ADMIN_PROPERTY_SORTS = ['newest', 'oldest', 'price_asc', 'price_desc', 'title', 'city', 'status'] as const;
type ListingFilter = (typeof LISTING_FILTERS)[number];
export type AdminPropertySort = (typeof ADMIN_PROPERTY_SORTS)[number];
export type AdminPropertiesSearchParams = Record<string, string | string[] | undefined>;

export interface AdminProperty {
  id: number;
  title: string;
  city: string;
  price: string;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  imageCoverUrl: string;
  imageCount: number;
  isPublished: boolean;
  moderationStatus: ModerationStatus;
  moderationNotes: string | null;
  createdAt: Date;
  owner: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

export interface AdminPropertiesResult {
  properties: AdminProperty[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  search: string;
  status: ModerationStatus | '';
  listing: ListingFilter | '';
  sort: AdminPropertySort;
}

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE = 1;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function moderationStatus(value: string): ModerationStatus | '' {
  return MODERATION_STATUSES.includes(value as ModerationStatus) ? (value as ModerationStatus) : '';
}

function listingFilter(value: string): ListingFilter | '' {
  return LISTING_FILTERS.includes(value as ListingFilter) ? (value as ListingFilter) : '';
}

function propertySort(value: string): AdminPropertySort {
  return ADMIN_PROPERTY_SORTS.includes(value as AdminPropertySort) ? (value as AdminPropertySort) : 'newest';
}

export function parseAdminPropertiesSearchParams(searchParams: AdminPropertiesSearchParams) {
  const pageValue = Number(firstParam(searchParams.page));

  return {
    page: Number.isInteger(pageValue) && pageValue >= MIN_PAGE ? pageValue : MIN_PAGE,
    search: firstParam(searchParams.search).trim(),
    status: moderationStatus(firstParam(searchParams.status)),
    listing: listingFilter(firstParam(searchParams.listing)),
    sort: propertySort(firstParam(searchParams.sort)),
  };
}

function buildConditions(parsed: ReturnType<typeof parseAdminPropertiesSearchParams>): SQL[] {
  const conditions: SQL[] = [];

  if (parsed.search) {
    const pattern = `%${parsed.search}%`;
    const searchCondition = or(
      ilike(properties.title, pattern),
      ilike(properties.city, pattern),
      ilike(users.fullName, pattern),
      ilike(users.email, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (parsed.status) {
    conditions.push(eq(properties.moderationStatus, parsed.status));
  }

  if (parsed.listing) {
    conditions.push(eq(properties.listingType, parsed.listing));
  }

  return conditions;
}

function sortOrder(sort: AdminPropertySort) {
  switch (sort) {
    case 'oldest':
      return [asc(properties.createdAt), asc(properties.id)];
    case 'price_asc':
      return [asc(properties.price), desc(properties.createdAt)];
    case 'price_desc':
      return [desc(properties.price), desc(properties.createdAt)];
    case 'title':
      return [asc(properties.title), asc(properties.id)];
    case 'city':
      return [asc(properties.city), asc(properties.id)];
    case 'status':
      return [asc(properties.moderationStatus), desc(properties.createdAt)];
    case 'newest':
    default:
      return [desc(properties.createdAt), desc(properties.id)];
  }
}

export async function getAdminProperties(
  searchParams: AdminPropertiesSearchParams = {},
): Promise<AdminPropertiesResult> {
  const parsed = parseAdminPropertiesSearchParams(searchParams);
  const conditions = buildConditions(parsed);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalRows = await db
    .select({ value: count() })
    .from(properties)
    .leftJoin(users, eq(properties.createdByUserId, users.id))
    .where(whereClause);

  const totalCount = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(parsed.page, totalPages);
  const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;

  const rows =
    totalCount > 0
      ? await db
          .select({
            id: properties.id,
            title: properties.title,
            city: properties.city,
            price: properties.price,
            propertyType: properties.propertyType,
            listingType: properties.listingType,
            bedrooms: properties.bedrooms,
            bathrooms: properties.bathrooms,
            areaSqm: properties.areaSqm,
            imageCoverUrl: properties.imageCoverUrl,
            isPublished: properties.isPublished,
            moderationStatus: properties.moderationStatus,
            moderationNotes: properties.moderationNotes,
            createdAt: properties.createdAt,
            ownerId: users.id,
            ownerFullName: users.fullName,
            ownerEmail: users.email,
          })
          .from(properties)
          .leftJoin(users, eq(properties.createdByUserId, users.id))
          .where(whereClause)
          .orderBy(...sortOrder(parsed.sort))
          .limit(DEFAULT_PAGE_SIZE)
          .offset(offset)
      : [];
  const imageCounts =
    rows.length > 0
      ? await db
          .select({ propertyId: propertyImages.propertyId, value: count() })
          .from(propertyImages)
          .where(inArray(propertyImages.propertyId, rows.map((row) => row.id)))
          .groupBy(propertyImages.propertyId)
      : [];
  const imageCountByPropertyId = new Map(imageCounts.map((row) => [row.propertyId, row.value]));

  return {
    properties: rows.map((row) => ({
      id: row.id,
      title: row.title,
      city: row.city,
      price: row.price,
      propertyType: row.propertyType,
      listingType: row.listingType,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      areaSqm: row.areaSqm,
      imageCoverUrl: row.imageCoverUrl,
      imageCount: imageCountByPropertyId.get(row.id) ?? 0,
      isPublished: row.isPublished,
      moderationStatus: moderationStatus(row.moderationStatus) || 'pending',
      moderationNotes: row.moderationNotes,
      createdAt: row.createdAt,
      owner:
        row.ownerId === null || row.ownerFullName === null || row.ownerEmail === null
          ? null
          : {
              id: row.ownerId,
              fullName: row.ownerFullName,
              email: row.ownerEmail,
            },
    })),
    totalCount,
    currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    search: parsed.search,
    status: parsed.status,
    listing: parsed.listing,
    sort: parsed.sort,
  };
}

export async function updatePropertyModeration(
  propertyIds: number[],
  status: ModerationStatus,
  notes: string | null,
): Promise<void> {
  if (propertyIds.length === 0) {
    return;
  }

  await db
    .update(properties)
    .set({
      moderationStatus: status,
      moderationNotes: notes,
      isPublished: status === 'approved',
      updatedAt: new Date(),
    })
    .where(inArray(properties.id, propertyIds));
}

import { z } from 'zod';
import { LISTING_TYPES, PROPERTY_SORT_OPTIONS, PROPERTY_TYPES } from '@/lib/properties/constants';

const positiveIdSchema = z.coerce
  .number({ error: 'Invalid ID.' })
  .int('Invalid ID.')
  .positive('Invalid ID.');

const optionalTrimmedTextSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined),
  z.string().optional(),
);

export const mobileLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const mobileRegisterSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  fullName: z.string().trim().min(2, 'Enter your full name.'),
});

export const mobilePropertyIdSchema = positiveIdSchema;

export const mobileFavoriteSchema = z.object({
  propertyId: positiveIdSchema,
});

export const mobileInquirySchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(1000, 'Message must be 1000 characters or fewer.'),
});

export const mobilePropertyFiltersSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(48).default(20),
    search: optionalTrimmedTextSchema,
    city: optionalTrimmedTextSchema,
    propertyType: z.enum(PROPERTY_TYPES).optional(),
    listingType: z.enum(LISTING_TYPES).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    bathrooms: z.coerce.number().int().nonnegative().optional(),
    sort: z
      .enum(PROPERTY_SORT_OPTIONS.map((option) => option.value) as [string, ...string[]])
      .default('newest'),
  })
  .refine(
    (filters) =>
      filters.minPrice === undefined ||
      filters.maxPrice === undefined ||
      filters.minPrice <= filters.maxPrice,
    {
      message: 'Minimum price cannot be greater than maximum price.',
      path: ['minPrice'],
    },
  );

export type MobilePropertyFilters = z.infer<typeof mobilePropertyFiltersSchema>;

export function validationErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Invalid request.';
  }

  return error instanceof Error ? error.message : 'Invalid request.';
}

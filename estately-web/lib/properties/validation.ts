import { z } from 'zod';
import { PROPERTY_TYPES, LISTING_TYPES } from './constants';

export const createPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be at most 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().trim().min(1, 'Price is required').transform((val) => Number(val)).refine((val) => Number.isFinite(val) && val > 0, 'Price must be a positive number'),
  city: z.enum(['Sofia', 'Varna', 'Burgas', 'Plovdiv'], { message: 'Please select a valid city' }),
  address: z.string().min(3, 'Address must be at least 3 characters'),
  propertyType: z.enum(PROPERTY_TYPES, { message: 'Please select a valid property type' }),
  listingType: z.enum(LISTING_TYPES, { message: 'Please select a valid listing type' }),
  bedrooms: z.string().trim().min(1, 'Bedrooms are required').transform((val) => Number(val)).refine((val) => Number.isInteger(val) && val >= 0, 'Bedrooms must be a non-negative integer'),
  bathrooms: z.string().trim().min(1, 'Bathrooms are required').transform((val) => Number(val)).refine((val) => Number.isInteger(val) && val >= 0, 'Bathrooms must be a non-negative integer'),
  areaSqm: z.string().trim().min(1, 'Square meters are required').transform((val) => Number(val)).refine((val) => Number.isInteger(val) && val > 0, 'Square meters must be a positive integer'),
});

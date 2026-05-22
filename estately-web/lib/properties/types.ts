import type { z } from 'zod';
import { createPropertySchema } from './validation';

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export interface PropertyActionState {
  status: 'idle' | 'error' | 'success';
  message: string;
  fields?: Record<string, string>;
  errors?: Partial<Record<string, string>>;
}

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { uploadR2Image } from './r2';

const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const maxImageSizeBytes = 5 * 1024 * 1024;
const localUploadDir = join(process.cwd(), 'public', 'uploads', 'property-images');

export interface UploadPropertyImageResult {
  imageUrl: string;
}

export type PropertyImageUploadMode = 'r2' | 'local fallback' | 'disabled';

export class PropertyImageUploadError extends Error {
  constructor(
    message: string,
    public readonly safeMessage: string,
  ) {
    super(message);
    this.name = 'PropertyImageUploadError';
  }
}

function r2Config() {
  return {
    accountId: optionalEnv('R2_ACCOUNT_ID', 'CLOUDFLARE_R2_ACCOUNT_ID'),
    accessKeyId: optionalEnv('R2_ACCESS_KEY_ID', 'CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: optionalEnv('R2_SECRET_ACCESS_KEY', 'CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    bucket: optionalEnv('R2_BUCKET_NAME', 'R2_BUCKET', 'CLOUDFLARE_R2_BUCKET'),
    publicUrl: optionalEnv('R2_PUBLIC_URL', 'CLOUDFLARE_R2_PUBLIC_URL'),
  };
}

function missingR2ConfigKeys(): string[] {
  const config = r2Config();
  const missing: string[] = [];

  if (!config.accountId) missing.push('R2_ACCOUNT_ID or CLOUDFLARE_R2_ACCOUNT_ID');
  if (!config.accessKeyId) missing.push('R2_ACCESS_KEY_ID or CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!config.secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY or CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  if (!config.bucket) missing.push('R2_BUCKET_NAME or R2_BUCKET or CLOUDFLARE_R2_BUCKET');
  if (!config.publicUrl) missing.push('R2_PUBLIC_URL or CLOUDFLARE_R2_PUBLIC_URL');

  return missing;
}

function shouldUseLocalDevStorage(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_LOCAL_UPLOAD_FALLBACK === '1';
}

function optionalEnv(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  return null;
}

export function getPropertyImageUploadMode(): PropertyImageUploadMode {
  if (missingR2ConfigKeys().length === 0) {
    return 'r2';
  }

  return shouldUseLocalDevStorage() ? 'local fallback' : 'disabled';
}

export function assertPropertyImageUploadsConfigured(): void {
  const missing = missingR2ConfigKeys();

  if (missing.length === 0 || shouldUseLocalDevStorage()) {
    return;
  }

  throw new PropertyImageUploadError(
    `Cloudflare R2 uploads are not configured. Missing: ${missing.join(', ')}.`,
    'Image upload is not configured in production.',
  );
}

export function validatePropertyImageFile(file: File): string | null {
  if (file.size === 0) {
    return 'Please choose an image file to upload.';
  }

  if (file.size > maxImageSizeBytes) {
    return 'Image must be 5MB or smaller.';
  }

  if (!allowedImageTypes.has(file.type)) {
    return 'Only JPG, JPEG, PNG, and WEBP images are allowed.';
  }

  return null;
}

function objectKey(file: File, propertyId: number): string {
  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    throw new Error('Unsupported image type.');
  }

  return `property-images/${propertyId}/${Date.now()}-${randomUUID()}.${extension}`;
}

async function uploadToLocalDevStorage(file: File, propertyId: number) {
  await mkdir(localUploadDir, { recursive: true });

  const key = objectKey(file, propertyId);
  const fileName = key.split('/').pop();

  if (!fileName) {
    throw new Error('Unable to create upload filename.');
  }

  const filePath = join(localUploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/uploads/property-images/${fileName}`;
}

async function uploadToR2(file: File, propertyId: number): Promise<string> {
  try {
    const upload = await uploadR2Image(file, `property-images/${propertyId}`);
    return upload.imageUrl;
  } catch (error) {
    throw new PropertyImageUploadError(
      error instanceof Error ? error.message : 'Unable to upload image to Cloudflare R2.',
      'Property created, but image upload failed.',
    );
  }
}

export async function uploadPropertyImage(
  file: File,
  propertyId: number,
): Promise<UploadPropertyImageResult> {
  const validationError = validatePropertyImageFile(file);

  if (validationError) {
    throw new PropertyImageUploadError(validationError, validationError);
  }

  if (missingR2ConfigKeys().length === 0) {
    return { imageUrl: await uploadToR2(file, propertyId) };
  }

  if (shouldUseLocalDevStorage()) {
    return { imageUrl: await uploadToLocalDevStorage(file, propertyId) };
  }

  assertPropertyImageUploadsConfigured();
  throw new PropertyImageUploadError(
    'Cloudflare R2 uploads are not configured.',
    'Image upload is not configured in production.',
  );
}

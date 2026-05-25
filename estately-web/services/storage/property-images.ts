import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getR2ConfigStatus, uploadR2Image } from './r2';

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

function missingR2ConfigKeys(): string[] {
  const config = getR2ConfigStatus();
  const missing: string[] = [];

  if (!config.hasEndpoint) missing.push('R2_URL, R2_ACCOUNT_ID, or CLOUDFLARE_R2_ACCOUNT_ID');
  if (!config.hasAccessKey) missing.push('R2_ACCESS_KEY_ID or CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!config.hasSecretKey) missing.push('R2_SECRET_ACCESS_KEY or CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  if (!config.hasBucket) missing.push('R2_BUCKET or R2_BUCKET_NAME or CLOUDFLARE_R2_BUCKET');

  return missing;
}

function shouldUseLocalDevStorage(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_LOCAL_UPLOAD_FALLBACK === '1';
}

export function getPropertyImageUploadMode(): PropertyImageUploadMode {
  if (getR2ConfigStatus().isConfigured) {
    return 'r2';
  }

  return shouldUseLocalDevStorage() ? 'local fallback' : 'disabled';
}

export function getPropertyImageUploadConfigDiagnostics() {
  const config = getR2ConfigStatus();

  return {
    hasR2Url: config.hasR2Url,
    hasAccountId: config.hasAccountId,
    hasBucket: config.hasBucket,
    hasPublicUrl: config.hasPublicUrl,
    hasAccessKey: config.hasAccessKey,
    hasSecretKey: config.hasSecretKey,
    uploadMode: getPropertyImageUploadMode(),
  };
}

export function assertPropertyImageUploadsConfigured(): void {
  const missing = missingR2ConfigKeys();

  if (getR2ConfigStatus().isConfigured || shouldUseLocalDevStorage()) {
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

  if (getR2ConfigStatus().isConfigured) {
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

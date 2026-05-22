import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash, createHmac, randomUUID } from 'node:crypto';

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

function hasR2Config(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET &&
      process.env.CLOUDFLARE_R2_PUBLIC_URL,
  );
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
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

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac('sha256', key).update(value).digest();
}

function sha256Hex(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function r2SigningKey(secretAccessKey: string, dateStamp: string): Buffer {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, 'auto');
  const serviceKey = hmac(regionKey, 's3');
  return hmac(serviceKey, 'aws4_request');
}

async function uploadToR2(file: File, propertyId: number): Promise<string> {
  const accountId = requiredEnv('CLOUDFLARE_R2_ACCOUNT_ID');
  const accessKeyId = requiredEnv('CLOUDFLARE_R2_ACCESS_KEY_ID');
  const secretAccessKey = requiredEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  const bucket = requiredEnv('CLOUDFLARE_R2_BUCKET');
  const publicUrl = requiredEnv('CLOUDFLARE_R2_PUBLIC_URL').replace(/\/$/, '');
  const key = objectKey(file, propertyId);
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const url = `https://${host}/${bucket}/${encodedKey}`;
  const body = Buffer.from(await file.arrayBuffer());
  const payloadHash = sha256Hex(body);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    `/${bucket}/${encodedKey}`,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');
  const signature = createHmac('sha256', r2SigningKey(secretAccessKey, dateStamp))
    .update(stringToSign)
    .digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: 'PUT',
    body,
    headers: {
      Authorization: authorization,
      'Content-Type': file.type,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to upload image to Cloudflare R2.');
  }

  return `${publicUrl}/${key}`;
}

export async function uploadPropertyImage(
  file: File,
  propertyId: number,
): Promise<UploadPropertyImageResult> {
  const validationError = validatePropertyImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const imageUrl = hasR2Config()
    ? await uploadToR2(file, propertyId)
    : await uploadToLocalDevStorage(file, propertyId);

  return { imageUrl };
}

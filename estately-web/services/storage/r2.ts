import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(process.cwd(), '../.env'), quiet: true });
loadEnv({ path: path.resolve(process.cwd(), '../.env.local'), quiet: true, override: false });

const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const maxImageSizeBytes = 5 * 1024 * 1024;
const maxAttachmentSizeBytes = 10 * 1024 * 1024;

const allowedAttachmentTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['application/pdf', 'pdf'],
  ['application/msword', 'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
]);

export interface R2UploadResult {
  imageUrl: string;
  key: string;
}

export interface R2AttachmentUploadResult {
  fileUrl: string;
  key: string;
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

function requiredEnv(...names: string[]): string {
  const value = optionalEnv(...names);

  if (!value) {
    throw new Error(`${names.join(' or ')} is not configured.`);
  }

  return value;
}

function getR2Endpoint(): string {
  const explicitEndpoint = optionalEnv('R2_URL', 'CLOUDFLARE_R2_URL');

  if (explicitEndpoint) {
    return explicitEndpoint.replace(/\/$/, '');
  }

  const accountId = requiredEnv('R2_ACCOUNT_ID', 'CLOUDFLARE_R2_ACCOUNT_ID');

  return `https://${accountId}.r2.cloudflarestorage.com`;
}

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: getR2Endpoint(),
    credentials: {
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID', 'CLOUDFLARE_R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY', 'CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    },
  });
}

export function validateR2ImageFile(file: File): string | null {
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

export function validateR2MessageAttachment(file: File): string | null {
  if (file.size === 0) {
    return 'Please choose a file to attach.';
  }

  if (file.size > maxAttachmentSizeBytes) {
    return 'Attachment must be 10MB or smaller.';
  }

  if (!allowedAttachmentTypes.has(file.type)) {
    return 'Only JPG, JPEG, PNG, WEBP, PDF, DOC, and DOCX files are allowed.';
  }

  return null;
}

function sanitizeBaseName(fileName: string): string {
  const parsed = path.parse(fileName);
  const safeName = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return safeName || 'attachment';
}

function createObjectKey(file: File, folder = 'test-r2', allowedTypes = allowedImageTypes): string {
  const extension = allowedTypes.get(file.type);

  if (!extension) {
    throw new Error('Unsupported file type.');
  }

  return `${folder}/${Date.now()}-${randomUUID()}.${extension}`;
}

function createAttachmentObjectKey(file: File, conversationId: number): string {
  const extension = allowedAttachmentTypes.get(file.type);

  if (!extension) {
    throw new Error('Unsupported attachment type.');
  }

  return `message-attachments/${conversationId}/${Date.now()}-${sanitizeBaseName(file.name)}-${randomUUID()}.${extension}`;
}

export async function getR2PublicUrl(key: string): Promise<string> {
  const publicUrl = optionalEnv('R2_PUBLIC_URL', 'CLOUDFLARE_R2_PUBLIC_URL');

  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }

  const bucketName = requiredEnv('R2_BUCKET_NAME', 'R2_BUCKET', 'CLOUDFLARE_R2_BUCKET');

  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
    { expiresIn: 60 * 60 },
  );
}

export async function uploadR2Image(file: File, folder?: string): Promise<R2UploadResult> {
  const validationError = validateR2ImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const bucketName = requiredEnv('R2_BUCKET_NAME', 'R2_BUCKET', 'CLOUDFLARE_R2_BUCKET');
  const key = createObjectKey(file, folder);
  const body = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: file.type,
    }),
  );

  return {
    imageUrl: await getR2PublicUrl(key),
    key,
  };
}

export async function uploadR2MessageAttachment(
  file: File,
  conversationId: number,
): Promise<R2AttachmentUploadResult> {
  const validationError = validateR2MessageAttachment(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const bucketName = requiredEnv('R2_BUCKET_NAME', 'R2_BUCKET', 'CLOUDFLARE_R2_BUCKET');
  const key = createAttachmentObjectKey(file, conversationId);
  const body = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: file.type,
    }),
  );

  return {
    fileUrl: await getR2PublicUrl(key),
    key,
  };
}

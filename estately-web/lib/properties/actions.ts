'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { db } from '@/src/db/client';
import { propertyImages, properties, users } from '@/src/db/schema';
import { requireAuth } from '@/lib/auth';
import { notifyAdminsOfPendingListing } from '@/lib/notifications/service';
import { createActivity } from '@/lib/activity/service';
import {
  assertPropertyImageUploadsConfigured,
  getPropertyImageUploadConfigDiagnostics,
  getPropertyImageUploadMode,
  PropertyImageUploadError,
  uploadPropertyImage,
  validatePropertyImageFile,
} from '@/services/storage/property-images';
import { createPropertySchema } from './validation';
import type { PropertyActionState } from './types';

const genericError = 'Something went wrong. Please try again.';
const defaultCoverImageUrl =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop';
const maxPropertyImages = 10;
const createFailureFallback = 'Unable to create this property right now. Please try again.';

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function validationErrorState(error: ZodError, fields: Record<string, string>): PropertyActionState {
  const errors: PropertyActionState['errors'] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string') {
      errors[field] = issue.message;
    }
  }

  return {
    status: 'error',
    message: 'Please fix the highlighted fields.',
    fields,
    errors,
  };
}

function imageFilesFromForm(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, maxPropertyImages);
}

function logPropertyCreateStep(step: string, details: Record<string, unknown> = {}): void {
  console.log(`[property-create:${step}]`, details);
}

function safeErrorDetails(error: unknown, step: string) {
  const errorRecord = typeof error === 'object' && error !== null ? error as Record<string, unknown> : {};
  const cause = error instanceof Error ? error.cause : undefined;
  const causeMessage =
    cause instanceof Error
      ? cause.message
      : typeof cause === 'string'
        ? cause
        : undefined;

  return {
    step,
    name: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : 'Unknown error',
    causeMessage,
    code:
      typeof errorRecord.code === 'string' || typeof errorRecord.code === 'number'
        ? errorRecord.code
        : undefined,
    stackFirstLine: error instanceof Error ? error.stack?.split('\n')[0] : undefined,
  };
}

function temporaryDebugMessage(error: unknown, step: string, propertyWasCreated: boolean): string {
  if (error instanceof PropertyImageUploadError) {
    return `Create failed: ${error.safeMessage}`;
  }

  if (propertyWasCreated) {
    return `Create failed at step: ${step}. Property was created, but image upload did not complete.`;
  }

  return `Create failed at step: ${step}`;
}

export async function createPropertyAction(
  _prevState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const user = await requireAuth();
  let currentStep = 'start';

  const fields = {
    title: formValue(formData, 'title'),
    description: formValue(formData, 'description'),
    price: formValue(formData, 'price'),
    city: formValue(formData, 'city'),
    address: formValue(formData, 'address'),
    propertyType: formValue(formData, 'propertyType'),
    listingType: formValue(formData, 'listingType'),
    bedrooms: formValue(formData, 'bedrooms'),
    bathrooms: formValue(formData, 'bathrooms'),
    areaSqm: formValue(formData, 'areaSqm'),
  };

  const parsed = createPropertySchema.safeParse(fields);
  const imageFiles = imageFilesFromForm(formData);
  const receivedImageFilesCount = formData
    .getAll('images')
    .filter((value) => value instanceof File && value.size > 0).length;

  logPropertyCreateStep('start', {
    userId: user.id,
    fieldKeys: Object.keys(fields),
    filesCount: receivedImageFilesCount,
    uploadMode: getPropertyImageUploadMode(),
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }
  logPropertyCreateStep('validated', { userId: user.id });

  if (receivedImageFilesCount > maxPropertyImages) {
    return {
      status: 'error',
      message: `Please upload ${maxPropertyImages} images or fewer.`,
      fields,
      errors: { images: `Please upload ${maxPropertyImages} images or fewer.` },
    };
  }

  for (const file of imageFiles) {
    const imageError = validatePropertyImageFile(file);

    if (imageError) {
      return {
        status: 'error',
        message: imageError,
        fields,
        errors: { images: imageError },
      };
    }
  }

  logPropertyCreateStep('image-count', {
    userId: user.id,
    filesCount: imageFiles.length,
    receivedFilesCount: receivedImageFilesCount,
  });

  if (imageFiles.length > 0) {
    try {
      currentStep = 'r2-config';
      const r2Diagnostics = getPropertyImageUploadConfigDiagnostics();
      logPropertyCreateStep('r2-config', r2Diagnostics);
      console.log('[property-upload-config]', r2Diagnostics);
      assertPropertyImageUploadsConfigured();
    } catch (error) {
      console.error('[property-create:error]', safeErrorDetails(error, currentStep));

      return {
        status: 'error',
        message: temporaryDebugMessage(error, currentStep, false),
        fields,
        errors: {
          images:
            error instanceof PropertyImageUploadError
              ? error.safeMessage
              : 'Image upload is not configured in production.',
        },
      };
    }
  }

  let propertyId: number | undefined;

  try {
    const validatedData = parsed.data;
    const sessionUser = await db.query.users.findFirst({
      columns: {
        id: true,
        email: true,
        role: true,
      },
      where: eq(users.id, user.id),
    });

    logPropertyCreateStep('user', {
      sessionUserId: user.id,
      existsInUsersTable: Boolean(sessionUser),
      email: sessionUser?.email ?? user.email,
      role: sessionUser?.role ?? user.role,
    });
    console.log('[property-create-user]', {
      sessionUserId: user.id,
      existsInUsersTable: Boolean(sessionUser),
      email: sessionUser?.email ?? user.email,
      role: sessionUser?.role ?? user.role,
    });

    if (!sessionUser) {
      return {
        status: 'error',
        message: 'Your session could not be verified. Please sign in again and retry.',
        fields,
      };
    }

    currentStep = 'db-insert-start';
    logPropertyCreateStep('db-insert-start', { userId: sessionUser.id });
    const result = await db
      .insert(properties)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price.toString(),
        city: validatedData.city,
        address: validatedData.address,
        propertyType: validatedData.propertyType,
        listingType: validatedData.listingType,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        areaSqm: validatedData.areaSqm,
        imageCoverUrl: defaultCoverImageUrl,
        createdByUserId: sessionUser.id,
        isPublished: false,
        moderationStatus: 'pending',
        moderationNotes: null,
        updatedAt: new Date(),
      })
      .returning({ id: properties.id, title: properties.title });

    propertyId = result[0]?.id;
    currentStep = 'db-insert-success';
    logPropertyCreateStep('db-insert-success', {
      userId: sessionUser.id,
      propertyId,
      filesCount: imageFiles.length,
      uploadMode: getPropertyImageUploadMode(),
    });

    if (result[0]) {
      await createActivity({
        userId: sessionUser.id,
        type: 'property_created',
        title: 'Property created',
        description: `You created "${result[0].title}".`,
        entityType: 'property',
        entityId: result[0].id,
      });
    }

    if (result[0] && user.role !== 'admin') {
      await notifyAdminsOfPendingListing(result[0].id, result[0].title);
    }

    if (propertyId && imageFiles.length > 0) {
      for (const [index, file] of imageFiles.entries()) {
        currentStep = 'image-upload-start';
        logPropertyCreateStep('image-upload-start', {
          userId: sessionUser.id,
          propertyId,
          fileIndex: index,
          fileType: file.type,
          fileSize: file.size,
          uploadMode: getPropertyImageUploadMode(),
        });
        const { imageUrl } = await uploadPropertyImage(file, propertyId);
        currentStep = 'image-upload-success';
        logPropertyCreateStep('image-upload-success', {
          userId: sessionUser.id,
          propertyId,
          fileIndex: index,
          uploadMode: getPropertyImageUploadMode(),
          imageUrlHost: new URL(imageUrl).host,
        });

        currentStep = 'property-images-insert-start';
        logPropertyCreateStep('property-images-insert-start', {
          userId: sessionUser.id,
          propertyId,
          fileIndex: index,
        });
        const insertedImages = await db.insert(propertyImages).values({
          propertyId,
          imageUrl,
          sortOrder: index,
          isCover: index === 0,
        }).returning({ id: propertyImages.id });
        currentStep = 'property-images-insert-success';
        logPropertyCreateStep('property-images-insert-success', {
          userId: sessionUser.id,
          propertyId,
          fileIndex: index,
          insertedCount: insertedImages.length,
          imageIds: insertedImages.map((image) => image.id),
        });

        if (index === 0) {
          currentStep = 'cover-update-start';
          logPropertyCreateStep('cover-update-start', {
            userId: sessionUser.id,
            propertyId,
            fileIndex: index,
          });
          await db
            .update(properties)
            .set({ imageCoverUrl: imageUrl, updatedAt: new Date() })
            .where(eq(properties.id, propertyId));
          currentStep = 'cover-update-success';
          logPropertyCreateStep('cover-update-success', {
            userId: sessionUser.id,
            propertyId,
            fileIndex: index,
          });
        }
      }
    }
  } catch (error) {
    console.error('[property-create:error]', safeErrorDetails(error, currentStep));

    if (propertyId && imageFiles.length > 0) {
      const safeMessage =
        error instanceof PropertyImageUploadError
          ? error.safeMessage
          : 'Property created, but image upload failed.';

      return {
        status: 'error',
        message: temporaryDebugMessage(error, currentStep, true),
        fields,
        errors: { images: safeMessage },
      };
    }

    return {
      status: 'error',
      message:
        error instanceof PropertyImageUploadError
          ? error.safeMessage
          : temporaryDebugMessage(error, currentStep, false) || createFailureFallback,
      fields,
    };
  }

  if (!propertyId) {
    return { status: 'error', message: genericError, fields };
  }

  redirect(`/property/${propertyId}`);
}

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, propertyImages } from '@/src/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { uploadPropertyImage } from '@/services/storage/property-images';

interface PropertyImagesRouteProps {
  params: Promise<{
    id: string;
  }>;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ status: 'error', error: { message } }, { status });
}

export async function POST(request: NextRequest, { params }: PropertyImagesRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse('You must be logged in to upload property images.', 401);
  }

  const { id } = await params;
  const propertyId = Number(id);

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return errorResponse('Invalid property ID.', 400);
  }

  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) {
    return errorResponse('Property not found.', 404);
  }

  const canUpload = user.role === 'admin' || property.createdByUserId === user.id;

  if (!canUpload) {
    return errorResponse('You do not have permission to upload images for this property.', 403);
  }

  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof File)) {
    return errorResponse('Please upload an image file.', 400);
  }

  try {
    const existingImage = await db
      .select({ sortOrder: propertyImages.sortOrder })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(desc(propertyImages.sortOrder))
      .limit(1)
      .then((rows) => rows[0]);

    const nextSortOrder = existingImage ? existingImage.sortOrder + 1 : 0;
    const { imageUrl } = await uploadPropertyImage(file, propertyId);

    await db.insert(propertyImages).values({
      propertyId,
      imageUrl,
      sortOrder: nextSortOrder,
    });

    if (!existingImage) {
      await db
        .update(properties)
        .set({ imageCoverUrl: imageUrl, updatedAt: new Date() })
        .where(and(eq(properties.id, propertyId), eq(properties.createdByUserId, property.createdByUserId)));
    }

    revalidatePath('/dashboard');
    revalidatePath('/properties');
    revalidatePath(`/properties/${propertyId}`);

    return NextResponse.json({
      status: 'success',
      data: { imageUrl, sortOrder: nextSortOrder },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image.';
    return errorResponse(message, 400);
  }
}

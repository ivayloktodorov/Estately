import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
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

async function authorizedProperty(propertyId: number) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: errorResponse('You must be logged in to manage property images.', 401), property: null, user: null };
  }

  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) {
    return { error: errorResponse('Property not found.', 404), property: null, user };
  }

  const canManage = user.role === 'admin' || property.createdByUserId === user.id;

  if (!canManage) {
    return { error: errorResponse('You do not have permission to manage images for this property.', 403), property: null, user };
  }

  return { error: null, property, user };
}

async function syncCoverImage(propertyId: number, fallbackImageUrl?: string) {
  const coverImage = await db
    .select({ id: propertyImages.id, imageUrl: propertyImages.imageUrl })
    .from(propertyImages)
    .where(and(eq(propertyImages.propertyId, propertyId), eq(propertyImages.isCover, true)))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.id))
    .limit(1)
    .then((rows) => rows[0]);

  const firstImage =
    coverImage ??
    (await db
      .select({ id: propertyImages.id, imageUrl: propertyImages.imageUrl })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.id))
      .limit(1)
      .then((rows) => rows[0]));

  if (firstImage) {
    await db.update(propertyImages).set({ isCover: false }).where(and(eq(propertyImages.propertyId, propertyId), ne(propertyImages.id, firstImage.id)));
    await db.update(propertyImages).set({ isCover: true }).where(eq(propertyImages.id, firstImage.id));
  }

  await db
    .update(properties)
    .set({ imageCoverUrl: firstImage?.imageUrl ?? fallbackImageUrl ?? '', updatedAt: new Date() })
    .where(eq(properties.id, propertyId));
}

function revalidatePropertyImages(propertyId: number) {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/properties');
  revalidatePath('/admin/properties');
  revalidatePath('/properties');
  revalidatePath(`/properties/${propertyId}`);
}

async function routePropertyId(params: PropertyImagesRouteProps['params']) {
  const { id } = await params;
  const propertyId = Number(id);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

export async function GET(_request: NextRequest, { params }: PropertyImagesRouteProps) {
  const propertyId = await routePropertyId(params);

  if (!propertyId) {
    return errorResponse('Invalid property ID.', 400);
  }

  const auth = await authorizedProperty(propertyId);

  if (auth.error) {
    return auth.error;
  }

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.id));

  return NextResponse.json({ status: 'success', data: { images } });
}

export async function POST(request: NextRequest, { params }: PropertyImagesRouteProps) {
  const propertyId = await routePropertyId(params);

  if (!propertyId) {
    return errorResponse('Invalid property ID.', 400);
  }

  const auth = await authorizedProperty(propertyId);

  if (auth.error || !auth.property) {
    return auth.error;
  }

  const formData = await request.formData();
  const files = [...formData.getAll('images'), formData.get('image')]
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return errorResponse('Please upload at least one image file.', 400);
  }

  const existingImages = await db
    .select({ id: propertyImages.id, sortOrder: propertyImages.sortOrder })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(desc(propertyImages.sortOrder));

  if (existingImages.length + files.length > 10) {
    return errorResponse('Each property can have up to 10 images.', 400);
  }

  const nextSortStart = existingImages[0] ? existingImages[0].sortOrder + 1 : 0;
  const uploadedImages: { imageUrl: string; sortOrder: number; isCover: boolean }[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const sortOrder = nextSortStart + index;
      const { imageUrl } = await uploadPropertyImage(file, propertyId);
      const isCover = existingImages.length === 0 && index === 0;

      await db.insert(propertyImages).values({
        propertyId,
        imageUrl,
        sortOrder,
        isCover,
      });
      uploadedImages.push({ imageUrl, sortOrder, isCover });
    }

    await syncCoverImage(propertyId, auth.property.imageCoverUrl);
    revalidatePropertyImages(propertyId);

    return NextResponse.json({
      status: 'success',
      data: { images: uploadedImages },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image.';
    return errorResponse(message, 400);
  }
}

export async function PATCH(request: NextRequest, { params }: PropertyImagesRouteProps) {
  const propertyId = await routePropertyId(params);

  if (!propertyId) {
    return errorResponse('Invalid property ID.', 400);
  }

  const auth = await authorizedProperty(propertyId);

  if (auth.error || !auth.property) {
    return auth.error;
  }

  const body = (await request.json()) as {
    coverImageId?: unknown;
    orderedImageIds?: unknown;
  };

  if (Array.isArray(body.orderedImageIds)) {
    for (const [sortOrder, rawId] of body.orderedImageIds.entries()) {
      const imageId = Number(rawId);

      if (Number.isInteger(imageId) && imageId > 0) {
        await db
          .update(propertyImages)
          .set({ sortOrder })
          .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)));
      }
    }
  }

  const coverImageId = Number(body.coverImageId);

  if (Number.isInteger(coverImageId) && coverImageId > 0) {
    const cover = await db
      .select({ id: propertyImages.id })
      .from(propertyImages)
      .where(and(eq(propertyImages.id, coverImageId), eq(propertyImages.propertyId, propertyId)))
      .then((rows) => rows[0]);

    if (!cover) {
      return errorResponse('Cover image not found.', 404);
    }

    await db.update(propertyImages).set({ isCover: false }).where(eq(propertyImages.propertyId, propertyId));
    await db.update(propertyImages).set({ isCover: true }).where(eq(propertyImages.id, coverImageId));
  }

  await syncCoverImage(propertyId, auth.property.imageCoverUrl);
  revalidatePropertyImages(propertyId);

  return NextResponse.json({ status: 'success' });
}

export async function DELETE(request: NextRequest, { params }: PropertyImagesRouteProps) {
  const propertyId = await routePropertyId(params);

  if (!propertyId) {
    return errorResponse('Invalid property ID.', 400);
  }

  const auth = await authorizedProperty(propertyId);

  if (auth.error || !auth.property) {
    return auth.error;
  }

  const imageId = Number(new URL(request.url).searchParams.get('imageId'));

  if (!Number.isInteger(imageId) || imageId <= 0) {
    return errorResponse('Invalid image ID.', 400);
  }

  const deleted = await db
    .delete(propertyImages)
    .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)))
    .returning({ id: propertyImages.id });

  if (!deleted[0]) {
    return errorResponse('Image not found.', 404);
  }

  await syncCoverImage(propertyId, auth.property.imageCoverUrl);
  revalidatePropertyImages(propertyId);

  return NextResponse.json({ status: 'success' });
}

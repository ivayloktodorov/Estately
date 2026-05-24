import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

interface PropertyViewRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: PropertyViewRouteContext) {
  const { id } = await params;
  const propertyId = Number(id);

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return NextResponse.json({ status: 'error' }, { status: 400 });
  }

  await db
    .update(properties)
    .set({
      views: sql`${properties.views} + 1`,
    })
    .where(eq(properties.id, propertyId));

  return NextResponse.json({ status: 'success' });
}

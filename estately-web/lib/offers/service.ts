import { and, desc, eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/src/db/client';
import { properties, propertyOffers, users, type PropertyOfferStatus } from '@/src/db/schema';
import { createNotification } from '@/lib/notifications/service';
import { createOrReuseConversationAndMessage } from '@/lib/messages/service';
import { createActivity } from '@/lib/activity/service';

export interface OfferListItem {
  id: number;
  propertyId: number;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  amount: string;
  message: string | null;
  status: PropertyOfferStatus;
  createdAt: Date;
}

export interface UserOffersResult {
  received: OfferListItem[];
  submitted: OfferListItem[];
}

export class OfferSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfferSubmissionError';
  }
}

export async function submitPropertyOffer(input: {
  propertyId: number;
  buyerUserId: number;
  amount: string;
  message: string | null;
}): Promise<void> {
  const property = await db
    .select({
      id: properties.id,
      title: properties.title,
      ownerUserId: properties.createdByUserId,
      moderationStatus: properties.moderationStatus,
      isPublished: properties.isPublished,
    })
    .from(properties)
    .where(eq(properties.id, input.propertyId))
    .then((rows) => rows[0]);

  if (!property || property.moderationStatus !== 'approved' || !property.isPublished) {
    throw new OfferSubmissionError('This property is no longer available.');
  }

  if (property.ownerUserId === input.buyerUserId) {
    throw new OfferSubmissionError('You cannot submit an offer on your own property.');
  }

  const offer = await db
    .insert(propertyOffers)
    .values({
      propertyId: property.id,
      buyerUserId: input.buyerUserId,
      ownerUserId: property.ownerUserId,
      amount: input.amount,
      message: input.message,
      status: 'pending',
      updatedAt: new Date(),
    })
    .returning({ id: propertyOffers.id })
    .then((rows) => rows[0]);

  const formattedAmount = Number(input.amount).toLocaleString('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  const conversationBody = input.message
    ? `Offer submitted: ${formattedAmount} EUR\n\n${input.message}`
    : `Offer submitted: ${formattedAmount} EUR`;

  await createOrReuseConversationAndMessage({
    propertyId: property.id,
    buyerUserId: input.buyerUserId,
    ownerUserId: property.ownerUserId,
    senderUserId: input.buyerUserId,
    body: conversationBody,
  });

  await createNotification({
    userId: property.ownerUserId,
    type: 'offer_received',
    title: 'New offer received',
    message: 'A buyer submitted an offer for your property.',
    entityType: 'property_offer',
    entityId: offer.id,
    href: '/dashboard/offers',
  });
  await createActivity({
    userId: property.ownerUserId,
    type: 'inquiry_received',
    title: 'New offer received',
    description: `A buyer submitted an offer for "${property.title}".`,
    entityType: 'property_offer',
    entityId: offer.id,
  });
}

function statusValue(value: string): PropertyOfferStatus {
  return value === 'accepted' || value === 'rejected' ? value : 'pending';
}

export async function getUserOffers(userId: number): Promise<UserOffersResult> {
  const buyer = alias(users, 'offer_buyer');

  const rows = await db
    .select({
      id: propertyOffers.id,
      propertyId: propertyOffers.propertyId,
      propertyTitle: properties.title,
      buyerName: buyer.fullName,
      buyerEmail: buyer.email,
      amount: propertyOffers.amount,
      message: propertyOffers.message,
      status: propertyOffers.status,
      createdAt: propertyOffers.createdAt,
      buyerUserId: propertyOffers.buyerUserId,
      ownerUserId: propertyOffers.ownerUserId,
    })
    .from(propertyOffers)
    .innerJoin(properties, eq(propertyOffers.propertyId, properties.id))
    .innerJoin(buyer, eq(propertyOffers.buyerUserId, buyer.id))
    .where(or(eq(propertyOffers.ownerUserId, userId), eq(propertyOffers.buyerUserId, userId)))
    .orderBy(desc(propertyOffers.createdAt), desc(propertyOffers.id));

  const offers = rows.map((row) => ({
    id: row.id,
    propertyId: row.propertyId,
    propertyTitle: row.propertyTitle,
    buyerName: row.buyerName,
    buyerEmail: row.buyerEmail,
    amount: row.amount,
    message: row.message,
    status: statusValue(row.status),
    createdAt: row.createdAt,
    buyerUserId: row.buyerUserId,
    ownerUserId: row.ownerUserId,
  }));

  return {
    received: offers.filter((offer) => offer.ownerUserId === userId),
    submitted: offers.filter((offer) => offer.buyerUserId === userId),
  };
}

export async function updateOfferStatus(input: {
  offerId: number;
  ownerUserId: number;
  status: Extract<PropertyOfferStatus, 'accepted' | 'rejected'>;
}): Promise<void> {
  const offer = await db
    .select({
      id: propertyOffers.id,
      buyerUserId: propertyOffers.buyerUserId,
      ownerUserId: propertyOffers.ownerUserId,
      propertyTitle: properties.title,
      propertyId: propertyOffers.propertyId,
    })
    .from(propertyOffers)
    .innerJoin(properties, eq(propertyOffers.propertyId, properties.id))
    .where(and(eq(propertyOffers.id, input.offerId), eq(propertyOffers.ownerUserId, input.ownerUserId)))
    .then((rows) => rows[0]);

  if (!offer) {
    throw new Error('Offer not found.');
  }

  await db
    .update(propertyOffers)
    .set({ status: input.status, updatedAt: new Date() })
    .where(and(eq(propertyOffers.id, input.offerId), eq(propertyOffers.ownerUserId, input.ownerUserId)));

  const accepted = input.status === 'accepted';
  await createNotification({
    userId: offer.buyerUserId,
    type: accepted ? 'offer_accepted' : 'offer_rejected',
    title: accepted ? 'Offer accepted' : 'Offer rejected',
    message: accepted
      ? 'Your offer was accepted by the property owner.'
      : 'Your offer was rejected by the property owner.',
    entityType: 'property_offer',
    entityId: offer.id,
    href: `/properties/${offer.propertyId}`,
  });
  await createActivity({
    userId: offer.buyerUserId,
    type: 'inquiry_received',
    title: accepted ? 'Offer accepted' : 'Offer rejected',
    description: `Your offer for "${offer.propertyTitle}" was ${input.status}.`,
    entityType: 'property_offer',
    entityId: offer.id,
  });
}

import { and, desc, eq, ne, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/src/db/client';
import { conversations, messages, properties, users } from '@/src/db/schema';
import { createNotification } from '@/lib/notifications/service';

export interface ConversationListItem {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyCity: string;
  otherParticipantName: string;
  lastMessagePreview: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface ConversationMessage {
  id: number;
  senderUserId: number;
  senderName: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ConversationDetails {
  id: number;
  property: {
    id: number;
    title: string;
    city: string;
    price: string;
  };
  buyer: {
    id: number;
    fullName: string;
    email: string;
  };
  owner: {
    id: number;
    fullName: string;
    email: string;
  };
  messages: ConversationMessage[];
}

const MAX_MESSAGE_LENGTH = 2000;

function cleanMessageBody(body: string): string {
  const text = body.trim();

  if (!text) {
    throw new Error('Message is required.');
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new Error('Message must be 2000 characters or fewer.');
  }

  return text;
}

async function notifyMessageReceiver(conversationId: number, receiverUserId: number, senderName: string) {
  await createNotification({
    userId: receiverUserId,
    type: 'message_received',
    title: 'New message received',
    message: `You received a message from ${senderName}.`,
    entityType: 'conversation',
    entityId: conversationId,
    href: `/dashboard/messages/${conversationId}`,
  });
}

export async function createOrReuseConversationAndMessage(input: {
  propertyId: number;
  buyerUserId: number;
  ownerUserId: number;
  senderUserId: number;
  body: string;
}): Promise<number> {
  const body = cleanMessageBody(input.body);
  const existing = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.propertyId, input.propertyId),
        eq(conversations.buyerUserId, input.buyerUserId),
        eq(conversations.ownerUserId, input.ownerUserId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0]);

  const conversationId =
    existing?.id ??
    (
      await db
        .insert(conversations)
        .values({
          propertyId: input.propertyId,
          buyerUserId: input.buyerUserId,
          ownerUserId: input.ownerUserId,
          updatedAt: new Date(),
        })
        .returning({ id: conversations.id })
    )[0]?.id;

  if (!conversationId) {
    throw new Error('Could not create conversation.');
  }

  await db.insert(messages).values({
    conversationId,
    senderUserId: input.senderUserId,
    body,
    isRead: false,
  });

  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));

  const sender = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, input.senderUserId))
    .then((rows) => rows[0]);
  const receiverUserId = input.senderUserId === input.ownerUserId ? input.buyerUserId : input.ownerUserId;

  await notifyMessageReceiver(conversationId, receiverUserId, sender?.fullName ?? 'Estately user');

  return conversationId;
}

export async function getUserConversations(userId: number): Promise<ConversationListItem[]> {
  const buyer = alias(users, 'buyer');
  const owner = alias(users, 'owner');

  const rows = await db
    .select({
      id: conversations.id,
      propertyId: conversations.propertyId,
      propertyTitle: properties.title,
      propertyCity: properties.city,
      buyerName: buyer.fullName,
      ownerName: owner.fullName,
      buyerUserId: conversations.buyerUserId,
      ownerUserId: conversations.ownerUserId,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .innerJoin(properties, eq(conversations.propertyId, properties.id))
    .innerJoin(buyer, eq(conversations.buyerUserId, buyer.id))
    .innerJoin(owner, eq(conversations.ownerUserId, owner.id))
    .where(or(eq(conversations.buyerUserId, userId), eq(conversations.ownerUserId, userId)))
    .orderBy(desc(conversations.updatedAt), desc(conversations.id));

  return Promise.all(
    rows.map(async (conversation) => {
      const [lastMessage, unreadRows] = await Promise.all([
        db
          .select({ body: messages.body, createdAt: messages.createdAt })
          .from(messages)
          .where(eq(messages.conversationId, conversation.id))
          .orderBy(desc(messages.createdAt), desc(messages.id))
          .limit(1)
          .then((messageRows) => messageRows[0]),
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversation.id),
              eq(messages.isRead, false),
              ne(messages.senderUserId, userId),
            ),
          ),
      ]);

      return {
        id: conversation.id,
        propertyId: conversation.propertyId,
        propertyTitle: conversation.propertyTitle,
        propertyCity: conversation.propertyCity,
        otherParticipantName:
          conversation.buyerUserId === userId ? conversation.ownerName : conversation.buyerName,
        lastMessagePreview: lastMessage?.body ?? '',
        lastMessageAt: lastMessage?.createdAt ?? conversation.updatedAt,
        unreadCount: unreadRows[0]?.value ?? 0,
      };
    }),
  );
}

export async function getConversationForUser(
  conversationId: number,
  userId: number,
): Promise<ConversationDetails | null> {
  const buyer = alias(users, 'buyer');
  const owner = alias(users, 'owner');
  const sender = alias(users, 'sender');

  const conversation = await db
    .select({
      id: conversations.id,
      propertyId: properties.id,
      propertyTitle: properties.title,
      propertyCity: properties.city,
      propertyPrice: properties.price,
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      buyerEmail: buyer.email,
      ownerId: owner.id,
      ownerName: owner.fullName,
      ownerEmail: owner.email,
    })
    .from(conversations)
    .innerJoin(properties, eq(conversations.propertyId, properties.id))
    .innerJoin(buyer, eq(conversations.buyerUserId, buyer.id))
    .innerJoin(owner, eq(conversations.ownerUserId, owner.id))
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.buyerUserId, userId), eq(conversations.ownerUserId, userId)),
      ),
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!conversation) {
    return null;
  }

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderUserId, userId),
        eq(messages.isRead, false),
      ),
    );

  const messageRows = await db
    .select({
      id: messages.id,
      senderUserId: messages.senderUserId,
      senderName: sender.fullName,
      body: messages.body,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(sender, eq(messages.senderUserId, sender.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt, messages.id);

  return {
    id: conversation.id,
    property: {
      id: conversation.propertyId,
      title: conversation.propertyTitle,
      city: conversation.propertyCity,
      price: conversation.propertyPrice,
    },
    buyer: {
      id: conversation.buyerId,
      fullName: conversation.buyerName,
      email: conversation.buyerEmail,
    },
    owner: {
      id: conversation.ownerId,
      fullName: conversation.ownerName,
      email: conversation.ownerEmail,
    },
    messages: messageRows,
  };
}

export async function sendConversationMessage(input: {
  conversationId: number;
  senderUserId: number;
  body: string;
}): Promise<void> {
  const body = cleanMessageBody(input.body);
  const conversation = await db
    .select({
      id: conversations.id,
      buyerUserId: conversations.buyerUserId,
      ownerUserId: conversations.ownerUserId,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, input.conversationId),
        or(eq(conversations.buyerUserId, input.senderUserId), eq(conversations.ownerUserId, input.senderUserId)),
      ),
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!conversation) {
    throw new Error('Conversation not found.');
  }

  await db.insert(messages).values({
    conversationId: input.conversationId,
    senderUserId: input.senderUserId,
    body,
    isRead: false,
  });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, input.conversationId));

  const sender = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, input.senderUserId))
    .then((rows) => rows[0]);
  const receiverUserId =
    input.senderUserId === conversation.ownerUserId ? conversation.buyerUserId : conversation.ownerUserId;

  await notifyMessageReceiver(input.conversationId, receiverUserId, sender?.fullName ?? 'Estately user');
}

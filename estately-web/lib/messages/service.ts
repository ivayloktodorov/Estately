import { and, desc, eq, inArray, ne, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/src/db/client';
import { conversations, messageAttachments, messages, properties, users } from '@/src/db/schema';
import { createNotification } from '@/lib/notifications/service';
import { createActivity } from '@/lib/activity/service';
import { uploadR2MessageAttachment, validateR2MessageAttachment } from '@/services/storage/r2';

export interface ConversationListItem {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyCity: string;
  propertyImageCoverUrl: string;
  otherParticipantName: string;
  otherParticipantAvatarUrl: string | null;
  lastMessagePreview: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface ConversationMessage {
  id: number;
  senderUserId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
  isRead: boolean;
  createdAt: Date;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export interface AuthorizedAttachment {
  fileUrl: string;
}

export interface ConversationDetails {
  id: number;
  property: {
    id: number;
    title: string;
    city: string;
    price: string;
    imageCoverUrl: string;
  };
  buyer: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  owner: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  messages: ConversationMessage[];
}

const MAX_MESSAGE_LENGTH = 2000;

function cleanMessageBody(body: string, hasAttachment = false): string {
  const text = body.trim();

  if (!text && !hasAttachment) {
    throw new Error('Message is required.');
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new Error('Message must be 2000 characters or fewer.');
  }

  return text;
}

function cleanAttachmentFileName(fileName: string): string {
  const safeName = fileName
    .split(/[\\/]/)
    .pop()
    ?.replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();

  return safeName || 'attachment';
}

function isAttachmentFile(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0;
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
  await createActivity({
    userId: receiverUserId,
    type: 'message_received',
    title: 'Message received',
    description: `You received a message from ${senderName}.`,
    entityType: 'conversation',
    entityId: conversationId,
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
      propertyImageCoverUrl: properties.imageCoverUrl,
      buyerName: buyer.fullName,
      buyerAvatarUrl: buyer.avatarUrl,
      ownerName: owner.fullName,
      ownerAvatarUrl: owner.avatarUrl,
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

  if (rows.length === 0) {
    return [];
  }

  const conversationIds = rows.map((conversation) => conversation.id);
  const [messageRows, unreadRows] = await Promise.all([
    db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        body: messages.body,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.conversationId, conversationIds))
      .orderBy(desc(messages.conversationId), desc(messages.createdAt), desc(messages.id)),
    db
      .select({
        conversationId: messages.conversationId,
        value: sql<number>`count(*)::int`,
      })
      .from(messages)
      .where(
        and(
          inArray(messages.conversationId, conversationIds),
          eq(messages.isRead, false),
          ne(messages.senderUserId, userId),
        ),
      )
      .groupBy(messages.conversationId),
  ]);

  const lastMessages = new Map<number, (typeof messageRows)[number]>();
  for (const message of messageRows) {
    if (!lastMessages.has(message.conversationId)) {
      lastMessages.set(message.conversationId, message);
    }
  }

  const lastMessageIds = [...lastMessages.values()].map((message) => message.id);
  const attachmentRows =
    lastMessageIds.length > 0
      ? await db
          .select({ messageId: messageAttachments.messageId })
          .from(messageAttachments)
          .where(inArray(messageAttachments.messageId, lastMessageIds))
      : [];
  const messageIdsWithAttachments = new Set(attachmentRows.map((attachment) => attachment.messageId));
  const unreadCounts = new Map(unreadRows.map((row) => [row.conversationId, row.value]));

  return rows.map((conversation) => {
    const lastMessage = lastMessages.get(conversation.id);

    return {
      id: conversation.id,
      propertyId: conversation.propertyId,
      propertyTitle: conversation.propertyTitle,
      propertyCity: conversation.propertyCity,
      propertyImageCoverUrl: conversation.propertyImageCoverUrl,
      otherParticipantName:
        conversation.buyerUserId === userId ? conversation.ownerName : conversation.buyerName,
      otherParticipantAvatarUrl:
        conversation.buyerUserId === userId ? conversation.ownerAvatarUrl : conversation.buyerAvatarUrl,
      lastMessagePreview: lastMessage?.body || (lastMessage && messageIdsWithAttachments.has(lastMessage.id) ? 'Attachment' : ''),
      lastMessageAt: lastMessage?.createdAt ?? conversation.updatedAt,
      unreadCount: unreadCounts.get(conversation.id) ?? 0,
    };
  });
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
      propertyImageCoverUrl: properties.imageCoverUrl,
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      buyerEmail: buyer.email,
      buyerAvatarUrl: buyer.avatarUrl,
      ownerId: owner.id,
      ownerName: owner.fullName,
      ownerEmail: owner.email,
      ownerAvatarUrl: owner.avatarUrl,
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
      senderAvatarUrl: sender.avatarUrl,
      body: messages.body,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(sender, eq(messages.senderUserId, sender.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt, messages.id);

  const attachmentRows =
    messageRows.length > 0
      ? await db
          .select({
            id: messageAttachments.id,
            messageId: messageAttachments.messageId,
            fileUrl: messageAttachments.fileUrl,
            fileName: messageAttachments.fileName,
            fileType: messageAttachments.fileType,
            fileSize: messageAttachments.fileSize,
            createdAt: messageAttachments.createdAt,
          })
          .from(messageAttachments)
          .innerJoin(messages, eq(messageAttachments.messageId, messages.id))
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messageAttachments.createdAt, messageAttachments.id)
      : [];

  const attachmentsByMessageId = new Map<number, MessageAttachment[]>();

  for (const attachment of attachmentRows) {
    const existing = attachmentsByMessageId.get(attachment.messageId) ?? [];
    existing.push({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      createdAt: attachment.createdAt,
    });
    attachmentsByMessageId.set(attachment.messageId, existing);
  }

  return {
    id: conversation.id,
    property: {
      id: conversation.propertyId,
      title: conversation.propertyTitle,
      city: conversation.propertyCity,
      price: conversation.propertyPrice,
      imageCoverUrl: conversation.propertyImageCoverUrl,
    },
    buyer: {
      id: conversation.buyerId,
      fullName: conversation.buyerName,
      email: conversation.buyerEmail,
      avatarUrl: conversation.buyerAvatarUrl,
    },
    owner: {
      id: conversation.ownerId,
      fullName: conversation.ownerName,
      email: conversation.ownerEmail,
      avatarUrl: conversation.ownerAvatarUrl,
    },
    messages: messageRows.map((message) => ({
      ...message,
      attachments: attachmentsByMessageId.get(message.id) ?? [],
    })),
  };
}

export async function sendConversationMessage(input: {
  conversationId: number;
  senderUserId: number;
  body: string;
  attachment?: FormDataEntryValue | null;
}): Promise<void> {
  const attachmentEntry = input.attachment ?? null;
  const attachment: File | null = isAttachmentFile(attachmentEntry) ? attachmentEntry : null;
  const body = cleanMessageBody(input.body, Boolean(attachment));

  if (attachment) {
    const validationError = validateR2MessageAttachment(attachment);

    if (validationError) {
      throw new Error(validationError);
    }
  }

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

  const uploadedAttachment = attachment
    ? await uploadR2MessageAttachment(attachment, input.conversationId)
    : null;

  await db.transaction(async (tx) => {
    const [message] = await tx
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        senderUserId: input.senderUserId,
        body,
        isRead: false,
      })
      .returning({ id: messages.id });

    if (!message?.id) {
      throw new Error('Could not send message.');
    }

    if (attachment && uploadedAttachment) {
      await tx.insert(messageAttachments).values({
        messageId: message.id,
        fileUrl: uploadedAttachment.fileUrl,
        fileName: cleanAttachmentFileName(attachment.name),
        fileType: attachment.type,
        fileSize: attachment.size,
      });
    }

    await tx.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, input.conversationId));
  });

  const sender = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, input.senderUserId))
    .then((rows) => rows[0]);
  const receiverUserId =
    input.senderUserId === conversation.ownerUserId ? conversation.buyerUserId : conversation.ownerUserId;

  await notifyMessageReceiver(input.conversationId, receiverUserId, sender?.fullName ?? 'Estately user');
}

export async function getAttachmentForUser(
  attachmentId: number,
  userId: number,
  allowAdmin = false,
): Promise<AuthorizedAttachment | null> {
  const accessCondition = allowAdmin
    ? eq(messageAttachments.id, attachmentId)
    : and(
        eq(messageAttachments.id, attachmentId),
        or(eq(conversations.buyerUserId, userId), eq(conversations.ownerUserId, userId)),
      );

  const attachment = await db
    .select({
      fileUrl: messageAttachments.fileUrl,
    })
    .from(messageAttachments)
    .innerJoin(messages, eq(messageAttachments.messageId, messages.id))
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(accessCondition)
    .limit(1)
    .then((rows) => rows[0]);

  return attachment ?? null;
}

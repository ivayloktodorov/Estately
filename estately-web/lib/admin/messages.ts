import { and, asc, count, desc, eq, ilike, inArray, ne, or, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/src/db/client';
import { conversations, messageAttachments, messages, properties, users } from '@/src/db/schema';
import type { MessageAttachment } from '@/lib/messages/service';

const ADMIN_MESSAGE_SORTS = ['newest', 'oldest'] as const;
export type AdminMessageSort = (typeof ADMIN_MESSAGE_SORTS)[number];
export type AdminMessagesSearchParams = Record<string, string | string[] | undefined>;

export interface AdminConversationListItem {
  id: number;
  propertyId: number;
  propertyTitle: string;
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
  lastMessagePreview: string;
  lastMessageDate: Date;
  messageCount: number;
  unreadCount: number;
}

export interface AdminMessagesResult {
  conversations: AdminConversationListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  search: string;
  sort: AdminMessageSort;
}

export interface AdminConversationMessage {
  id: number;
  senderUserId: number;
  senderName: string;
  senderEmail: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  attachments: MessageAttachment[];
}

export interface AdminConversationDetails {
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
  messages: AdminConversationMessage[];
}

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE = 1;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function messageSort(value: string): AdminMessageSort {
  return ADMIN_MESSAGE_SORTS.includes(value as AdminMessageSort) ? (value as AdminMessageSort) : 'newest';
}

function parseAdminMessagesSearchParams(searchParams: AdminMessagesSearchParams) {
  const pageValue = Number(firstParam(searchParams.page));

  return {
    page: Number.isInteger(pageValue) && pageValue >= MIN_PAGE ? pageValue : MIN_PAGE,
    search: firstParam(searchParams.search).trim(),
    sort: messageSort(firstParam(searchParams.sort)),
  };
}

function buildConditions(parsed: ReturnType<typeof parseAdminMessagesSearchParams>): SQL[] {
  if (!parsed.search) {
    return [];
  }

  const buyer = alias(users, 'buyer');
  const owner = alias(users, 'owner');
  const pattern = `%${parsed.search}%`;
  const searchCondition = or(
    ilike(properties.title, pattern),
    ilike(buyer.fullName, pattern),
    ilike(buyer.email, pattern),
    ilike(owner.fullName, pattern),
    ilike(owner.email, pattern),
  );

  return searchCondition ? [searchCondition] : [];
}

function sortOrder(sort: AdminMessageSort) {
  return sort === 'oldest'
    ? [asc(conversations.updatedAt), asc(conversations.id)]
    : [desc(conversations.updatedAt), desc(conversations.id)];
}

export async function getAdminConversations(
  searchParams: AdminMessagesSearchParams = {},
): Promise<AdminMessagesResult> {
  const parsed = parseAdminMessagesSearchParams(searchParams);
  const buyer = alias(users, 'buyer');
  const owner = alias(users, 'owner');
  const conditions = buildConditions(parsed);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalRows = await db
    .select({ value: count() })
    .from(conversations)
    .innerJoin(properties, eq(conversations.propertyId, properties.id))
    .innerJoin(buyer, eq(conversations.buyerUserId, buyer.id))
    .innerJoin(owner, eq(conversations.ownerUserId, owner.id))
    .where(whereClause);

  const totalCount = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(parsed.page, totalPages);
  const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;

  const rows =
    totalCount > 0
      ? await db
          .select({
            id: conversations.id,
            propertyId: properties.id,
            propertyTitle: properties.title,
            buyerId: buyer.id,
            buyerName: buyer.fullName,
            buyerEmail: buyer.email,
            ownerId: owner.id,
            ownerName: owner.fullName,
            ownerEmail: owner.email,
            updatedAt: conversations.updatedAt,
          })
          .from(conversations)
          .innerJoin(properties, eq(conversations.propertyId, properties.id))
          .innerJoin(buyer, eq(conversations.buyerUserId, buyer.id))
          .innerJoin(owner, eq(conversations.ownerUserId, owner.id))
          .where(whereClause)
          .orderBy(...sortOrder(parsed.sort))
          .limit(DEFAULT_PAGE_SIZE)
          .offset(offset)
      : [];

  const conversationIds = rows.map((conversation) => conversation.id);
  const [messageRows, messageCountRows, unreadCountRows] =
    conversationIds.length > 0
      ? await Promise.all([
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
            .where(inArray(messages.conversationId, conversationIds))
            .groupBy(messages.conversationId),
          db
            .select({
              conversationId: messages.conversationId,
              value: sql<number>`count(*)::int`,
            })
            .from(messages)
            .where(and(inArray(messages.conversationId, conversationIds), eq(messages.isRead, false)))
            .groupBy(messages.conversationId),
        ])
      : [[], [], []];

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
  const messageCounts = new Map(messageCountRows.map((row) => [row.conversationId, row.value]));
  const unreadCounts = new Map(unreadCountRows.map((row) => [row.conversationId, row.value]));

  const conversationsWithStats = rows.map((conversation) => {
    const lastMessage = lastMessages.get(conversation.id);

    return {
      id: conversation.id,
      propertyId: conversation.propertyId,
      propertyTitle: conversation.propertyTitle,
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
      lastMessagePreview: lastMessage?.body || (lastMessage && messageIdsWithAttachments.has(lastMessage.id) ? 'Attachment' : ''),
      lastMessageDate: lastMessage?.createdAt ?? conversation.updatedAt,
      messageCount: messageCounts.get(conversation.id) ?? 0,
      unreadCount: unreadCounts.get(conversation.id) ?? 0,
    };
  });

  return {
    conversations: conversationsWithStats,
    totalCount,
    currentPage,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    search: parsed.search,
    sort: parsed.sort,
  };
}

export async function getAdminConversation(conversationId: number): Promise<AdminConversationDetails | null> {
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
    .where(eq(conversations.id, conversationId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!conversation) {
    return null;
  }

  const messageRows = await db
    .select({
      id: messages.id,
      senderUserId: messages.senderUserId,
      senderName: sender.fullName,
      senderEmail: sender.email,
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
    messages: messageRows.map((message) => ({
      ...message,
      attachments: attachmentsByMessageId.get(message.id) ?? [],
    })),
  };
}

export async function deleteAdminMessage(messageId: number): Promise<number | null> {
  const target = await db
    .select({ conversationId: messages.conversationId })
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!target) {
    return null;
  }

  const remainingRows = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.conversationId, target.conversationId), ne(messages.id, messageId)));

  if ((remainingRows[0]?.value ?? 0) === 0) {
    throw new Error('Cannot delete the only message in a conversation.');
  }

  await db.delete(messages).where(eq(messages.id, messageId));

  const lastMessage = await db
    .select({ createdAt: messages.createdAt })
    .from(messages)
    .where(eq(messages.conversationId, target.conversationId))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(1)
    .then((rows) => rows[0]);

  await db
    .update(conversations)
    .set({ updatedAt: lastMessage?.createdAt ?? sql`now()` })
    .where(eq(conversations.id, target.conversationId));

  return target.conversationId;
}

export async function deleteAdminAttachment(attachmentId: number): Promise<number | null> {
  const target = await db
    .select({ conversationId: messages.conversationId })
    .from(messageAttachments)
    .innerJoin(messages, eq(messageAttachments.messageId, messages.id))
    .where(eq(messageAttachments.id, attachmentId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!target) {
    return null;
  }

  await db.delete(messageAttachments).where(eq(messageAttachments.id, attachmentId));

  return target.conversationId;
}

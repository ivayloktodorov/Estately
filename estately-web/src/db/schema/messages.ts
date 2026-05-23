import { boolean, foreignKey, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { conversations } from './conversations';
import { users } from './users';

export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id').notNull(),
    senderUserId: integer('sender_user_id').notNull(),
    body: text('body').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.senderUserId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    index('messages_conversation_id_idx').on(table.conversationId),
    index('messages_sender_user_id_idx').on(table.senderUserId),
    index('messages_is_read_idx').on(table.isRead),
    index('messages_created_at_idx').on(table.createdAt),
  ],
);

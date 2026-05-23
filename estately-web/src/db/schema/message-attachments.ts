import { foreignKey, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { messages } from './messages';

export const messageAttachments = pgTable(
  'message_attachments',
  {
    id: serial('id').primaryKey(),
    messageId: integer('message_id').notNull(),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    fileType: text('file_type').notNull(),
    fileSize: integer('file_size').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [messages.id],
    }).onDelete('cascade'),
    index('message_attachments_message_id_idx').on(table.messageId),
    index('message_attachments_created_at_idx').on(table.createdAt),
  ],
);

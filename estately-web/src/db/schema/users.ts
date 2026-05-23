import { index, pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    displayName: varchar('display_name', { length: 255 }),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    role: varchar('role', { length: 50 }).default('user').notNull(),
    status: varchar('status', { length: 50 }).default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('users_role_idx').on(table.role),
    index('users_status_idx').on(table.status),
    index('users_created_at_idx').on(table.createdAt),
    index('users_full_name_idx').on(table.fullName),
  ],
);

import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  eventName: text('event_name').notNull(),
  properties: text('properties'), // JSON string
  device: text('device'),
  country: text('country'),
  referrer: text('referrer'),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_events_user').on(t.userId),
  index('idx_events_name_created').on(t.eventName, t.createdAt),
  index('idx_events_created').on(t.createdAt),
]);

export type Event = typeof events.$inferSelect;

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
}, (t) => ({
  idx_events_user: index('idx_events_user').on(t.userId),
  idx_events_name_created: index('idx_events_name_created').on(t.eventName, t.createdAt),
  idx_events_created: index('idx_events_created').on(t.createdAt),
}));

export type Event = typeof events.$inferSelect;

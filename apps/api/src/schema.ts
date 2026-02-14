import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// --- Enums ---

export const budgetCategoryEnum = pgEnum('budget_category', [
  'transport',
  'accommodation',
  'food',
  'activity',
  'other',
]);

export const pricingTypeEnum = pgEnum('pricing_type', ['total', 'per_person']);

export const checklistTypeEnum = pgEnum('checklist_type', ['packing', 'todo']);

export const reservationTypeEnum = pgEnum('reservation_type', [
  'flight',
  'hotel',
  'rental_car',
  'restaurant',
  'activity',
  'other',
]);

export const sharePermissionEnum = pgEnum('share_permission', ['view', 'edit']);

// --- Tables ---

export const trips = pgTable('trips', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  memberCount: integer('member_count').notNull().default(1),
  memo: text('memo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const spots = pgTable('spots', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  dayIndex: integer('day_index').notNull(),
  order: integer('order').notNull(),
  name: text('name').notNull(),
  address: text('address'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  memo: text('memo'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
});

export const budgetItems = pgTable('budget_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  category: budgetCategoryEnum('category').notNull(),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  pricingType: pricingTypeEnum('pricing_type').notNull(),
  memo: text('memo'),
});

export const checklistItems = pgTable('checklist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  type: checklistTypeEnum('type').notNull(),
  text: text('text').notNull(),
  checked: boolean('checked').notNull().default(false),
});

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  type: reservationTypeEnum('type').notNull(),
  name: text('name').notNull(),
  confirmationNumber: text('confirmation_number'),
  datetime: text('datetime'),
  link: text('link'),
  memo: text('memo'),
});

export const shareSettings = pgTable('share_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' })
    .unique(),
  shareUrl: text('share_url').notNull(),
  permission: sharePermissionEnum('permission').notNull().default('view'),
});

import { pgTable, uuid, varchar, timestamp, doublePrecision, integer, pgEnum } from 'drizzle-orm/pg-core';

export const localeEnum = pgEnum('locale', ['NL', 'EN']);
export const travelModeEnum = pgEnum('travel_mode', ['WALK', 'BIKE', 'CAR', 'PUBLIC_TRANSPORT']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  locale: localeEnum('locale').default('NL').notNull(),
  homeLatitude: doublePrecision('home_latitude'),
  homeLongitude: doublePrecision('home_longitude'),
  preferredTravelMode: travelModeEnum('preferred_travel_mode').default('CAR').notNull(),
  maxExtraStores: integer('max_extra_stores').default(1).notNull(),
  costPerKm: doublePrecision('cost_per_km').default(0.23).notNull(),
});

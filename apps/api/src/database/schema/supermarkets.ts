import { pgTable, uuid, varchar, doublePrecision, index } from 'drizzle-orm/pg-core';

export const supermarkets = pgTable('supermarkets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  logoUrl: varchar('logo_url', { length: 1024 }),
});

export const storeLocations = pgTable(
  'store_locations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    supermarketId: uuid('supermarket_id')
      .notNull()
      .references(() => supermarkets.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    address: varchar('address', { length: 512 }).notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
  },
  (table) => ({
    geoIdx: index('store_locations_geo_idx').on(table.latitude, table.longitude),
    supermarketIdx: index('store_locations_supermarket_idx').on(table.supermarketId),
  }),
);

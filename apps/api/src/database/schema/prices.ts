import { pgTable, uuid, doublePrecision, timestamp, index } from 'drizzle-orm/pg-core';
import { products } from './products';
import { supermarkets, storeLocations } from './supermarkets';
import { offers } from './offers';

export const prices = pgTable(
  'prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    supermarketId: uuid('supermarket_id')
      .notNull()
      .references(() => supermarkets.id, { onDelete: 'cascade' }),
    storeId: uuid('store_id').references(() => storeLocations.id),
    regularPrice: doublePrecision('regular_price').notNull(),
    activeOfferId: uuid('active_offer_id').references(() => offers.id),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  (table) => ({
    productSupermarketIdx: index('prices_product_supermarket_idx').on(table.productId, table.supermarketId),
  }),
);

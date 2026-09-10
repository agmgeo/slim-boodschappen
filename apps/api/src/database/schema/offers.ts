import { pgTable, uuid, timestamp, doublePrecision, integer, pgEnum, varchar, index } from 'drizzle-orm/pg-core';
import { products } from './products';
import { supermarkets, storeLocations } from './supermarkets';

export const offerTypeEnum = pgEnum('offer_type', [
  'PERCENTAGE_DISCOUNT',
  'FIXED_PRICE_FOR_N',
  'BUY_X_GET_Y_FREE',
  'SECOND_HALF_PRICE',
  'VOLUME_DISCOUNT',
  'BUNDLE',
]);

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  supermarketId: uuid('supermarket_id')
    .notNull()
    .references(() => supermarkets.id, { onDelete: 'cascade' }),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
});

export const offers = pgTable(
  'offers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    supermarketId: uuid('supermarket_id')
      .notNull()
      .references(() => supermarkets.id, { onDelete: 'cascade' }),
    storeId: uuid('store_id').references(() => storeLocations.id),
    folderId: uuid('folder_id').references(() => folders.id),
    type: offerTypeEnum('type').notNull(),
    requiredQuantity: integer('required_quantity'),
    freeQuantity: integer('free_quantity'),
    fixedPrice: doublePrecision('fixed_price'),
    percentageOff: doublePrecision('percentage_off'),
    // Postgres text[] voor bundle-product-ids (combinatieaanbiedingen)
    bundleProductIds: varchar('bundle_product_ids', { length: 64 }).array().default([]),
    validFrom: timestamp('valid_from').notNull(),
    validUntil: timestamp('valid_until').notNull(),
  },
  (table) => ({
    productSupermarketIdx: index('offers_product_supermarket_idx').on(table.productId, table.supermarketId),
  }),
);

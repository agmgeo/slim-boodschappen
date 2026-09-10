import { pgTable, uuid, varchar, integer, doublePrecision, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

export const matchMethodEnum = pgEnum('match_method', ['EXACT', 'ALIAS', 'FUZZY', 'AI_FALLBACK', 'UNMATCHED']);
export const scanSourceEnum = pgEnum('scan_source', ['BARCODE', 'MANUAL', 'RECEIPT_OCR']);

export const shoppingLists = pgTable(
  'shopping_lists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('shopping_lists_user_idx').on(table.userId),
  }),
);

export const shoppingListItems = pgTable(
  'shopping_list_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shoppingListId: uuid('shopping_list_id')
      .notNull()
      .references(() => shoppingLists.id, { onDelete: 'cascade' }),
    rawText: varchar('raw_text', { length: 512 }).notNull(),
    quantity: integer('quantity').default(1).notNull(),
    matchedProductId: uuid('matched_product_id').references(() => products.id),
    matchConfidence: doublePrecision('match_confidence'),
    matchMethod: matchMethodEnum('match_method'),
  },
  (table) => ({
    shoppingListIdx: index('shopping_list_items_list_idx').on(table.shoppingListId),
  }),
);

export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Voorkomt dubbele favorieten en maakt onConflictDoNothing() in
    // FavoritesService daadwerkelijk functioneel (was voorheen een no-op).
    userProductUnique: unique('favorites_user_product_unique').on(table.userId, table.productId),
  }),
);

export const scanHistory = pgTable(
  'scan_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    barcode: varchar('barcode', { length: 64 }),
    source: scanSourceEnum('source').notNull(),
    scannedAt: timestamp('scanned_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('scan_history_user_idx').on(table.userId),
  }),
);

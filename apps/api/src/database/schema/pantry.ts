import { pgTable, uuid, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

export const pantryItems = pgTable(
  'pantry_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(0).notNull(),
    // Vanaf welke hoeveelheid dit product als "bijna op" geldt. Per product
    // instelbaar, want "bijna op" betekent iets anders bij wc-papier dan bij melk.
    lowStockThreshold: integer('low_stock_threshold').default(1).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userProductUnique: unique().on(table.userId, table.productId),
  }),
);

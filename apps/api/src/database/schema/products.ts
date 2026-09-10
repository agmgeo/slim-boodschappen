import { pgTable, uuid, varchar, doublePrecision, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { localeEnum } from './users';

export const productCategoryEnum = pgEnum('product_category', [
  'DAIRY',
  'BAKERY',
  'MEAT',
  'FISH',
  'VEGETABLES',
  'FRUIT',
  'DRINKS',
  'SNACKS',
  'FROZEN',
  'PANTRY',
  'HOUSEHOLD',
  'PERSONAL_CARE',
  'OTHER',
]);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nameNl: varchar('name_nl', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }).notNull(),
    category: productCategoryEnum('category').notNull(),
    brand: varchar('brand', { length: 255 }),
    unit: varchar('unit', { length: 64 }).notNull(),
    unitSize: doublePrecision('unit_size'),
    unitOfMeasure: varchar('unit_of_measure', { length: 32 }),
    barcode: varchar('barcode', { length: 64 }).unique(),
    imageUrl: varchar('image_url', { length: 1024 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    barcodeIdx: index('products_barcode_idx').on(table.barcode),
  }),
);

export const productAliases = pgTable(
  'product_aliases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    alias: varchar('alias', { length: 255 }).notNull(),
    locale: localeEnum('locale').default('NL').notNull(),
  },
  (table) => ({
    aliasIdx: index('product_aliases_alias_idx').on(table.alias),
    productIdx: index('product_aliases_product_idx').on(table.productId),
  }),
);

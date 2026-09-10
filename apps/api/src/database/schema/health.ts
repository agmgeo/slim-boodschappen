import { pgTable, uuid, doublePrecision, varchar, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { products } from './products';

export const healthGradeEnum = pgEnum('health_grade', ['A', 'B', 'C', 'D', 'E']);

export const nutritionInfo = pgTable('nutrition_info', {
  productId: uuid('product_id')
    .primaryKey()
    .references(() => products.id, { onDelete: 'cascade' }),
  energyKcal: doublePrecision('energy_kcal').notNull(),
  fat: doublePrecision('fat').notNull(),
  saturatedFat: doublePrecision('saturated_fat').notNull(),
  carbohydrates: doublePrecision('carbohydrates').notNull(),
  sugars: doublePrecision('sugars').notNull(),
  fiber: doublePrecision('fiber').notNull(),
  protein: doublePrecision('protein').notNull(),
  salt: doublePrecision('salt').notNull(),
  additives: varchar('additives', { length: 128 }).array().default([]),
  allergens: varchar('allergens', { length: 128 }).array().default([]),
});

export const healthScores = pgTable('health_scores', {
  productId: uuid('product_id')
    .primaryKey()
    .references(() => products.id, { onDelete: 'cascade' }),
  grade: healthGradeEnum('grade').notNull(),
  score: doublePrecision('score').notNull(),
  // Array van { label, points, reason } — transparante opbouw van de score
  breakdown: jsonb('breakdown').notNull(),
});

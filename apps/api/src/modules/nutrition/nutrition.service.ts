import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { nutritionInfo } from '../../database/schema';

export interface UpsertNutritionInput {
  productId: string;
  energyKcal: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugars: number;
  fiber: number;
  protein: number;
  salt: number;
  additives?: string[];
  allergens?: string[];
}

@Injectable()
export class NutritionService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async upsert(input: UpsertNutritionInput) {
    const [row] = await this.db
      .insert(nutritionInfo)
      .values(input)
      .onConflictDoUpdate({ target: nutritionInfo.productId, set: input })
      .returning();
    return row;
  }

  async findForProduct(productId: string) {
    const [row] = await this.db.select().from(nutritionInfo).where(eq(nutritionInfo.productId, productId)).limit(1);
    return row ?? null;
  }
}

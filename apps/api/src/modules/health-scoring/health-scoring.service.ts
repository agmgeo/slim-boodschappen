import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { healthScores } from '../../database/schema';
import { NutritionService } from '../nutrition/nutrition.service';
import { ProductsService } from '../products/products.service';
import { calculateHealthScore } from './engines/health-score.engine';

@Injectable()
export class HealthScoringService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly nutritionService: NutritionService,
    private readonly productsService: ProductsService,
  ) {}

  /** Berekent (met normale, transparante regels) en bewaart de gezondheidsscore van een product. */
  async computeAndStore(productId: string) {
    const nutrition = await this.nutritionService.findForProduct(productId);
    if (!nutrition) {
      throw new NotFoundException(`Geen voedingsinformatie bekend voor product ${productId}.`);
    }

    const result = calculateHealthScore({
      energyKcal: nutrition.energyKcal,
      fat: nutrition.fat,
      saturatedFat: nutrition.saturatedFat,
      carbohydrates: nutrition.carbohydrates,
      sugars: nutrition.sugars,
      fiber: nutrition.fiber,
      protein: nutrition.protein,
      salt: nutrition.salt,
    });

    const [row] = await this.db
      .insert(healthScores)
      .values({ productId, grade: result.grade, score: result.score, breakdown: result.breakdown })
      .onConflictDoUpdate({
        target: healthScores.productId,
        set: { grade: result.grade, score: result.score, breakdown: result.breakdown },
      })
      .returning();

    return row;
  }

  async findForProduct(productId: string) {
    const [row] = await this.db.select().from(healthScores).where(eq(healthScores.productId, productId)).limit(1);
    return row ?? null;
  }

  /**
   * Gezondere alternatieven binnen dezelfde productcategorie: normale
   * softwarelogica (categorie-filter + sorteren op score), geen AI.
   */
  async findHealthierAlternatives(productId: string, limit = 5) {
    const product = await this.productsService.findById(productId);
    const currentScore = await this.findForProduct(productId);
    const categoryProducts = await this.productsService.findByCategory(product.category);

    const alternatives = await Promise.all(
      categoryProducts
        .filter((p) => p.id !== productId)
        .map(async (p) => ({ product: p, healthScore: await this.findForProduct(p.id) })),
    );

    return alternatives
      .filter((alt) => alt.healthScore && (!currentScore || alt.healthScore.score > currentScore.score))
      .sort((a, b) => (b.healthScore?.score ?? 0) - (a.healthScore?.score ?? 0))
      .slice(0, limit);
  }
}

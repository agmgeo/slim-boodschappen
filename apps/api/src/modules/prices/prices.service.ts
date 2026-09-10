import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { prices } from '../../database/schema';

export interface UpsertPriceInput {
  productId: string;
  supermarketId: string;
  storeId?: string;
  regularPrice: number;
  activeOfferId?: string;
}

@Injectable()
export class PricesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async upsert(input: UpsertPriceInput) {
    const [row] = await this.db.insert(prices).values({ ...input, lastUpdated: new Date() }).returning();
    return row;
  }

  async findForProduct(productId: string) {
    return this.db.select().from(prices).where(eq(prices.productId, productId));
  }

  async findForSupermarket(supermarketId: string) {
    return this.db.select().from(prices).where(eq(prices.supermarketId, supermarketId));
  }

  async findForProductAndSupermarket(productId: string, supermarketId: string) {
    const [row] = await this.db
      .select()
      .from(prices)
      .where(and(eq(prices.productId, productId), eq(prices.supermarketId, supermarketId)))
      .limit(1);
    return row ?? null;
  }

  /**
   * Batch-variant: haalt alle prijzen op voor een set producten × supermarkten
   * in één query, i.p.v. één query per combinatie. Voorkomt N+1-gedrag in de
   * prijsvergelijking, waar dit anders (aantal producten × aantal supermarkten)
   * losse queries zou zijn.
   */
  async findForProductsAndSupermarkets(productIds: string[], supermarketIds: string[]) {
    if (productIds.length === 0 || supermarketIds.length === 0) return [];
    return this.db
      .select()
      .from(prices)
      .where(and(inArray(prices.productId, productIds), inArray(prices.supermarketId, supermarketIds)));
  }
}

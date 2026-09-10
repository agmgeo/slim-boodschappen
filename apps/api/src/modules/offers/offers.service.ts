import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { offers } from '../../database/schema';

export interface CreateOfferInput {
  productId: string;
  supermarketId: string;
  storeId?: string;
  folderId?: string;
  type: (typeof offers.$inferInsert)['type'];
  requiredQuantity?: number;
  freeQuantity?: number;
  fixedPrice?: number;
  percentageOff?: number;
  bundleProductIds?: string[];
  validFrom: Date;
  validUntil: Date;
}

@Injectable()
export class OffersService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(input: CreateOfferInput) {
    const [row] = await this.db.insert(offers).values(input).returning();
    return row;
  }

  async findAll() {
    return this.db.select().from(offers);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(offers).where(eq(offers.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Aanbieding ${id} niet gevonden.`);
    return row;
  }

  /** Actieve aanbieding(en) op een gegeven moment (default: nu) voor een supermarkt. */
  async findActiveForSupermarket(supermarketId: string, at: Date = new Date()) {
    return this.db
      .select()
      .from(offers)
      .where(and(eq(offers.supermarketId, supermarketId), lte(offers.validFrom, at), gte(offers.validUntil, at)));
  }

  /** Batch-variant over meerdere supermarkten tegelijk — voorkomt N+1 in de prijsvergelijking. */
  async findActiveForSupermarkets(supermarketIds: string[], at: Date = new Date()) {
    if (supermarketIds.length === 0) return [];
    return this.db
      .select()
      .from(offers)
      .where(
        and(inArray(offers.supermarketId, supermarketIds), lte(offers.validFrom, at), gte(offers.validUntil, at)),
      );
  }
}

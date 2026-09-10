import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { shoppingListItems, shoppingLists } from '../../database/schema';
import { ProductMatchingService } from '../product-matching/product-matching.service';

@Injectable()
export class ShoppingListsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly matchingService: ProductMatchingService,
  ) {}

  async create(userId: string, name: string) {
    const [row] = await this.db.insert(shoppingLists).values({ userId, name }).returning();
    return row;
  }

  async findAllForUser(userId: string) {
    return this.db.select().from(shoppingLists).where(eq(shoppingLists.userId, userId));
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(shoppingLists).where(eq(shoppingLists.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Boodschappenlijst ${id} niet gevonden.`);
    return row;
  }

  async getItems(shoppingListId: string) {
    return this.db.select().from(shoppingListItems).where(eq(shoppingListItems.shoppingListId, shoppingListId));
  }

  /**
   * Voegt een regel toe aan de lijst en probeert direct te matchen naar een
   * canoniek product (normale softwarelogica: normalisatie + fuzzy matching).
   */
  async addItem(shoppingListId: string, rawText: string, quantity = 1) {
    const match = await this.matchingService.matchText(rawText);
    const [row] = await this.db
      .insert(shoppingListItems)
      .values({
        shoppingListId,
        rawText,
        quantity,
        matchedProductId: match.productId ?? undefined,
        matchConfidence: match.confidence,
        matchMethod: match.method,
      })
      .returning();
    return row;
  }

  async removeItem(itemId: string) {
    await this.db.delete(shoppingListItems).where(eq(shoppingListItems.id, itemId));
  }
}

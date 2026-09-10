import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { pantryItems, products } from '../../database/schema';
import { evaluatePantry, getItemsNeedingRestock } from './engines/stock-status.engine';
import { ShoppingListsService } from '../shopping-lists/shopping-lists.service';

@Injectable()
export class PantryService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly shoppingListsService: ShoppingListsService,
  ) {}

  /** Volledige voorraad van de gebruiker, verrijkt met status (OK/LOW/OUT) en productnaam. */
  async getPantryForUser(userId: string) {
    const rows = await this.db
      .select({
        id: pantryItems.id,
        productId: pantryItems.productId,
        quantity: pantryItems.quantity,
        lowStockThreshold: pantryItems.lowStockThreshold,
        updatedAt: pantryItems.updatedAt,
        productNameNl: products.nameNl,
        productNameEn: products.nameEn,
        unit: products.unit,
      })
      .from(pantryItems)
      .innerJoin(products, eq(pantryItems.productId, products.id))
      .where(eq(pantryItems.userId, userId));

    const withStatus = evaluatePantry(rows);
    const rowByProductId = new Map(rows.map((r) => [r.productId, r]));
    return withStatus.map((status) => ({
      ...(rowByProductId.get(status.productId) as (typeof rows)[number]),
      status: status.status,
    }));
  }

  async getLowStockForUser(userId: string) {
    const pantry = await this.getPantryForUser(userId);
    return getItemsNeedingRestock(pantry);
  }

  /** Voegt een product toe aan de voorraad, of werkt de hoeveelheid bij als het al bestaat. */
  async upsertItem(userId: string, productId: string, quantity: number, lowStockThreshold?: number) {
    const [existing] = await this.db
      .select()
      .from(pantryItems)
      .where(and(eq(pantryItems.userId, userId), eq(pantryItems.productId, productId)))
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(pantryItems)
        .set({
          quantity,
          lowStockThreshold: lowStockThreshold ?? existing.lowStockThreshold,
          updatedAt: new Date(),
        })
        .where(eq(pantryItems.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(pantryItems)
      .values({ userId, productId, quantity, lowStockThreshold: lowStockThreshold ?? 1 })
      .returning();
    return created;
  }

  /** Telt de voorraad van een product op of af (bv. +1 bij inslaan, -1 bij verbruik). */
  async adjustQuantity(userId: string, productId: string, delta: number) {
    const [existing] = await this.db
      .select()
      .from(pantryItems)
      .where(and(eq(pantryItems.userId, userId), eq(pantryItems.productId, productId)))
      .limit(1);

    const newQuantity = Math.max(0, (existing?.quantity ?? 0) + delta);
    return this.upsertItem(userId, productId, newQuantity, existing?.lowStockThreshold);
  }

  async removeItem(userId: string, itemId: string) {
    await this.db.delete(pantryItems).where(and(eq(pantryItems.id, itemId), eq(pantryItems.userId, userId)));
  }

  /**
   * Zet alle producten die bijna op of op zijn direct om in regels op een
   * bestaande boodschappenlijst. Combineert de voorraad-module met de
   * bestaande matching-engine (elke regel wordt meteen automatisch gematcht,
   * want het productId is al bekend).
   */
  async addLowStockToShoppingList(userId: string, shoppingListId: string) {
    const lowStock = await this.getLowStockForUser(userId);
    const added = [];
    for (const item of lowStock) {
      const product = await this.db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      const name = product[0]?.nameNl ?? item.productId;
      const created = await this.shoppingListsService.addItem(shoppingListId, name, 1);
      added.push(created);
    }
    return added;
  }
}

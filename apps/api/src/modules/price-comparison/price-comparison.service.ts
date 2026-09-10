import { Injectable } from '@nestjs/common';
import { OfferRule, OfferType } from '@app/shared';
import { ShoppingListsService } from '../shopping-lists/shopping-lists.service';
import { SupermarketsService } from '../supermarkets/supermarkets.service';
import { PricesService } from '../prices/prices.service';
import { OffersService } from '../offers/offers.service';
import { ProductsService } from '../products/products.service';
import { calculateOfferPrice } from '../offers/engines/offer.engine';
import {
  calculateBasketForSupermarket,
  ShoppingListLine,
  SupermarketCatalog,
} from './engines/price-comparison.engine';

@Injectable()
export class PriceComparisonService {
  constructor(
    private readonly shoppingListsService: ShoppingListsService,
    private readonly supermarketsService: SupermarketsService,
    private readonly pricesService: PricesService,
    private readonly offersService: OffersService,
    private readonly productsService: ProductsService,
  ) {}

  private async buildLines(shoppingListId: string, excludeProductIds?: Set<string>): Promise<ShoppingListLine[]> {
    const items = await this.shoppingListsService.getItems(shoppingListId);
    const matchedItems = items.filter(
      (item) => item.matchedProductId && !(excludeProductIds?.has(item.matchedProductId)),
    );
    if (matchedItems.length === 0) return [];

    const productIds = [...new Set(matchedItems.map((item) => item.matchedProductId as string))];
    // Eén query voor alle producten i.p.v. één query per product (N+1-fix).
    const foundProducts = await this.productsService.findByIds(productIds);
    const productNameById = new Map(foundProducts.map((p) => [p.id, p.nameNl]));

    return matchedItems.map((item) => ({
      productId: item.matchedProductId as string,
      productName: productNameById.get(item.matchedProductId as string) ?? item.rawText,
      quantity: item.quantity,
    }));
  }

  /**
   * Bouwt in constante query-aantal (3, ongeacht het aantal producten of
   * supermarkten) een per-supermarkt catalogus: alle prijzen en actieve
   * aanbiedingen worden in twee batch-queries opgehaald en daarna in-memory
   * per supermarkt gegroepeerd. Vervangt de vorige aanpak die (aantal
   * producten × aantal supermarkten) losse queries deed.
   */
  private async buildCatalogsBySupermarket(productIds: string[], supermarketIds: string[], at: Date) {
    const [allPrices, allOffers] = await Promise.all([
      this.pricesService.findForProductsAndSupermarkets(productIds, supermarketIds),
      this.offersService.findActiveForSupermarkets(supermarketIds, at),
    ]);

    const offerByProductAndSupermarket = new Map(
      allOffers.map((offer) => [`${offer.productId}:${offer.supermarketId}`, offer]),
    );

    const catalogsBySupermarket = new Map<string, SupermarketCatalog>();
    for (const supermarketId of supermarketIds) {
      catalogsBySupermarket.set(supermarketId, new Map());
    }

    for (const price of allPrices) {
      const offer = offerByProductAndSupermarket.get(`${price.productId}:${price.supermarketId}`);
      const rule: OfferRule | undefined = offer
        ? {
            type: offer.type as OfferType,
            requiredQuantity: offer.requiredQuantity ?? undefined,
            freeQuantity: offer.freeQuantity ?? undefined,
            fixedPrice: offer.fixedPrice ?? undefined,
            percentageOff: offer.percentageOff ?? undefined,
            bundleProductIds: offer.bundleProductIds ?? undefined,
          }
        : undefined;

      catalogsBySupermarket
        .get(price.supermarketId)
        ?.set(price.productId, { regularPrice: price.regularPrice, offer: rule });
    }

    return catalogsBySupermarket;
  }

  /** Bouwt de mandje-vergelijking per supermarkt voor een gegeven boodschappenlijst. */
  async compareListAcrossSupermarkets(shoppingListId: string, excludeProductIds?: Set<string>) {
    const lines = await this.buildLines(shoppingListId, excludeProductIds);
    if (lines.length === 0) return [];

    const productIds = lines.map((l) => l.productId);
    const supermarkets = await this.supermarketsService.findAll();
    const supermarketIds = supermarkets.map((s) => s.id);
    const now = new Date();

    const catalogsBySupermarket = await this.buildCatalogsBySupermarket(productIds, supermarketIds, now);

    return supermarkets.map((supermarket) =>
      calculateBasketForSupermarket(
        supermarket.id,
        lines,
        catalogsBySupermarket.get(supermarket.id) ?? new Map(),
      ),
    );
  }

  /**
   * Bepaalt per product bij welke supermarkt het (voor de gevraagde
   * hoeveelheid, incl. aanbiedingen) het goedkoopst is. Basis voor de
   * multi-store-afweging in ShoppingOptimizationService.
   */
  async getPerProductCheapest(shoppingListId: string, excludeProductIds?: Set<string>) {
    const lines = await this.buildLines(shoppingListId, excludeProductIds);
    if (lines.length === 0) return new Map<string, { supermarketId: string; price: number }>();

    const productIds = lines.map((l) => l.productId);
    const supermarkets = await this.supermarketsService.findAll();
    const supermarketIds = supermarkets.map((s) => s.id);
    const now = new Date();

    const catalogsBySupermarket = await this.buildCatalogsBySupermarket(productIds, supermarketIds, now);

    const result = new Map<string, { supermarketId: string; price: number }>();
    for (const line of lines) {
      let best: { supermarketId: string; price: number } | null = null;
      for (const supermarketId of supermarketIds) {
        const entry = catalogsBySupermarket.get(supermarketId)?.get(line.productId);
        if (!entry) continue;
        const calc = entry.offer
          ? calculateOfferPrice(entry.regularPrice, line.quantity, entry.offer)
          : { discountedTotal: entry.regularPrice * line.quantity };
        if (!best || calc.discountedTotal < best.price) {
          best = { supermarketId, price: Math.round(calc.discountedTotal * 100) / 100 };
        }
      }
      if (best) result.set(line.productId, best);
    }
    return result;
  }
}

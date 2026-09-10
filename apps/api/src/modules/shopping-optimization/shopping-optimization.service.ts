import { Injectable } from '@nestjs/common';
import { OptimizationStrategy, TravelMode } from '@app/shared';
import { PriceComparisonService } from '../price-comparison/price-comparison.service';
import { StoresService } from '../stores/stores.service';
import { SettingsService } from '../settings/settings.service';
import { PantryService } from '../pantry/pantry.service';
import { calculateTravelCost, GeoPoint } from './engines/travel-cost.engine';
import { pickBestSupermarket, evaluateMultiStoreOption } from './engines/shopping-optimization.engine';

@Injectable()
export class ShoppingOptimizationService {
  constructor(
    private readonly priceComparisonService: PriceComparisonService,
    private readonly storesService: StoresService,
    private readonly settingsService: SettingsService,
    private readonly pantryService: PantryService,
  ) {}

  async getRecommendation(
    userId: string,
    shoppingListId: string,
    strategy: OptimizationStrategy,
    considerPantry = false,
  ) {
    const excludedForStock = considerPantry ? await this.getInStockProductIds(userId) : new Set<string>();
    const { basketsWithTravel } = await this.buildBasketsWithTravel(userId, shoppingListId, excludedForStock);

    if (basketsWithTravel.length === 0) {
      return {
        strategy,
        recommendation: null,
        alternatives: [],
        excludedForStock: [...excludedForStock],
        explanation:
          excludedForStock.size > 0
            ? [
                'Alle producten uit je lijst heb je al voldoende op voorraad — er hoeft dus niets ingekocht te worden.',
              ]
            : [
                'Geen enkel product uit de lijst kon aan een supermarkt worden gekoppeld. Voeg eerst producten toe.',
              ],
      };
    }

    const result = pickBestSupermarket(basketsWithTravel, strategy);
    return { ...result, excludedForStock: [...excludedForStock] };
  }

  /** Product-ID's die de gebruiker al voldoende op voorraad heeft (status OK), dus niet hoeft in te slaan. */
  private async getInStockProductIds(userId: string): Promise<Set<string>> {
    const pantry = await this.pantryService.getPantryForUser(userId);
    return new Set(pantry.filter((item) => item.status === 'OK').map((item) => item.productId));
  }

  /**
   * Bepaalt of het financieel interessant is om de lijst over meerdere
   * supermarkten te verdelen (elk product bij de goedkoopste winkel),
   * afgewogen tegen de extra reiskosten van bijkomende stops.
   */
  async getMultiStoreAdvice(userId: string, shoppingListId: string, considerPantry = false) {
    const excludedForStock = considerPantry ? await this.getInStockProductIds(userId) : new Set<string>();
    const [{ basketsWithTravel }, perProductCheapest, settings] = await Promise.all([
      this.buildBasketsWithTravel(userId, shoppingListId, excludedForStock),
      this.priceComparisonService.getPerProductCheapest(shoppingListId, excludedForStock),
      this.settingsService.getForUser(userId),
    ]);

    if (basketsWithTravel.length === 0) {
      return null;
    }

    // Baseline = de "slimste" enkele supermarkt (beste balans prijs/reiskosten).
    const smartest = pickBestSupermarket(basketsWithTravel, OptimizationStrategy.SMARTEST);
    const baseline = smartest.recommendation as (typeof basketsWithTravel)[number];

    const extraTravelCostPerExtraStore = new Map<string, number>();
    for (const basket of basketsWithTravel) {
      if (basket.supermarketId === baseline.supermarketId) continue;
      extraTravelCostPerExtraStore.set(basket.supermarketId, basket.travelCost?.estimatedTravelCost ?? 0);
    }

    return evaluateMultiStoreOption(baseline, perProductCheapest, extraTravelCostPerExtraStore, settings.maxExtraStores);
  }

  private async buildBasketsWithTravel(userId: string, shoppingListId: string, excludeProductIds?: Set<string>) {
    const [baskets, settings, allStores] = await Promise.all([
      this.priceComparisonService.compareListAcrossSupermarkets(shoppingListId, excludeProductIds),
      this.settingsService.getForUser(userId),
      this.storesService.findAll(),
    ]);

    if (baskets.length === 0) {
      return { basketsWithTravel: [] as typeof baskets };
    }

    const home: GeoPoint | null =
      settings.homeLatitude != null && settings.homeLongitude != null
        ? { latitude: settings.homeLatitude, longitude: settings.homeLongitude }
        : null;

    const basketsWithTravel = baskets.map((basket) => {
      if (!home) return basket;
      const storesForSupermarket = allStores.filter((s) => s.supermarketId === basket.supermarketId);
      if (storesForSupermarket.length === 0) return basket;

      // Kies het dichtstbijzijnde filiaal van deze supermarkt t.o.v. het thuisadres.
      const nearest = storesForSupermarket.reduce((closest, store) => {
        const dClosest = distanceApprox(home, closest);
        const dStore = distanceApprox(home, store);
        return dStore < dClosest ? store : closest;
      });

      const travelCost = calculateTravelCost(
        home,
        { latitude: nearest.latitude, longitude: nearest.longitude },
        settings.preferredTravelMode as TravelMode,
        settings.costPerKm,
      );

      return { ...basket, storeId: nearest.id, travelCost };
    });

    return { basketsWithTravel };
  }
}

// Snelle grove afstandsindicatie (geen volledige haversine nodig) om het
// dichtstbijzijnde filiaal te kiezen vóór de exacte reiskosten-berekening.
function distanceApprox(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  return Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
}

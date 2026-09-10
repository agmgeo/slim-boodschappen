import { MissingProduct, OfferRule, OfferType, SupermarketBasketResult, TravelCostResult } from '@app/shared';
import { calculateOfferPrice } from '../../offers/engines/offer.engine';

export interface ShoppingListLine {
  productId: string;
  productName: string;
  quantity: number;
}

export interface CatalogEntry {
  regularPrice: number;
  offer?: OfferRule;
}

/** productId -> prijs-/aanbiedinginformatie voor één supermarkt (of filiaal). */
export type SupermarketCatalog = Map<string, CatalogEntry>;

/**
 * Berekent het totaalbedrag van de volledige boodschappenlijst bij één
 * supermarkt, inclusief actieve aanbiedingen (incl. combinatieaanbiedingen
 * over meerdere producten) en ontbrekende producten.
 * Pure functie: geen database- of netwerktoegang.
 */
export function calculateBasketForSupermarket(
  supermarketId: string,
  lines: ShoppingListLine[],
  catalog: SupermarketCatalog,
  travelCost?: TravelCostResult,
  storeId?: string,
): SupermarketBasketResult {
  let totalPrice = 0;
  let totalRegularPrice = 0;
  const missingProducts: MissingProduct[] = [];
  let matchedItemCount = 0;

  // Resterende hoeveelheid per product, wordt verlaagd zodra een bundel
  // die hoeveelheid al heeft "verbruikt" tegen bundelprijs.
  const remainingQty = new Map(lines.map((l) => [l.productId, l.quantity]));
  const lineByProductId = new Map(lines.map((l) => [l.productId, l]));

  // Eerst: producten die niet verkocht worden meteen als ontbrekend markeren.
  for (const line of lines) {
    if (!catalog.has(line.productId)) {
      missingProducts.push({ productId: line.productId, productName: line.productName, reason: 'NOT_SOLD' });
    } else {
      matchedItemCount += 1;
    }
  }

  // Stap 1: combinatieaanbiedingen (BUNDLE) toepassen op mandje-niveau, vóórdat
  // losse per-product aanbiedingen worden verrekend. Een bundel wordt alleen
  // toegepast als alle betrokken producten daadwerkelijk in de lijst staan
  // én bij deze supermarkt verkocht worden.
  const { bundleDiscountTotal, bundleRegularTotal } = applyBundleOffers(catalog, remainingQty, lineByProductId);
  totalPrice += bundleDiscountTotal;
  totalRegularPrice += bundleRegularTotal;

  // Stap 2: resterende (niet-gebundelde) hoeveelheden normaal verrekenen,
  // inclusief eventuele niet-BUNDLE aanbiedingen (1+1, 2 voor €X, etc.).
  for (const line of lines) {
    const entry = catalog.get(line.productId);
    if (!entry) continue;

    const qty = remainingQty.get(line.productId) ?? 0;
    if (qty <= 0) continue;

    if (entry.offer && entry.offer.type !== OfferType.BUNDLE) {
      const calc = calculateOfferPrice(entry.regularPrice, qty, entry.offer);
      totalPrice += calc.discountedTotal;
      totalRegularPrice += calc.regularTotal;
    } else {
      totalPrice += round2(entry.regularPrice * qty);
      totalRegularPrice += round2(entry.regularPrice * qty);
    }
  }

  return {
    supermarketId,
    storeId,
    totalPrice: round2(totalPrice),
    totalRegularPrice: round2(totalRegularPrice),
    totalSavings: round2(totalRegularPrice - totalPrice),
    missingProducts,
    matchedItemCount,
    totalItemCount: lines.length,
    travelCost,
  };
}

/**
 * Past combinatieaanbiedingen toe: voor elk product met een BUNDLE-aanbieding
 * wordt gecontroleerd of alle producten uit `bundleProductIds` ook in de
 * lijst staan. Zo ja, dan wordt het aantal volledige "sets" (het kleinste
 * resterende aantal onder alle betrokken producten) tegen de vaste
 * bundelprijs verrekend, en wordt die hoeveelheid van `remainingQty` afgehaald
 * zodat ze niet nogmaals tegen normale prijs wordt meegeteld.
 */
function applyBundleOffers(
  catalog: SupermarketCatalog,
  remainingQty: Map<string, number>,
  lineByProductId: Map<string, ShoppingListLine>,
): { bundleDiscountTotal: number; bundleRegularTotal: number } {
  let bundleDiscountTotal = 0;
  let bundleRegularTotal = 0;

  for (const [productId, entry] of catalog.entries()) {
    if (!entry.offer || entry.offer.type !== OfferType.BUNDLE) continue;
    if (!lineByProductId.has(productId)) continue; // anker-product zelf niet op de lijst

    const bundleProductIds = entry.offer.bundleProductIds ?? [];
    if (bundleProductIds.length === 0) continue;

    // Alle bundel-partners moeten op de lijst staan én bij deze supermarkt verkocht worden.
    const allPresent = bundleProductIds.every((id) => lineByProductId.has(id) && catalog.has(id));
    if (!allPresent) continue;

    const participantIds = [productId, ...bundleProductIds];
    const sets = Math.min(...participantIds.map((id) => remainingQty.get(id) ?? 0));
    if (sets <= 0) continue;

    const fixedPrice = entry.offer.fixedPrice ?? 0;
    const regularSetPrice = participantIds.reduce((sum, id) => sum + (catalog.get(id)?.regularPrice ?? 0), 0);

    bundleDiscountTotal += round2(sets * fixedPrice);
    bundleRegularTotal += round2(sets * regularSetPrice);

    for (const id of participantIds) {
      remainingQty.set(id, (remainingQty.get(id) ?? 0) - sets);
    }
  }

  return { bundleDiscountTotal: round2(bundleDiscountTotal), bundleRegularTotal: round2(bundleRegularTotal) };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

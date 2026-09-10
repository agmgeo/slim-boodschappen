import {
  MultiStorePlanEntry,
  MultiStorePlanResult,
  OptimizationResult,
  OptimizationStrategy,
  SupermarketBasketResult,
} from '@app/shared';

/**
 * Kiest de beste supermarkt uit een reeks berekende mandjes, op basis van de
 * gekozen strategie. Pure functie, geen AI: transparante, uitlegbare regels.
 */
export function pickBestSupermarket(
  baskets: SupermarketBasketResult[],
  strategy: OptimizationStrategy,
): OptimizationResult {
  if (baskets.length === 0) {
    throw new Error('Geen supermarkten om te vergelijken.');
  }

  const sorted = [...baskets].sort((a, b) => scoreFor(a, strategy) - scoreFor(b, strategy));
  const best = sorted[0];
  const alternatives = sorted.slice(1);

  return {
    strategy,
    recommendation: best,
    alternatives,
    explanation: buildExplanation(best, strategy),
  };
}

function scoreFor(basket: SupermarketBasketResult, strategy: OptimizationStrategy): number {
  switch (strategy) {
    case OptimizationStrategy.CHEAPEST:
      // Ontbrekende producten wegen zwaar mee: een "goedkope" supermarkt die
      // de helft van je lijst niet verkoopt is geen eerlijke winnaar.
      return basket.totalPrice + basket.missingProducts.length * 1000;
    case OptimizationStrategy.NEAREST:
      return (basket.travelCost?.distanceKm ?? Number.MAX_SAFE_INTEGER) + basket.missingProducts.length * 1000;
    case OptimizationStrategy.SMARTEST:
    default:
      return basket.totalPrice + (basket.travelCost?.estimatedTravelCost ?? 0) + basket.missingProducts.length * 1000;
  }
}

function buildExplanation(best: SupermarketBasketResult, strategy: OptimizationStrategy): string[] {
  const lines: string[] = [];
  lines.push(`Totale productprijs: €${best.totalPrice.toFixed(2)} (bespaard: €${best.totalSavings.toFixed(2)}).`);
  if (best.travelCost) {
    lines.push(
      `Reisafstand: ${best.travelCost.distanceKm} km, geschatte reiskosten: €${best.travelCost.estimatedTravelCost.toFixed(2)}, reistijd: ${best.travelCost.estimatedTravelTimeMinutes} min.`,
    );
  }
  if (best.missingProducts.length > 0) {
    lines.push(`Let op: ${best.missingProducts.length} product(en) niet gevonden bij deze supermarkt.`);
  }
  switch (strategy) {
    case OptimizationStrategy.CHEAPEST:
      lines.push('Gekozen omdat dit de laagste totale productprijs geeft.');
      break;
    case OptimizationStrategy.NEAREST:
      lines.push('Gekozen omdat dit de dichtstbijzijnde winkel is.');
      break;
    case OptimizationStrategy.SMARTEST:
      lines.push('Gekozen omdat dit de beste balans is tussen productprijs en reiskosten.');
      break;
  }
  return lines;
}

/**
 * Bepaalt of het financieel interessant is om producten te verdelen over
 * meerdere supermarkten (elk product bij de supermarkt waar het goedkoopst is),
 * afgewogen tegen de extra reiskosten van een tweede/derde stop.
 *
 * `perProductCheapest` geeft per productId de goedkoopste (supermarketId, prijs).
 * `extraTravelCostPerExtraStore` is de geschatte extra reiskosten om een
 * bijkomende winkel te bezoeken (buiten de baseline-winkel).
 */
export function evaluateMultiStoreOption(
  singleStoreBaseline: SupermarketBasketResult,
  perProductCheapest: Map<string, { supermarketId: string; price: number }>,
  extraTravelCostPerExtraStore: Map<string, number>, // supermarketId -> extra reiskosten t.o.v. baseline
  maxExtraStores: number,
): MultiStorePlanResult {
  // Groepeer producten per goedkoopste supermarkt
  const grouped = new Map<string, MultiStorePlanEntry>();
  for (const [productId, info] of perProductCheapest.entries()) {
    const existing = grouped.get(info.supermarketId);
    if (existing) {
      existing.productIds.push(productId);
      existing.subtotal = round2(existing.subtotal + info.price);
    } else {
      grouped.set(info.supermarketId, {
        supermarketId: info.supermarketId,
        productIds: [productId],
        subtotal: round2(info.price),
      });
    }
  }

  // Beperk tot de baseline-winkel + de N goedkoopste extra winkels (op basis van bespaarde euro's)
  const baselineId = singleStoreBaseline.supermarketId;
  const others = [...grouped.values()]
    .filter((entry) => entry.supermarketId !== baselineId)
    .sort((a, b) => b.subtotal - a.subtotal)
    .slice(0, maxExtraStores);

  const baselineEntry = grouped.get(baselineId);
  const plan = baselineEntry ? [baselineEntry, ...others] : others;

  const productSubtotal = round2(plan.reduce((sum, entry) => sum + entry.subtotal, 0));
  const extraStoresVisited = plan.filter((entry) => entry.supermarketId !== baselineId);
  const totalTravelCost = round2(
    extraStoresVisited.reduce((sum, entry) => sum + (extraTravelCostPerExtraStore.get(entry.supermarketId) ?? 0), 0),
  );

  const totalPrice = round2(productSubtotal + totalTravelCost);
  const netSavingsVsSingleStore = round2(singleStoreBaseline.totalPrice - totalPrice);

  return {
    isWorthIt: netSavingsVsSingleStore > 0,
    singleStoreBaseline,
    plan,
    totalPrice,
    totalTravelCost,
    netSavingsVsSingleStore,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

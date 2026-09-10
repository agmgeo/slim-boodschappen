import { OptimizationStrategy, SupermarketBasketResult, TravelMode } from '@app/shared';
import { evaluateMultiStoreOption, pickBestSupermarket } from './shopping-optimization.engine';

// In deze tests is de aanbeveling altijd een SupermarketBasketResult (nooit een
// MultiStorePlanResult), omdat pickBestSupermarket die laatste nooit teruggeeft.
function asBasket(result: SupermarketBasketResult | { plan: unknown }): SupermarketBasketResult {
  return result as SupermarketBasketResult;
}

function basket(
  supermarketId: string,
  totalPrice: number,
  distanceKm: number,
  travelCost: number,
  missing = 0,
) {
  return {
    supermarketId,
    totalPrice,
    totalRegularPrice: totalPrice,
    totalSavings: 0,
    missingProducts: Array.from({ length: missing }, (_, i) => ({
      productId: `missing-${i}`,
      productName: 'x',
      reason: 'NOT_SOLD' as const,
    })),
    matchedItemCount: 5 - missing,
    totalItemCount: 5,
    travelCost: {
      distanceKm,
      estimatedTravelTimeMinutes: distanceKm * 2,
      estimatedTravelCost: travelCost,
      travelMode: TravelMode.CAR,
    },
  };
}

describe('ShoppingOptimizationEngine - pickBestSupermarket', () => {
  const cheapButFar = basket('sm-cheap', 20, 15, 3.5);
  const expensiveButNear = basket('sm-near', 25, 1, 0.2);
  const balanced = basket('sm-balanced', 22, 3, 0.7);

  it('CHEAPEST kiest de laagste productprijs, ongeacht afstand', () => {
    const result = pickBestSupermarket([cheapButFar, expensiveButNear, balanced], OptimizationStrategy.CHEAPEST);
    expect(asBasket(result.recommendation).supermarketId).toBe('sm-cheap');
  });

  it('NEAREST kiest de kleinste afstand, ongeacht prijs', () => {
    const result = pickBestSupermarket([cheapButFar, expensiveButNear, balanced], OptimizationStrategy.NEAREST);
    expect(asBasket(result.recommendation).supermarketId).toBe('sm-near');
  });

  it('SMARTEST weegt prijs + reiskosten samen', () => {
    // sm-cheap: 20+3.5=23.5, sm-near: 25+0.2=25.2, sm-balanced: 22+0.7=22.7 -> balanced wint
    const result = pickBestSupermarket([cheapButFar, expensiveButNear, balanced], OptimizationStrategy.SMARTEST);
    expect(asBasket(result.recommendation).supermarketId).toBe('sm-balanced');
  });

  it('bestraft supermarkten met ontbrekende producten zwaar, ook bij CHEAPEST', () => {
    const incomplete = basket('sm-incomplete', 5, 1, 0.1, 3); // erg goedkoop maar mist 3 producten
    const result = pickBestSupermarket([incomplete, balanced], OptimizationStrategy.CHEAPEST);
    expect(asBasket(result.recommendation).supermarketId).toBe('sm-balanced');
  });

  it('gooit een fout bij een lege lijst', () => {
    expect(() => pickBestSupermarket([], OptimizationStrategy.CHEAPEST)).toThrow();
  });
});

describe('ShoppingOptimizationEngine - evaluateMultiStoreOption', () => {
  it('is het waard als de besparing groter is dan de extra reiskosten', () => {
    const baseline = basket('sm-a', 30, 2, 0.5);
    const perProductCheapest = new Map([
      ['p1', { supermarketId: 'sm-a', price: 10 }],
      ['p2', { supermarketId: 'sm-b', price: 5 }], // 10 goedkoper bij sm-b dan bij sm-a voor dit item
      ['p3', { supermarketId: 'sm-a', price: 15 }],
    ]);
    const extraTravelCost = new Map([['sm-b', 1.0]]);

    const result = evaluateMultiStoreOption(baseline, perProductCheapest, extraTravelCost, 1);
    expect(result.plan.some((p) => p.supermarketId === 'sm-b')).toBe(true);
    expect(result.totalPrice).toBeCloseTo(10 + 5 + 15 + 1.0, 2);
  });

  it('is het niet waard als de extra reiskosten de besparing opeten', () => {
    const baseline = basket('sm-a', 30, 2, 0.5);
    const perProductCheapest = new Map([
      ['p1', { supermarketId: 'sm-a', price: 10 }],
      ['p2', { supermarketId: 'sm-b', price: 9.9 }], // amper goedkoper
      ['p3', { supermarketId: 'sm-a', price: 15 }],
    ]);
    const extraTravelCost = new Map([['sm-b', 5.0]]); // dure extra rit

    const result = evaluateMultiStoreOption(baseline, perProductCheapest, extraTravelCost, 1);
    expect(result.isWorthIt).toBe(false);
  });

  it('respecteert de maxExtraStores-limiet uit de gebruikersinstellingen', () => {
    const baseline = basket('sm-a', 30, 2, 0.5);
    const perProductCheapest = new Map([
      ['p1', { supermarketId: 'sm-b', price: 5 }],
      ['p2', { supermarketId: 'sm-c', price: 5 }],
      ['p3', { supermarketId: 'sm-d', price: 5 }],
    ]);
    const extraTravelCost = new Map([
      ['sm-b', 1],
      ['sm-c', 1],
      ['sm-d', 1],
    ]);

    const result = evaluateMultiStoreOption(baseline, perProductCheapest, extraTravelCost, 1);
    const distinctStores = new Set(result.plan.map((p) => p.supermarketId));
    expect(distinctStores.size).toBeLessThanOrEqual(1);
  });
});

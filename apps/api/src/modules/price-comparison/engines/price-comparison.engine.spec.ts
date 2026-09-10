import { OfferType, TravelMode } from '@app/shared';
import { calculateBasketForSupermarket, SupermarketCatalog } from './price-comparison.engine';

describe('PriceComparisonEngine', () => {
  const lines = [
    { productId: 'melk', productName: 'Halfvolle melk', quantity: 2 },
    { productId: 'brood', productName: 'Bruin brood', quantity: 1 },
    { productId: 'kaas', productName: 'Jong belegen kaas', quantity: 1 },
  ];

  it('berekent het totaal correct zonder aanbiedingen', () => {
    const catalog: SupermarketCatalog = new Map([
      ['melk', { regularPrice: 1.29 }],
      ['brood', { regularPrice: 2.1 }],
      ['kaas', { regularPrice: 5.5 }],
    ]);

    const result = calculateBasketForSupermarket('sm1', lines, catalog);
    expect(result.totalPrice).toBeCloseTo(1.29 * 2 + 2.1 + 5.5, 2);
    expect(result.missingProducts).toHaveLength(0);
    expect(result.matchedItemCount).toBe(3);
  });

  it('past aanbiedingen toe binnen het mandje', () => {
    const catalog: SupermarketCatalog = new Map([
      ['melk', { regularPrice: 1.29, offer: { type: OfferType.PERCENTAGE_DISCOUNT, percentageOff: 50 } }],
      ['brood', { regularPrice: 2.1 }],
      ['kaas', { regularPrice: 5.5 }],
    ]);

    const result = calculateBasketForSupermarket('sm1', lines, catalog);
    expect(result.totalSavings).toBeGreaterThan(0);
    expect(result.totalPrice).toBeLessThan(result.totalRegularPrice);
  });

  it('markeert producten die de supermarkt niet verkoopt als ontbrekend', () => {
    const catalog: SupermarketCatalog = new Map([
      ['melk', { regularPrice: 1.29 }],
      // brood en kaas ontbreken bewust
    ]);

    const result = calculateBasketForSupermarket('sm1', lines, catalog);
    expect(result.missingProducts).toHaveLength(2);
    expect(result.missingProducts.map((m) => m.productId).sort()).toEqual(['brood', 'kaas']);
    expect(result.matchedItemCount).toBe(1);
  });

  it('neemt reiskosten mee in het resultaat indien meegegeven', () => {
    const catalog: SupermarketCatalog = new Map([['melk', { regularPrice: 1.29 }]]);
    const travelCost = {
      distanceKm: 4,
      estimatedTravelTimeMinutes: 10,
      estimatedTravelCost: 0.92,
      travelMode: TravelMode.CAR,
    };
    const result = calculateBasketForSupermarket('sm1', [lines[0]], catalog, travelCost);
    expect(result.travelCost).toEqual(travelCost);
  });

  describe('combinatieaanbiedingen (BUNDLE)', () => {
    // Chips + fles cola samen voor €3, los zouden ze 2.00 + 2.50 = 4.50 kosten
    const bundleLines = [
      { productId: 'chips', productName: 'Chips', quantity: 1 },
      { productId: 'cola', productName: 'Cola 1.5L', quantity: 1 },
    ];

    it('past de bundelprijs toe wanneer alle bundel-producten op de lijst staan', () => {
      const catalog: SupermarketCatalog = new Map([
        [
          'chips',
          {
            regularPrice: 2.0,
            offer: { type: OfferType.BUNDLE, fixedPrice: 3.0, bundleProductIds: ['cola'] },
          },
        ],
        ['cola', { regularPrice: 2.5 }],
      ]);

      const result = calculateBasketForSupermarket('sm1', bundleLines, catalog);
      expect(result.totalPrice).toBe(3.0);
      expect(result.totalRegularPrice).toBe(4.5);
      expect(result.totalSavings).toBe(1.5);
    });

    it('past de bundel NIET toe als niet alle bundel-producten op de lijst staan', () => {
      const catalog: SupermarketCatalog = new Map([
        [
          'chips',
          {
            regularPrice: 2.0,
            offer: { type: OfferType.BUNDLE, fixedPrice: 3.0, bundleProductIds: ['cola'] },
          },
        ],
        // cola ontbreekt op de lijst, alleen chips wordt gekocht
      ]);

      const result = calculateBasketForSupermarket('sm1', [bundleLines[0]], catalog);
      expect(result.totalPrice).toBe(2.0); // normale prijs, geen bundelkorting
    });

    it('rekent overtollige hoeveelheid buiten de bundel tegen normale prijs af', () => {
      // 2x chips, 1x cola: 1 bundel-set (chips+cola) + 1 chips los
      const catalog: SupermarketCatalog = new Map([
        [
          'chips',
          {
            regularPrice: 2.0,
            offer: { type: OfferType.BUNDLE, fixedPrice: 3.0, bundleProductIds: ['cola'] },
          },
        ],
        ['cola', { regularPrice: 2.5 }],
      ]);

      const result = calculateBasketForSupermarket(
        'sm1',
        [
          { productId: 'chips', productName: 'Chips', quantity: 2 },
          { productId: 'cola', productName: 'Cola 1.5L', quantity: 1 },
        ],
        catalog,
      );
      // 1 bundel-set (3.00) + 1 losse chips (2.00) = 5.00
      expect(result.totalPrice).toBe(5.0);
    });
  });
});

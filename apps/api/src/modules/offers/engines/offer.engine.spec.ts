import { OfferType } from '@app/shared';
import { calculateOfferPrice } from './offer.engine';

describe('OfferEngine - calculateOfferPrice', () => {
  it('past percentagekorting correct toe', () => {
    const result = calculateOfferPrice(2.0, 3, { type: OfferType.PERCENTAGE_DISCOUNT, percentageOff: 25 });
    expect(result.regularTotal).toBe(6.0);
    expect(result.discountedTotal).toBe(4.5);
    expect(result.savings).toBe(1.5);
  });

  it('berekent "2 voor €3" correct, inclusief restant', () => {
    // 5 stuks a 2 euro, aanbieding 2 voor 3 euro
    const result = calculateOfferPrice(2.0, 5, {
      type: OfferType.FIXED_PRICE_FOR_N,
      requiredQuantity: 2,
      fixedPrice: 3,
    });
    // 2 groepen van 2 (=6) + 1 restant a 2 euro = 8
    expect(result.discountedTotal).toBe(8);
    expect(result.regularTotal).toBe(10);
    expect(result.savings).toBe(2);
  });

  it('berekent "3 voor €5" correct zonder restant', () => {
    const result = calculateOfferPrice(2.5, 6, {
      type: OfferType.FIXED_PRICE_FOR_N,
      requiredQuantity: 3,
      fixedPrice: 5,
    });
    expect(result.discountedTotal).toBe(10); // 2 groepen van 5
    expect(result.regularTotal).toBe(15);
  });

  it('berekent 1+1 gratis correct', () => {
    const result = calculateOfferPrice(1.5, 4, {
      type: OfferType.BUY_X_GET_Y_FREE,
      requiredQuantity: 1,
      freeQuantity: 1,
    });
    // 4 stuks -> 2 groepen van (1 betaald + 1 gratis) = 2 betaald
    expect(result.discountedTotal).toBe(3);
    expect(result.regularTotal).toBe(6);
  });

  it('berekent 2+1 gratis correct met restant', () => {
    const result = calculateOfferPrice(2, 4, {
      type: OfferType.BUY_X_GET_Y_FREE,
      requiredQuantity: 2,
      freeQuantity: 1,
    });
    // groupSize=3: 1 volledige groep (2 betaald) + restant 1 (betaald, want < X)
    expect(result.discountedTotal).toBe(6); // 3 betaalde stuks * 2
  });

  it('berekent 2e halve prijs correct met een oneven aantal', () => {
    const result = calculateOfferPrice(4, 3, { type: OfferType.SECOND_HALF_PRICE });
    // 1 paar: 4 + 2 = 6, + 1 los stuk a 4 = 10
    expect(result.discountedTotal).toBe(10);
    expect(result.regularTotal).toBe(12);
  });

  it('past staffelkorting alleen toe vanaf de vereiste hoeveelheid', () => {
    const belowThreshold = calculateOfferPrice(3, 2, {
      type: OfferType.VOLUME_DISCOUNT,
      requiredQuantity: 3,
      percentageOff: 20,
    });
    expect(belowThreshold.discountedTotal).toBe(belowThreshold.regularTotal);

    const atThreshold = calculateOfferPrice(3, 3, {
      type: OfferType.VOLUME_DISCOUNT,
      requiredQuantity: 3,
      percentageOff: 20,
    });
    expect(atThreshold.discountedTotal).toBe(7.2);
  });

  it('geeft normale prijs terug bij hoeveelheid 0', () => {
    const result = calculateOfferPrice(5, 0, { type: OfferType.PERCENTAGE_DISCOUNT, percentageOff: 50 });
    expect(result.discountedTotal).toBe(0);
    expect(result.regularTotal).toBe(0);
  });
});

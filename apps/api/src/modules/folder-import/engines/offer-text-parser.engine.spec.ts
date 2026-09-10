import { OfferType } from '@app/shared';
import { parseOfferText } from './offer-text-parser.engine';

describe('OfferTextParser (echte AH-aanbiedingsteksten)', () => {
  it('herkent "1+1 gratis"', () => {
    const result = parseOfferText('1+1 gratis');
    expect(result?.rule).toEqual({ type: OfferType.BUY_X_GET_Y_FREE, requiredQuantity: 1, freeQuantity: 1 });
  });

  it('herkent "2+1 gratis" en "5+1 gratis"', () => {
    expect(parseOfferText('2+1 gratis')?.rule).toEqual({
      type: OfferType.BUY_X_GET_Y_FREE,
      requiredQuantity: 2,
      freeQuantity: 1,
    });
    expect(parseOfferText('5+1 gratis')?.rule).toEqual({
      type: OfferType.BUY_X_GET_Y_FREE,
      requiredQuantity: 5,
      freeQuantity: 1,
    });
  });

  it('herkent "2 voor 2.99"', () => {
    const result = parseOfferText('2 voor 2.99');
    expect(result?.rule).toEqual({ type: OfferType.FIXED_PRICE_FOR_N, requiredQuantity: 2, fixedPrice: 2.99 });
  });

  it('herkent "3 voor 6.00"', () => {
    const result = parseOfferText('3 voor 6.00');
    expect(result?.rule).toEqual({ type: OfferType.FIXED_PRICE_FOR_N, requiredQuantity: 3, fixedPrice: 6.0 });
  });

  it('herkent "voor 0.99" als eenheidsprijs (n=1)', () => {
    const result = parseOfferText('voor 0.99');
    expect(result?.rule).toEqual({ type: OfferType.FIXED_PRICE_FOR_N, requiredQuantity: 1, fixedPrice: 0.99 });
  });

  it('herkent "2e halve prijs"', () => {
    const result = parseOfferText('2e halve prijs');
    expect(result?.rule).toEqual({ type: OfferType.SECOND_HALF_PRICE });
  });

  it('herkent "25% korting"', () => {
    const result = parseOfferText('25% korting');
    expect(result?.rule).toEqual({ type: OfferType.PERCENTAGE_DISCOUNT, percentageOff: 25 });
  });

  it('herkent staffelkorting "vanaf 3 stuks 20% korting"', () => {
    const result = parseOfferText('vanaf 3 stuks 20% korting');
    expect(result?.rule).toEqual({
      type: OfferType.VOLUME_DISCOUNT,
      requiredQuantity: 3,
      percentageOff: 20,
    });
  });

  it('geeft null terug voor niet-ondersteunde teksten i.p.v. te gokken', () => {
    expect(parseOfferText('€1 korting')).toBeNull();
    expect(parseOfferText('gratis bezorging bij 15 euro')).toBeNull();
    expect(parseOfferText('Alleen in de winkel')).toBeNull();
  });

  it('verwerkt komma als decimaalteken', () => {
    const result = parseOfferText('2 voor 2,99');
    expect(result?.rule.fixedPrice).toBe(2.99);
  });
});

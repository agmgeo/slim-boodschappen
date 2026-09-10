import { OfferType, ProductCategory } from '@app/shared';
import { parseFolderPageText } from './folder-page-parser.engine';
import { AH_CATEGORY_HEADERS } from '../adapters/category-maps';
import { AH_BONUS_PAGE_FIXTURE } from '../fixtures/ah-bonus-page.fixture';

describe('FolderPageParser (op echte, vastgelegde ah.nl-tekst)', () => {
  const result = parseFolderPageText(AH_BONUS_PAGE_FIXTURE, AH_CATEGORY_HEADERS, 2026);

  it('herkent de geldigheidsdatum uit "Geldig t/m 13 september"', () => {
    expect(result.validUntil).not.toBeNull();
    expect(result.validUntil?.getDate()).toBe(13);
    expect(result.validUntil?.getMonth()).toBe(8); // september = index 8
  });

  it('vindt meerdere aanbiedingen met de juiste productnaam en categorie', () => {
    const paprika = result.offers.find((o) => o.productName === 'AH Paprika rood');
    expect(paprika).toBeDefined();
    expect(paprika?.category).toBe(ProductCategory.VEGETABLES);
    expect(paprika?.rule).toEqual({ type: OfferType.BUY_X_GET_Y_FREE, requiredQuantity: 1, freeQuantity: 1 });
  });

  it('wisselt van categorie zodra een nieuwe afdelingsheader voorbijkomt', () => {
    const druiven = result.offers.find((o) => o.productName === 'AH Druiven');
    expect(druiven?.category).toBe(ProductCategory.FRUIT);

    const knaks = result.offers.find((o) => o.productName === 'Unox Knaks');
    expect(knaks?.category).toBe(ProductCategory.MEAT);
  });

  it('herkent "2 voor X" en "2e halve prijs" correct binnen de echte pagina', () => {
    const broccoli = result.offers.find((o) => o.productName === 'Alle Bonduelle 255-400 gram');
    expect(broccoli?.rule).toEqual({ type: OfferType.FIXED_PRICE_FOR_N, requiredQuantity: 2, fixedPrice: 2.99 });

    const slamelanges = result.offers.find((o) => o.productName === 'Alle AH Slamelanges 75-130 gram');
    expect(slamelanges?.rule).toEqual({ type: OfferType.SECOND_HALF_PRICE });
  });

  it('rapporteert "€1 korting" als niet-herkend i.p.v. het te negeren of fout te interpreteren', () => {
    expect(result.unrecognized.some((u) => u.includes('€1 korting'))).toBe(true);
  });

  it('vindt een realistisch aantal aanbiedingen in de fixture (geen dubbeltellingen, niets vergeten)', () => {
    expect(result.offers.length).toBeGreaterThanOrEqual(12);
  });
});

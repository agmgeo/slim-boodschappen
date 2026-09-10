import { OfferType, ProductCategory } from '@app/shared';
import { parseJsonLdHtml } from './json-ld-folder-adapter';
import { extractValidUntilStandard } from '../engines/folder-page-parser.engine';
import { DIRK_JSONLD_PAGE_FIXTURE } from '../fixtures/dirk-jsonld-page.fixture';

describe('JsonLdFolderAdapter parser (op echte, vastgelegde Dirk-structuur)', () => {
  const result = parseJsonLdHtml(DIRK_JSONLD_PAGE_FIXTURE, ProductCategory.OTHER, extractValidUntilStandard);

  it('leest beide producten uit de schema.org @graph/ItemList-structuur', () => {
    expect(result.offers).toHaveLength(2);
  });

  it('haalt naam en prijs correct op', () => {
    const melk = result.offers.find((o) => o.productName === 'Dirk Halfvolle melk');
    expect(melk).toBeDefined();
    expect(melk?.rule).toEqual({ type: OfferType.FIXED_PRICE_FOR_N, requiredQuantity: 1, fixedPrice: 1.09 });
  });

  it('herkent de geldigheidsdatum uit de pagina', () => {
    expect(result.validUntil?.getDate()).toBe(13);
    expect(result.validUntil?.getMonth()).toBe(8);
  });

  it('geeft een lege lijst terug (i.p.v. te crashen) bij ontbrekende of kapotte JSON-LD', () => {
    const broken = parseJsonLdHtml('<html><body>geen data hier</body></html>', ProductCategory.OTHER, extractValidUntilStandard);
    expect(broken.offers).toHaveLength(0);

    const malformed = parseJsonLdHtml(
      '<script type="application/ld+json">{niet geldige json</script>',
      ProductCategory.OTHER,
      extractValidUntilStandard,
    );
    expect(malformed.offers).toHaveLength(0);
  });
});

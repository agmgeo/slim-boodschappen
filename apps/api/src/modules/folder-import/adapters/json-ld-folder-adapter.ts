import { Logger } from '@nestjs/common';
import { OfferType, ProductCategory } from '@app/shared';
import { FolderScraperAdapter } from './folder-scraper-adapter.interface';
import { ScrapedFolder, extractValidUntilStandard } from '../engines/folder-page-parser.engine';

export interface JsonLdFolderAdapterConfig {
  supermarketName: string;
  sourceUrl: string;
  defaultCategory?: ProductCategory;
  extractValidUntil?: (text: string, referenceYear: number) => Date | null;
}

interface SchemaOrgProduct {
  '@type'?: string;
  name?: string;
  offers?: { price?: number; priceCurrency?: string };
}

/**
 * Adapter voor supermarkten die hun aanbiedingen als schema.org
 * Product/ItemList structured data (JSON-LD) in de pagina zetten — bv. Dirk.
 * Dit is betrouwbaarder dan tekst-parsing (geen taalpatronen nodig), maar
 * geeft doorgaans alleen de huidige (actie-)prijs, niet het aanbiedingsmechaniek
 * (1+1, 2 voor X, etc.) of de reguliere prijs. We importeren die prijs daarom
 * als een simpele "huidige prijs" (FIXED_PRICE_FOR_N, n=1) — eerlijk over wat
 * we wél en niet weten, in plaats van een aanbiedingstype te verzinnen.
 */
export class JsonLdFolderAdapter implements FolderScraperAdapter {
  supermarketName: string;
  sourceUrl: string;
  private readonly defaultCategory: ProductCategory;
  private readonly extractValidUntil: (text: string, referenceYear: number) => Date | null;
  private readonly logger: Logger;

  constructor(config: JsonLdFolderAdapterConfig) {
    this.supermarketName = config.supermarketName;
    this.sourceUrl = config.sourceUrl;
    this.defaultCategory = config.defaultCategory ?? ProductCategory.OTHER;
    this.extractValidUntil = config.extractValidUntil ?? extractValidUntilStandard;
    this.logger = new Logger(`FolderAdapter:${config.supermarketName}`);
  }

  async scrape(): Promise<ScrapedFolder> {
    const res = await fetch(this.sourceUrl, {
      headers: { 'User-Agent': 'SlimBoodschappenBot/1.0 (+contact: instellingen-pagina)' },
    });
    if (!res.ok) throw new Error(`Kon ${this.sourceUrl} niet ophalen (status ${res.status}).`);
    const html = await res.text();
    return parseJsonLdHtml(html, this.defaultCategory, this.extractValidUntil, this.logger);
  }
}

/**
 * Pure parslogica, los van de HTTP-fetch, zodat 'm zonder netwerktoegang
 * getest kan worden tegen een vastgelegde pagina-snapshot.
 */
export function parseJsonLdHtml(
  html: string,
  defaultCategory: ProductCategory,
  extractValidUntil: (text: string, referenceYear: number) => Date | null,
  logger?: Logger,
): ScrapedFolder {
  const products = extractSchemaOrgProducts(html);
  const validUntil = extractValidUntil(html.replace(/<[^>]+>/g, ' '), new Date().getFullYear());

  if (products.length === 0) {
    logger?.warn('Geen schema.org Product-data gevonden op de pagina — is de structuur gewijzigd?');
  }

  const offers = products.map((p) => ({
    productName: p.name,
    category: defaultCategory,
    offerText: `prijs €${p.price.toFixed(2)} (schema.org, geen aanbiedingsmechaniek bekend)`,
    rule: { type: OfferType.FIXED_PRICE_FOR_N, requiredQuantity: 1, fixedPrice: p.price },
  }));

  return { offers, unrecognized: [], validFrom: null, validUntil };
}

function extractSchemaOrgProducts(html: string): { name: string; price: number }[] {
  const scriptMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const results: { name: string; price: number }[] = [];

  for (const match of scriptMatches) {
    try {
      const data = JSON.parse(match[1]);
      const graph: unknown[] = Array.isArray(data['@graph']) ? data['@graph'] : [data];

      for (const node of graph) {
        const itemList = (node as { itemListElement?: { item?: SchemaOrgProduct }[] })?.itemListElement;
        if (!Array.isArray(itemList)) continue;

        for (const entry of itemList) {
          const product = entry?.item;
          if (product?.['@type'] === 'Product' && product.name && product.offers?.price != null) {
            results.push({ name: product.name, price: product.offers.price });
          }
        }
      }
    } catch {
      // Niet-JSON of onverwachte structuur — overslaan, niet laten crashen.
      continue;
    }
  }

  return results;
}

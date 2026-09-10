import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { offers, products } from '../../database/schema';
import { SupermarketsService } from '../supermarkets/supermarkets.service';
import { ProductsService } from '../products/products.service';
import { FoldersService } from '../folders/folders.service';
import { ProductMatchingService } from '../product-matching/product-matching.service';
import { FOLDER_SCRAPER_ADAPTERS } from './adapters/folder-scraper-adapters.token';
import { FolderScraperAdapter } from './adapters/folder-scraper-adapter.interface';
import { ScrapedOffer } from './engines/folder-page-parser.engine';

export interface FolderImportResult {
  supermarketName: string;
  offersFound: number;
  offersImported: number;
  productsCreated: number;
  unrecognized: number;
  validUntil: Date | null;
  error?: string;
}

@Injectable()
export class FolderImportService {
  private readonly logger = new Logger(FolderImportService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly supermarketsService: SupermarketsService,
    private readonly productsService: ProductsService,
    private readonly foldersService: FoldersService,
    private readonly productMatchingService: ProductMatchingService,
    @Inject(FOLDER_SCRAPER_ADAPTERS) private readonly adapters: FolderScraperAdapter[],
  ) {}

  /** Draait alle geregistreerde supermarkt-adapters en importeert de resultaten. */
  async runAll(): Promise<FolderImportResult[]> {
    const results: FolderImportResult[] = [];
    for (const adapter of this.adapters) {
      results.push(await this.runAdapter(adapter));
    }
    return results;
  }

  /** Draait alleen de adapter(s) voor één specifieke supermarkt (op naam). */
  async runForSupermarket(supermarketName: string): Promise<FolderImportResult[]> {
    const matching = this.adapters.filter((a) => a.supermarketName === supermarketName);
    if (matching.length === 0) {
      throw new Error(`Geen folder-adapter geregistreerd voor "${supermarketName}".`);
    }
    return Promise.all(matching.map((a) => this.runAdapter(a)));
  }

  /** Namen van alle supermarkten waarvoor een adapter geregistreerd staat. */
  listRegisteredSupermarkets(): string[] {
    return this.adapters.map((a) => a.supermarketName);
  }

  async runAdapter(adapter: FolderScraperAdapter): Promise<FolderImportResult> {
    try {
      const scraped = await adapter.scrape();

      // Supermarkt moet al bestaan (via /supermarkets aangemaakt); we maken 'm
      // hier bewust niet automatisch aan om geen dubbele/verkeerd gespelde
      // supermarkten te laten ontstaan bij een parse-fout.
      const supermarket = await this.findSupermarketByName(adapter.supermarketName);
      if (!supermarket) {
        throw new Error(
          `Supermarkt "${adapter.supermarketName}" bestaat nog niet. Maak 'm eerst aan via /supermarkets.`,
        );
      }

      const validFrom = new Date();
      const validUntil = scraped.validUntil ?? new Date(validFrom.getTime() + 7 * 24 * 60 * 60 * 1000);
      const folder = await this.foldersService.create({
        supermarketId: supermarket.id,
        validFrom,
        validUntil,
      });

      let productsCreated = 0;
      let offersImported = 0;

      for (const scrapedOffer of scraped.offers) {
        const productId = await this.resolveProductId(scrapedOffer, () => productsCreated++);

        await this.db.insert(offers).values({
          productId,
          supermarketId: supermarket.id,
          folderId: folder.id,
          type: scrapedOffer.rule.type,
          requiredQuantity: scrapedOffer.rule.requiredQuantity,
          freeQuantity: scrapedOffer.rule.freeQuantity,
          fixedPrice: scrapedOffer.rule.fixedPrice,
          percentageOff: scrapedOffer.rule.percentageOff,
          bundleProductIds: scrapedOffer.rule.bundleProductIds ?? [],
          validFrom,
          validUntil,
        });
        offersImported++;
      }

      this.logger.log(
        `${adapter.supermarketName}: ${offersImported} aanbiedingen geïmporteerd, ${productsCreated} nieuwe producten aangemaakt, geldig t/m ${validUntil.toLocaleDateString()}.`,
      );

      return {
        supermarketName: adapter.supermarketName,
        offersFound: scraped.offers.length,
        offersImported,
        productsCreated,
        unrecognized: scraped.unrecognized.length,
        validUntil,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onbekende fout';
      this.logger.error(`Import voor ${adapter.supermarketName} mislukt: ${message}`);
      return {
        supermarketName: adapter.supermarketName,
        offersFound: 0,
        offersImported: 0,
        productsCreated: 0,
        unrecognized: 0,
        validUntil: null,
        error: message,
      };
    }
  }

  /**
   * Matcht een gescrapete aanbieding aan een bestaand product (normale
   * matching-logica, geen AI), en maakt een nieuw product aan als er geen
   * goede match is. Roept `onCreated` aan bij het aanmaken van een nieuw product.
   */
  private async resolveProductId(scrapedOffer: ScrapedOffer, onCreated: () => void): Promise<string> {
    const match = await this.productMatchingService.matchText(scrapedOffer.productName);
    if (match.productId) return match.productId;

    const created = await this.productsService.create({
      nameNl: scrapedOffer.productName,
      nameEn: scrapedOffer.productName,
      category: scrapedOffer.category,
      unit: 'stuk',
    });
    onCreated();
    return created.id;
  }

  private async findSupermarketByName(name: string) {
    const all = await this.supermarketsService.findAll();
    return all.find((s) => s.name === name) ?? null;
  }
}

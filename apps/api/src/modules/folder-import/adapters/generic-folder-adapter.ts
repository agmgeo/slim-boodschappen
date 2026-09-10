import { Logger } from '@nestjs/common';
import { ProductCategory } from '@app/shared';
import { FolderScraperAdapter } from './folder-scraper-adapter.interface';
import { extractValidUntilStandard, parseFolderPageText } from '../engines/folder-page-parser.engine';
import { fetchAndExtractText } from './html-fetch.util';

export interface GenericFolderAdapterConfig {
  supermarketName: string;
  sourceUrl: string;
  /** NL-afdelingslabels zoals de supermarkt ze zelf gebruikt -> onze ProductCategory. */
  categoryHeaders: Record<string, ProductCategory>;
  /** Optioneel: hoe de geldigheidsdatum uit de paginatekst gehaald wordt. Standaard: "Geldig t/m 13 september". */
  extractValidUntil?: (text: string, referenceYear: number) => Date | null;
}

/**
 * Herbruikbare adapter voor supermarkten die (net als AH) hun aanbiedingen als
 * gewone, leesbare tekst server-side renderen. De aanbiedingstaal ("1+1
 * gratis", "2 voor €X") is generiek Nederlands-supermarkt-jargon, dus dezelfde
 * parser werkt voor elke keten — het enige wat per supermarkt verschilt is de
 * bron-URL en de afdelingsnamen.
 *
 * Nieuwe supermarkt toevoegen die dit patroon volgt = alleen een config-object
 * toevoegen in `folder-import.module.ts`, geen nieuwe klasse nodig. Wijkt een
 * supermarkt qua paginastructuur significant af, dan schrijf je een eigen
 * klasse die dezelfde FolderScraperAdapter-interface implementeert (zoals
 * eventueel voor een winkel met alleen een PDF-folder in plaats van een
 * webpagina nodig zou zijn).
 */
export class GenericFolderAdapter implements FolderScraperAdapter {
  supermarketName: string;
  sourceUrl: string;
  private readonly categoryHeaders: Record<string, ProductCategory>;
  private readonly extractValidUntil: (text: string, referenceYear: number) => Date | null;
  private readonly logger: Logger;

  constructor(config: GenericFolderAdapterConfig) {
    this.supermarketName = config.supermarketName;
    this.sourceUrl = config.sourceUrl;
    this.categoryHeaders = config.categoryHeaders;
    this.extractValidUntil = config.extractValidUntil ?? extractValidUntilStandard;
    this.logger = new Logger(`FolderAdapter:${config.supermarketName}`);
  }

  async scrape() {
    const text = await fetchAndExtractText(this.sourceUrl);
    const result = parseFolderPageText(text, this.categoryHeaders, new Date().getFullYear(), this.extractValidUntil);

    if (result.unrecognized.length > 0) {
      this.logger.warn(
        `${result.unrecognized.length} niet-herkende aanbiedingstekst(en): ` +
          result.unrecognized.slice(0, 10).join(' | '),
      );
    }

    return result;
  }
}

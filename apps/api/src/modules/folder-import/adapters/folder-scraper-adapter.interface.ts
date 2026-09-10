import { ScrapedFolder } from '../engines/folder-page-parser.engine';

/**
 * Elke supermarkt krijgt zijn eigen adapter die deze interface implementeert.
 * Nieuwe supermarkt toevoegen = nieuwe adapter schrijven + registreren in
 * FolderImportModule — de rest van de import-pijplijn (opslaan in de database,
 * plannen, dubbele-aanbiedingen voorkomen) is generiek.
 */
export interface FolderScraperAdapter {
  /** Moet exact overeenkomen met de naam van de Supermarket-rij in de database. */
  supermarketName: string;
  sourceUrl: string;
  /** Haalt de pagina op en parst 'm naar gestructureerde aanbiedingen. */
  scrape(): Promise<ScrapedFolder>;
}

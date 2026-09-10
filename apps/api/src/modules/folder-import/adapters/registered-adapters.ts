import { ProductCategory } from '@app/shared';
import { GenericFolderAdapter } from './generic-folder-adapter';
import { JsonLdFolderAdapter } from './json-ld-folder-adapter';
import { FolderScraperAdapter } from './folder-scraper-adapter.interface';
import { extractValidUntilDayRange, extractValidUntilStandard } from '../engines/folder-page-parser.engine';
import {
  AH_CATEGORY_HEADERS,
  ALDI_CATEGORY_HEADERS,
  AMAZING_ORIENTAL_CATEGORY_HEADERS,
  DEKAMARKT_CATEGORY_HEADERS,
  EKOPLAZA_CATEGORY_HEADERS,
  JUMBO_CATEGORY_HEADERS,
  LIDL_CATEGORY_HEADERS,
  VOMAR_CATEGORY_HEADERS,
} from './category-maps';

/**
 * Alle op dit moment ondersteunde supermarkten. Nieuwe supermarkt toevoegen:
 *
 *  1. Zoek de aanbiedingen-URL op (meestal iets als "/aanbiedingen" of "/bonus").
 *  2. Controleer of de aanbiedingsdata al in de kale server-HTML zit (een
 *     `fetch()` zonder JS moet de aanbiedingsteksten al bevatten — zoiets als
 *     "korting", "gratis" of "voor €X" moet in de ruwe response staan).
 *     Zo ja: gebruik GenericFolderAdapter hieronder.
 *     Bevat de pagina schema.org JSON-LD (`<script type="application/ld+json">`
 *     met Product/Offer-data)? Gebruik dan JsonLdFolderAdapter.
 *     Is de pagina alleen client-side gerenderd (lege eerste HTML, zoals PLUS
 *     en Coop op dit moment)? Dan is deze aanpak niet toereikend — dat vraagt
 *     om een headless browser (bv. Puppeteer), bewust nog niet toegevoegd.
 *  3. Voeg een nieuw config-item toe aan de lijst hieronder.
 *  4. Maak de supermarkt aan via de /supermarkets-API (de import verwacht dat
 *     de naam exact overeenkomt met `supermarketName` hieronder).
 *
 * Bekend NIET ondersteund (client-side gerenderd, zie hierboven): PLUS, Coop
 * (Coop.nl leidt inmiddels door naar plus.nl — de ketens zijn gefuseerd).
 */
export function buildRegisteredFolderAdapters(): FolderScraperAdapter[] {
  return [
    new GenericFolderAdapter({
      supermarketName: 'Albert Heijn',
      sourceUrl: 'https://www.ah.nl/bonus',
      categoryHeaders: AH_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new GenericFolderAdapter({
      supermarketName: 'Jumbo',
      sourceUrl: 'https://www.jumbo.com/aanbiedingen/nu',
      categoryHeaders: JUMBO_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilDayRange,
    }),
    new GenericFolderAdapter({
      supermarketName: 'Lidl',
      sourceUrl: 'https://www.lidl.nl/aanbiedingen',
      categoryHeaders: LIDL_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new GenericFolderAdapter({
      supermarketName: 'Aldi',
      sourceUrl: 'https://www.aldi.nl/aanbiedingen.html',
      categoryHeaders: ALDI_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new GenericFolderAdapter({
      supermarketName: 'DekaMarkt',
      sourceUrl: 'https://www.dekamarkt.nl/aanbiedingen',
      categoryHeaders: DEKAMARKT_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new GenericFolderAdapter({
      supermarketName: 'Vomar',
      sourceUrl: 'https://www.vomar.nl/aanbiedingen',
      categoryHeaders: VOMAR_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new GenericFolderAdapter({
      supermarketName: 'Ekoplaza',
      sourceUrl: 'https://www.ekoplaza.nl/aanbiedingen',
      categoryHeaders: EKOPLAZA_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new GenericFolderAdapter({
      supermarketName: 'Amazing Oriental',
      sourceUrl: 'https://www.amazingoriental.com/aanbiedingen',
      categoryHeaders: AMAZING_ORIENTAL_CATEGORY_HEADERS,
      extractValidUntil: extractValidUntilStandard,
    }),
    new JsonLdFolderAdapter({
      supermarketName: 'Dirk',
      sourceUrl: 'https://www.dirk.nl/aanbiedingen',
      defaultCategory: ProductCategory.OTHER,
      extractValidUntil: extractValidUntilStandard,
    }),
  ];
}

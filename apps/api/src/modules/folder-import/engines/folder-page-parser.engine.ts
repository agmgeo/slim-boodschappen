import { OfferRule, ProductCategory } from '@app/shared';
import { parseOfferText } from './offer-text-parser.engine';

export interface ScrapedOffer {
  productName: string;
  category: ProductCategory;
  offerText: string;
  rule: OfferRule;
}

export interface ScrapedFolder {
  offers: ScrapedOffer[];
  /** Onherkende aanbiedingsteksten, voor monitoring/logging — niets verdwijnt stilzwijgend. */
  unrecognized: string[];
  validFrom: Date | null;
  validUntil: Date | null;
}

// Nederlandse maandnamen, nodig om "13 september" naar een Date te vertalen.
const DUTCH_MONTHS: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mrt: 2,
  maart: 2,
  apr: 3,
  april: 3,
  mei: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  aug: 7,
  augustus: 7,
  sep: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** Standaard datumherkenning: "Geldig t/m 13 september" (AH, DekaMarkt, Ekoplaza-stijl). */
export function extractValidUntilStandard(text: string, referenceYear: number): Date | null {
  const match = text.match(/Geldig t\/m\s+(\d{1,2})\s+([a-zA-Zé]+)/i);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = DUTCH_MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(referenceYear, month, day, 23, 59, 59);
}

/** Jumbo-stijl: "wo 9 sep t/m di 6 okt" — dagafkorting + dag + maandafkorting aan weerszijden. */
export function extractValidUntilDayRange(text: string, referenceYear: number): Date | null {
  const match = text.match(/t\/m\s+[a-z]{2}\s+(\d{1,2})\s+([a-z]{3,4})/i);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = DUTCH_MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(referenceYear, month, day, 23, 59, 59);
}

/**
 * Zet de platte, leesbare paginatekst van een supermarkt-aanbiedingenpagina om
 * naar gestructureerde aanbiedingen. Categorie-headers en de herkenning van
 * de geldigheidsdatum zijn parametriseerbaar per supermarkt (elke keten
 * gebruikt net iets andere bewoording), maar de kernlogica (regel-voor-regel
 * een aanbiedingstype herkennen, gevolgd door de productnaam) is generiek.
 */
export function parseFolderPageText(
  text: string,
  categoryHeaders: Record<string, ProductCategory>,
  referenceYear: number,
  extractValidUntil: (text: string, referenceYear: number) => Date | null = extractValidUntilStandard,
): ScrapedFolder {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validUntil = extractValidUntil(text, referenceYear);

  const offers: ScrapedOffer[] = [];
  const unrecognized: string[] = [];
  let currentCategory: ProductCategory = ProductCategory.OTHER;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line in categoryHeaders) {
      currentCategory = categoryHeaders[line];
      continue;
    }

    const parsed = parseOfferText(line);
    if (!parsed) {
      // Lijkt op een aanbiedingstekst (bevat korting/gratis/voor-patroon) maar
      // is niet herkend — expliciet loggen i.p.v. stilzwijgend negeren, zodat
      // nieuwe aanbiedingsvormen zichtbaar worden en de parser bijgewerkt kan worden.
      if (/korting|gratis|halve prijs/i.test(line)) {
        unrecognized.push(line);
      }
      continue;
    }

    // De productnaam staat op de eerstvolgende inhoudelijke regel; "uitgelicht"
    // is een badge-label dat sommige ketens tussen de aanbiedingstekst en de naam zetten.
    let j = i + 1;
    if (lines[j] === 'uitgelicht') j++;
    const productName = lines[j];

    if (!productName || parseOfferText(productName) || productName in categoryHeaders) {
      unrecognized.push(`${line} (geen productnaam gevonden)`);
      continue;
    }

    offers.push({
      productName,
      category: currentCategory,
      offerText: parsed.sourceText,
      rule: parsed.rule,
    });
  }

  return { offers, unrecognized, validFrom: null, validUntil };
}

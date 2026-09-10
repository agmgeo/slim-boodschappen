import { OfferRule, OfferType } from '@app/shared';

export interface ParsedOfferText {
  rule: OfferRule;
  /** De originele tekst, voor logging/debugging als de herkenning ooit misgaat. */
  sourceText: string;
}

/**
 * Herkent veelvoorkomende Nederlandse supermarkt-aanbiedingsteksten en zet ze
 * om naar een OfferRule die de bestaande OfferEngine kan doorrekenen.
 * Pure functie, geen AI: een vaste set patronen. Onherkende teksten geven
 * `null` terug (expliciet, i.p.v. giswerk) zodat de aanroeper kan loggen wat
 * er niet werd opgepikt en de folder-import daar niet stilzwijgend overheen walst.
 */
export function parseOfferText(rawText: string): ParsedOfferText | null {
  const text = rawText.trim();

  // "1+1 gratis", "2+1 gratis", "5+1 gratis"
  let match = text.match(/^(\d+)\s*\+\s*(\d+)\s+gratis$/i);
  if (match) {
    return {
      sourceText: text,
      rule: {
        type: OfferType.BUY_X_GET_Y_FREE,
        requiredQuantity: parseInt(match[1], 10),
        freeQuantity: parseInt(match[2], 10),
      },
    };
  }

  // "2 voor 2.99", "3 voor 6.00"
  match = text.match(/^(\d+)\s+voor\s+([\d.,]+)$/i);
  if (match) {
    return {
      sourceText: text,
      rule: {
        type: OfferType.FIXED_PRICE_FOR_N,
        requiredQuantity: parseInt(match[1], 10),
        fixedPrice: parseDutchPrice(match[2]),
      },
    };
  }

  // "voor 3.99" (verlaagde prijs voor 1 stuk, zonder aantal-eis)
  match = text.match(/^voor\s+([\d.,]+)$/i);
  if (match) {
    return {
      sourceText: text,
      rule: {
        type: OfferType.FIXED_PRICE_FOR_N,
        requiredQuantity: 1,
        fixedPrice: parseDutchPrice(match[1]),
      },
    };
  }

  // "2e halve prijs"
  if (/^2e\s+halve\s+prijs$/i.test(text)) {
    return { sourceText: text, rule: { type: OfferType.SECOND_HALF_PRICE } };
  }

  // "25% korting", "50% lager dan de adviesprijs" (benaderd als percentage)
  match = text.match(/^(\d+)%\s+korting$/i);
  if (match) {
    return {
      sourceText: text,
      rule: { type: OfferType.PERCENTAGE_DISCOUNT, percentageOff: parseInt(match[1], 10) },
    };
  }

  // "vanaf 3 stuks 20% korting" (staffelkorting)
  match = text.match(/^vanaf\s+(\d+)\s+stuks?\s+(\d+)%\s+korting$/i);
  if (match) {
    return {
      sourceText: text,
      rule: {
        type: OfferType.VOLUME_DISCOUNT,
        requiredQuantity: parseInt(match[1], 10),
        percentageOff: parseInt(match[2], 10),
      },
    };
  }

  // Bewust (nog) niet ondersteund: "€1 korting" (vast bedrag, geen percentage
  // of vaste prijs) — vraagt om de normale prijs erbij om te herrekenen.
  // Wordt expliciet als "niet herkend" teruggegeven i.p.v. verkeerd geraden.
  return null;
}

function parseDutchPrice(value: string): number {
  // "2,99" of "2.99" -> 2.99
  return parseFloat(value.replace(',', '.'));
}

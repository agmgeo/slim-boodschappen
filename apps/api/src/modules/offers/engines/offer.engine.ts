import { OfferRule, OfferType } from '@app/shared';

export interface OfferCalculationResult {
  quantity: number;
  regularTotal: number;
  discountedTotal: number;
  savings: number;
  explanation: string;
}

/**
 * Pure rekenlogica voor alle ondersteunde aanbiedingstypes.
 * Bewust GEEN AI: dit zijn deterministische, testbare regels.
 *
 * Belangrijk: `quantity` is het aantal stuks van dit ene product dat
 * de gebruiker wil kopen. De engine bepaalt hoeveel daarvan in
 * aanmerking komen voor de aanbieding en hoeveel tegen normale prijs.
 */
export function calculateOfferPrice(
  regularPrice: number,
  quantity: number,
  rule: OfferRule,
): OfferCalculationResult {
  if (quantity <= 0) {
    return { quantity: 0, regularTotal: 0, discountedTotal: 0, savings: 0, explanation: 'Geen items.' };
  }

  const regularTotal = round2(regularPrice * quantity);

  switch (rule.type) {
    case OfferType.PERCENTAGE_DISCOUNT: {
      const pct = rule.percentageOff ?? 0;
      const discountedTotal = round2(regularTotal * (1 - pct / 100));
      return finish(quantity, regularTotal, discountedTotal, `${pct}% korting op alle ${quantity} stuks.`);
    }

    case OfferType.FIXED_PRICE_FOR_N: {
      const n = rule.requiredQuantity ?? 1;
      const fixed = rule.fixedPrice ?? regularPrice * n;
      const fullGroups = Math.floor(quantity / n);
      const remainder = quantity % n;
      const discountedTotal = round2(fullGroups * fixed + remainder * regularPrice);
      return finish(
        quantity,
        regularTotal,
        discountedTotal,
        `${fullGroups}x "${n} voor €${fixed.toFixed(2)}"` +
          (remainder > 0 ? ` + ${remainder} stuk(s) tegen normale prijs.` : '.'),
      );
    }

    case OfferType.BUY_X_GET_Y_FREE: {
      // bv. 1+1 gratis => X=1, Y=1 (koop 1, krijg 1 gratis, groep = 2)
      const x = rule.requiredQuantity ?? 1;
      const y = rule.freeQuantity ?? 0;
      const groupSize = x + y;
      const fullGroups = Math.floor(quantity / groupSize);
      const remainder = quantity % groupSize;
      const paidInRemainder = Math.min(remainder, x);
      const paidUnits = fullGroups * x + paidInRemainder;
      const discountedTotal = round2(paidUnits * regularPrice);
      return finish(
        quantity,
        regularTotal,
        discountedTotal,
        `${x}+${y} gratis toegepast: ${paidUnits} van ${quantity} stuks betaald.`,
      );
    }

    case OfferType.SECOND_HALF_PRICE: {
      // Elk paar: 1e volle prijs, 2e halve prijs.
      const pairs = Math.floor(quantity / 2);
      const remainder = quantity % 2;
      const discountedTotal = round2(pairs * (regularPrice + regularPrice / 2) + remainder * regularPrice);
      return finish(quantity, regularTotal, discountedTotal, `2e halve prijs toegepast op ${pairs} paar/paren.`);
    }

    case OfferType.VOLUME_DISCOUNT: {
      const minQty = rule.requiredQuantity ?? 1;
      if (quantity < minQty) {
        return finish(quantity, regularTotal, regularTotal, `Nog geen staffelkorting (vanaf ${minQty} stuks).`);
      }
      const pct = rule.percentageOff ?? 0;
      const discountedTotal = round2(regularTotal * (1 - pct / 100));
      return finish(quantity, regularTotal, discountedTotal, `Staffelkorting: vanaf ${minQty} stuks ${pct}% korting.`);
    }

    case OfferType.BUNDLE: {
      // Bundle-aanbiedingen (product A + B samen voor €X) hebben prijzen van
      // meerdere producten nodig en worden op mandje-niveau afgehandeld door
      // de PriceComparisonEngine, niet hier op los-product-niveau.
      return finish(quantity, regularTotal, regularTotal, 'Combinatieaanbieding wordt op mandje-niveau berekend.');
    }

    default:
      return finish(quantity, regularTotal, regularTotal, 'Onbekend aanbiedingstype, normale prijs toegepast.');
  }
}

function finish(
  quantity: number,
  regularTotal: number,
  discountedTotal: number,
  explanation: string,
): OfferCalculationResult {
  return {
    quantity,
    regularTotal,
    discountedTotal,
    savings: round2(regularTotal - discountedTotal),
    explanation,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

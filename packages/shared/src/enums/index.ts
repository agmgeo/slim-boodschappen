// Talen die de app ondersteunt. Nieuwe taal toevoegen = enum-waarde + vertaalbestand.
export enum Locale {
  NL = 'nl',
  EN = 'en',
  // Toekomstig, nog niet actief: DE, PL, TR, FR, ES
}

// Type van een aanbieding. Bepaalt welke rekenregel de OfferEngine gebruikt.
export enum OfferType {
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT', // bv. 25% korting
  FIXED_PRICE_FOR_N = 'FIXED_PRICE_FOR_N', // "2 voor €3", "3 voor €5"
  BUY_X_GET_Y_FREE = 'BUY_X_GET_Y_FREE', // "1+1 gratis" = X=1,Y=1 / "2+1 gratis" = X=2,Y=1
  SECOND_HALF_PRICE = 'SECOND_HALF_PRICE', // "2e halve prijs"
  VOLUME_DISCOUNT = 'VOLUME_DISCOUNT', // "vanaf 3 stuks -20%"
  BUNDLE = 'BUNDLE', // combinatieaanbieding, bv. product A + B samen voor €X
}

export enum ProductCategory {
  DAIRY = 'DAIRY',
  BAKERY = 'BAKERY',
  MEAT = 'MEAT',
  FISH = 'FISH',
  VEGETABLES = 'VEGETABLES',
  FRUIT = 'FRUIT',
  DRINKS = 'DRINKS',
  SNACKS = 'SNACKS',
  FROZEN = 'FROZEN',
  PANTRY = 'PANTRY',
  HOUSEHOLD = 'HOUSEHOLD',
  PERSONAL_CARE = 'PERSONAL_CARE',
  OTHER = 'OTHER',
}

export enum HealthGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export enum OptimizationStrategy {
  CHEAPEST = 'CHEAPEST', // goedkoopste totale mandje, ongeacht afstand
  NEAREST = 'NEAREST', // dichtstbijzijnde winkel die alles (of meest) heeft
  SMARTEST = 'SMARTEST', // beste balans prijs vs. reistijd/kosten/aantal stops
}

export enum TravelMode {
  WALK = 'WALK',
  BIKE = 'BIKE',
  CAR = 'CAR',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
}

export enum ScanSource {
  BARCODE = 'BARCODE',
  MANUAL = 'MANUAL',
  RECEIPT_OCR = 'RECEIPT_OCR', // toekomstige AI-fallback
}

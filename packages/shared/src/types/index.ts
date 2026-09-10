import {
  HealthGrade,
  Locale,
  OfferType,
  OptimizationStrategy,
  ProductCategory,
  ScanSource,
  TravelMode,
} from '../enums';

export interface LocalizedText {
  [Locale.NL]: string;
  [Locale.EN]: string;
  // andere talen optioneel totdat ze actief zijn
  [key: string]: string | undefined;
}

// ---------- Products & matching ----------

export interface Product {
  id: string;
  canonicalName: LocalizedText;
  category: ProductCategory;
  brand?: string;
  unit: string; // bv. "stuk", "500g", "1L"
  unitSize?: number; // numerieke hoeveelheid voor prijs-per-eenheid vergelijking
  unitOfMeasure?: string; // 'g' | 'ml' | 'stuk' | ...
  barcode?: string; // EAN/GTIN
  imageUrl?: string;
  nutrition?: NutritionInfo;
  healthScore?: HealthScoreResult;
}

// Ruwe, vrije-tekst input van de gebruiker in de boodschappenlijst,
// vóór normalisatie/matching naar een canoniek Product.
export interface RawShoppingListEntry {
  id: string;
  rawText: string; // "2x melk halfvol" zoals de gebruiker het typte
  quantity: number;
  matchedProductId?: string;
  matchConfidence?: number; // 0-1, gebruikt om te bepalen of AI-fallback nodig is
  matchMethod?: 'EXACT' | 'ALIAS' | 'FUZZY' | 'AI_FALLBACK' | 'UNMATCHED';
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: RawShoppingListEntry[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Supermarkets & stores ----------

export interface Supermarket {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface StoreLocation {
  id: string;
  supermarketId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ---------- Offers & prices ----------

export interface OfferRule {
  type: OfferType;
  // Generieke parameters; welke velden gebruikt worden hangt af van `type`.
  requiredQuantity?: number; // X in "2 voor", "vanaf X stuks", "X+Y gratis"
  freeQuantity?: number; // Y in "X+Y gratis"
  fixedPrice?: number; // totale prijs bij FIXED_PRICE_FOR_N
  percentageOff?: number; // 0-100
  bundleProductIds?: string[]; // voor BUNDLE-aanbiedingen
}

export interface Offer {
  id: string;
  productId: string;
  supermarketId: string;
  storeId?: string; // optioneel: aanbieding kan filiaal-specifiek zijn
  rule: OfferRule;
  validFrom: string;
  validUntil: string;
  sourceFolderId?: string;
}

export interface Price {
  id: string;
  productId: string;
  supermarketId: string;
  storeId?: string;
  regularPrice: number; // in euro's
  currentPrice: number; // regularPrice, of lager als er een offer actief is
  activeOfferId?: string;
  lastUpdated: string;
}

export interface Folder {
  id: string;
  supermarketId: string;
  validFrom: string;
  validUntil: string;
  offerIds: string[];
}

// ---------- Nutrition & health ----------

export interface NutritionInfo {
  per100g: {
    energyKcal: number;
    fat: number;
    saturatedFat: number;
    carbohydrates: number;
    sugars: number;
    fiber: number;
    protein: number;
    salt: number;
  };
  additives?: string[];
  allergens?: string[];
}

export interface HealthScoreResult {
  grade: HealthGrade;
  score: number; // 0-100, hoger = gezonder
  breakdown: {
    label: string;
    points: number;
    reason: string;
  }[];
}

// ---------- Price comparison & optimization ----------

export interface MissingProduct {
  productId: string;
  productName: string;
  reason: 'NOT_SOLD' | 'OUT_OF_STOCK_DATA' | 'UNMATCHED';
}

export interface SupermarketBasketResult {
  supermarketId: string;
  storeId?: string;
  totalPrice: number;
  totalRegularPrice: number;
  totalSavings: number;
  missingProducts: MissingProduct[];
  matchedItemCount: number;
  totalItemCount: number;
  travelCost?: TravelCostResult;
}

export interface TravelCostResult {
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  estimatedTravelCost: number; // euro's, bv. brandstof/km-vergoeding
  travelMode: TravelMode;
}

export interface MultiStorePlanEntry {
  supermarketId: string;
  storeId?: string;
  productIds: string[];
  subtotal: number;
}

export interface MultiStorePlanResult {
  isWorthIt: boolean;
  singleStoreBaseline: SupermarketBasketResult;
  plan: MultiStorePlanEntry[];
  totalPrice: number;
  totalTravelCost: number;
  netSavingsVsSingleStore: number;
}

export interface OptimizationResult {
  strategy: OptimizationStrategy;
  recommendation: SupermarketBasketResult | MultiStorePlanResult;
  alternatives: SupermarketBasketResult[];
  explanation: string[]; // transparante uitleg van de keuze, in leesbare taal
}

// ---------- Scan history & favorites ----------

export interface ScanHistoryEntry {
  id: string;
  userId: string;
  productId?: string;
  barcode?: string;
  source: ScanSource;
  scannedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

// ---------- Settings ----------

export interface UserSettings {
  userId: string;
  locale: Locale;
  homeLatitude?: number;
  homeLongitude?: number;
  preferredTravelMode: TravelMode;
  maxExtraStores: number; // hoeveel extra winkels de gebruiker bereid is te bezoeken
  costPerKm: number; // gebruikt voor reiskosten-berekening
}

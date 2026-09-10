const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

/**
 * Dunne fetch-wrapper voor de API. Voegt automatisch de JWT toe indien
 * aanwezig en gooit een ApiError met leesbare boodschap bij fouten.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message ?? message;
    } catch {
      // response had geen JSON-body
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- Domeintypes die de frontend gebruikt ----------

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string };
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  rawText: string;
  quantity: number;
  matchedProductId: string | null;
  matchConfidence: number | null;
  matchMethod: 'EXACT' | 'ALIAS' | 'FUZZY' | 'AI_FALLBACK' | 'UNMATCHED' | null;
}

export interface MissingProduct {
  productId: string;
  productName: string;
  reason: string;
}

export interface TravelCostResult {
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  estimatedTravelCost: number;
  travelMode: string;
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

export interface OptimizationResult {
  strategy: 'CHEAPEST' | 'NEAREST' | 'SMARTEST';
  recommendation: SupermarketBasketResult | null;
  alternatives: SupermarketBasketResult[];
  explanation: string[];
  excludedForStock?: string[];
}

export interface Supermarket {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface StoreLocation {
  id: string;
  supermarketId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Folder {
  id: string;
  supermarketId: string;
  validFrom: string;
  validUntil: string;
}

export type StockStatus = 'OK' | 'LOW' | 'OUT';

export interface PantryItem {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  updatedAt: string;
  productNameNl: string;
  productNameEn: string;
  unit: string;
  status: StockStatus;
}

export interface UserSettings {
  userId: string;
  locale: 'NL' | 'EN';
  homeLatitude: number | null;
  homeLongitude: number | null;
  preferredTravelMode: 'WALK' | 'BIKE' | 'CAR' | 'PUBLIC_TRANSPORT';
  maxExtraStores: number;
  costPerKm: number;
}

export interface Product {
  id: string;
  nameNl: string;
  nameEn: string;
  category: string;
  brand: string | null;
  unit: string;
  unitSize: number | null;
  unitOfMeasure: string | null;
  barcode: string | null;
  imageUrl: string | null;
}

/** Kiest de productnaam in de actieve taal; valt terug op NL als EN ontbreekt. */
export function localizedProductName(product: Pick<Product, 'nameNl' | 'nameEn'>, locale: string): string {
  return locale === 'en' ? (product.nameEn || product.nameNl) : product.nameNl;
}

export interface NutritionInfo {
  productId: string;
  energyKcal: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugars: number;
  fiber: number;
  protein: number;
  salt: number;
  additives: string[];
  allergens: string[];
}

export interface HealthScoreBreakdownEntry {
  label: string;
  points: number;
  reason: string;
}

export interface HealthScoreResult {
  productId: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  score: number;
  breakdown: HealthScoreBreakdownEntry[];
}

export interface HealthierAlternative {
  product: Product;
  healthScore: HealthScoreResult;
}

export interface MultiStorePlanEntry {
  supermarketId: string;
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

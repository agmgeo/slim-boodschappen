export type StockStatus = 'OK' | 'LOW' | 'OUT';

export interface PantryItemLike {
  productId: string;
  quantity: number;
  lowStockThreshold: number;
}

export interface StockStatusResult {
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  status: StockStatus;
}

/**
 * Bepaalt de voorraadstatus van één product. Pure, deterministische regel:
 *  - 0 of minder op voorraad -> OUT ("op")
 *  - op of onder de ingestelde drempel -> LOW ("bijna op")
 *  - anders -> OK
 */
export function calculateStockStatus(quantity: number, lowStockThreshold: number): StockStatus {
  if (quantity <= 0) return 'OUT';
  if (quantity <= lowStockThreshold) return 'LOW';
  return 'OK';
}

/** Verrijkt een lijst voorraaditems met hun status, en sorteert kritiek eerst. */
export function evaluatePantry(items: PantryItemLike[]): StockStatusResult[] {
  const severity: Record<StockStatus, number> = { OUT: 0, LOW: 1, OK: 2 };

  return items
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      status: calculateStockStatus(item.quantity, item.lowStockThreshold),
    }))
    .sort((a, b) => severity[a.status] - severity[b.status]);
}

/** Filtert alleen de producten die aandacht nodig hebben (LOW of OUT). */
export function getItemsNeedingRestock(items: PantryItemLike[]): StockStatusResult[] {
  return evaluatePantry(items).filter((item) => item.status !== 'OK');
}

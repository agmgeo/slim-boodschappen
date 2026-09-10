import { calculateStockStatus, evaluatePantry, getItemsNeedingRestock } from './stock-status.engine';

describe('StockStatusEngine', () => {
  describe('calculateStockStatus', () => {
    it('is OUT bij 0 of minder', () => {
      expect(calculateStockStatus(0, 1)).toBe('OUT');
      expect(calculateStockStatus(-1, 1)).toBe('OUT');
    });

    it('is LOW op of onder de drempel', () => {
      expect(calculateStockStatus(1, 1)).toBe('LOW');
      expect(calculateStockStatus(2, 2)).toBe('LOW');
    });

    it('is OK ruim boven de drempel', () => {
      expect(calculateStockStatus(5, 1)).toBe('OK');
    });

    it('respecteert een hogere, product-specifieke drempel', () => {
      // bv. wc-papier: pas "bijna op" bij 3 rollen, niet bij 1
      expect(calculateStockStatus(3, 3)).toBe('LOW');
      expect(calculateStockStatus(4, 3)).toBe('OK');
    });
  });

  describe('evaluatePantry', () => {
    it('sorteert OUT vóór LOW vóór OK', () => {
      const result = evaluatePantry([
        { productId: 'ok-product', quantity: 10, lowStockThreshold: 1 },
        { productId: 'out-product', quantity: 0, lowStockThreshold: 1 },
        { productId: 'low-product', quantity: 1, lowStockThreshold: 1 },
      ]);
      expect(result.map((r) => r.productId)).toEqual(['out-product', 'low-product', 'ok-product']);
    });
  });

  describe('getItemsNeedingRestock', () => {
    it('geeft alleen LOW en OUT producten terug', () => {
      const result = getItemsNeedingRestock([
        { productId: 'ok-product', quantity: 10, lowStockThreshold: 1 },
        { productId: 'out-product', quantity: 0, lowStockThreshold: 1 },
        { productId: 'low-product', quantity: 1, lowStockThreshold: 1 },
      ]);
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.status !== 'OK')).toBe(true);
    });

    it('geeft een lege lijst als alles op voorraad is', () => {
      const result = getItemsNeedingRestock([{ productId: 'ok-product', quantity: 10, lowStockThreshold: 1 }]);
      expect(result).toHaveLength(0);
    });
  });
});

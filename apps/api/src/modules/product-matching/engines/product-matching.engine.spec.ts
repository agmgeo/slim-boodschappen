import { matchProduct, normalizeProductText, similarity } from './product-matching.engine';

describe('ProductMatchingEngine', () => {
  const candidates = [
    { productId: 'p1', names: ['Halfvolle melk', 'melk halfvol'] },
    { productId: 'p2', names: ['Volle melk'] },
    { productId: 'p3', names: ['Bruin brood', 'volkoren brood'] },
  ];

  it('normaliseert hoeveelheid-prefixen en leestekens', () => {
    expect(normalizeProductText('2x Halfvolle Melk!')).toBe('halfvolle melk');
    expect(normalizeProductText('  Bruin   Brood ')).toBe('bruin brood');
  });

  it('matcht exact op canonieke naam', () => {
    const result = matchProduct('Bruin brood', candidates);
    expect(result.method).toBe('EXACT');
    expect(result.productId).toBe('p3');
    expect(result.confidence).toBe(1);
  });

  it('matcht exact op alias', () => {
    const result = matchProduct('melk halfvol', candidates);
    expect(result.method).toBe('EXACT');
    expect(result.productId).toBe('p1');
  });

  it('matcht via fuzzy matching bij typefout', () => {
    const result = matchProduct('halfvolle mlek', candidates); // typo
    expect(result.method).toBe('FUZZY');
    expect(result.productId).toBe('p1');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('geeft UNMATCHED voor volledig onbekend product', () => {
    const result = matchProduct('ruimteschip tandpasta xyz', candidates);
    expect(result.method).toBe('UNMATCHED');
    expect(result.productId).toBeNull();
  });

  it('similarity van identieke strings is 1', () => {
    expect(similarity('melk', 'melk')).toBe(1);
  });
});

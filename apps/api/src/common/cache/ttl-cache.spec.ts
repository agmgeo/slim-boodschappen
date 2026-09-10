import { TtlCache } from './ttl-cache';

describe('TtlCache', () => {
  it('geeft undefined terug voor een onbekende sleutel', () => {
    const cache = new TtlCache();
    expect(cache.get('missing')).toBeUndefined();
  });

  it('bewaart en geeft een waarde terug binnen de TTL', () => {
    let now = 1000;
    const cache = new TtlCache(() => now);
    cache.set('key', 'value', 5000);
    now += 4000;
    expect(cache.get('key')).toBe('value');
  });

  it('laat een waarde verlopen na de TTL', () => {
    let now = 1000;
    const cache = new TtlCache(() => now);
    cache.set('key', 'value', 5000);
    now += 5001;
    expect(cache.get('key')).toBeUndefined();
  });

  it('getOrCompute berekent maar één keer binnen de TTL', async () => {
    let now = 0;
    const cache = new TtlCache(() => now);
    let calls = 0;
    const compute = async () => {
      calls++;
      return 42;
    };

    const first = await cache.getOrCompute('key', 1000, compute);
    const second = await cache.getOrCompute('key', 1000, compute);

    expect(first).toBe(42);
    expect(second).toBe(42);
    expect(calls).toBe(1);
  });

  it('getOrCompute berekent opnieuw nadat de TTL verlopen is', async () => {
    let now = 0;
    const cache = new TtlCache(() => now);
    let calls = 0;
    const compute = async () => {
      calls++;
      return calls;
    };

    await cache.getOrCompute('key', 1000, compute);
    now += 1001;
    const second = await cache.getOrCompute('key', 1000, compute);

    expect(second).toBe(2);
    expect(calls).toBe(2);
  });

  it('invalidate verwijdert één sleutel', () => {
    const cache = new TtlCache();
    cache.set('a', '1', 5000);
    cache.set('b', '2', 5000);
    cache.invalidate('a');
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('2');
  });

  it('invalidatePrefix verwijdert alle sleutels met een gegeven prefix', () => {
    const cache = new TtlCache();
    cache.set('products:1', 'a', 5000);
    cache.set('products:2', 'b', 5000);
    cache.set('supermarkets:1', 'c', 5000);
    cache.invalidatePrefix('products:');
    expect(cache.get('products:1')).toBeUndefined();
    expect(cache.get('products:2')).toBeUndefined();
    expect(cache.get('supermarkets:1')).toBe('c');
  });
});

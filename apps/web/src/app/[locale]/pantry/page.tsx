'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError, localizedProductName, PantryItem, Product, ShoppingList } from '@/lib/api';

const STATUS_STYLES: Record<PantryItem['status'], string> = {
  OUT: 'bg-sticker-light text-sticker',
  LOW: 'bg-amber-100 text-amber-700',
  OK: 'bg-leaf-light text-leaf',
};

export default function PantryPage() {
  return (
    <RequireAuth>
      <PantryContent />
    </RequireAuth>
  );
}

function PantryContent() {
  const t = useTranslations('pantry');
  const locale = useLocale();
  const { token } = useAuth();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedToList, setAddedToList] = useState<number | null>(null);

  function loadPantry() {
    if (!token) return;
    apiFetch<PantryItem[]>('/pantry', { token }).then(setItems);
  }

  useEffect(loadPantry, [token]);
  useEffect(() => {
    if (!token) return;
    apiFetch<ShoppingList[]>('/shopping-lists', { token }).then(setLists);
  }, [token]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      apiFetch<Product[]>(`/products?q=${encodeURIComponent(query.trim())}`).then(setResults);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  async function addProduct(productId: string) {
    if (!token) return;
    try {
      await apiFetch('/pantry', { method: 'POST', token, body: { productId, quantity: 1, lowStockThreshold: 1 } });
      setQuery('');
      setResults([]);
      loadPantry();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('addError'));
    }
  }

  async function adjust(productId: string, delta: number) {
    if (!token) return;
    await apiFetch('/pantry/adjust', { method: 'POST', token, body: { productId, delta } });
    loadPantry();
  }

  async function removeItem(itemId: string) {
    if (!token) return;
    await apiFetch(`/pantry/${itemId}`, { method: 'DELETE', token });
    loadPantry();
  }

  async function addLowStockToList(listId: string) {
    if (!token) return;
    const added = await apiFetch<unknown[]>(`/pantry/low-stock/add-to-list/${listId}`, { method: 'POST', token });
    setAddedToList(added.length);
    loadPantry();
  }

  const needsAttention = items.filter((i) => i.status !== 'OK');

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>
      <p className="mb-6 text-sm text-slate">{t('subtitle')}</p>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-white shadow-sm">
            {results.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => addProduct(product.id)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-leaf-light"
                >
                  {localizedProductName(product, locale)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {needsAttention.length > 0 && lists.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-sticker-light px-4 py-3 text-sm">
          <span className="text-ink/80">{t('restockPrompt', { count: needsAttention.length })}</span>
          {lists.slice(0, 1).map((list) => (
            <button
              key={list.id}
              onClick={() => addLowStockToList(list.id)}
              className="rounded-full bg-sticker px-3 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              {t('addToList', { listName: list.name })}
            </button>
          ))}
        </div>
      )}
      {addedToList !== null && (
        <p className="mt-2 text-sm text-leaf">{t('addedToList', { count: addedToList })}</p>
      )}

      <ul className="mt-6 space-y-2">
        {items.length === 0 && <p className="text-slate">{t('empty')}</p>}
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}
              >
                {t(`status.${item.status}`)}
              </span>
              <span className="text-ink">
                {locale === 'en' ? item.productNameEn || item.productNameNl : item.productNameNl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjust(item.productId, -1)}
                aria-label={t('decrease')}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink hover:border-leaf"
              >
                −
              </button>
              <span className="w-6 text-center font-mono tabular-nums">{item.quantity}</span>
              <button
                onClick={() => adjust(item.productId, 1)}
                aria-label={t('increase')}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink hover:border-leaf"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                aria-label={t('remove')}
                className="ml-1 text-slate hover:text-red-500"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

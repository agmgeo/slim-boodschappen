'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError, ShoppingList, ShoppingListItem } from '@/lib/api';

export default function ShoppingListPage() {
  return (
    <RequireAuth>
      <ShoppingListContent />
    </RequireAuth>
  );
}

function ShoppingListContent() {
  const t = useTranslations('shoppingList');
  const { token } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newListName, setNewListName] = useState(t('newListPlaceholder'));
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<ShoppingList[]>('/shopping-lists', { token })
      .then((data) => {
        setLists(data);
        if (data.length > 0) setActiveListId(data[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : t('loadError')));
  }, [token, t]);

  useEffect(() => {
    if (!token || !activeListId) return;
    apiFetch<ShoppingListItem[]>(`/shopping-lists/${activeListId}/items`, { token }).then(setItems);
  }, [token, activeListId]);

  async function createList() {
    if (!token || !newListName.trim()) return;
    const list = await apiFetch<ShoppingList>('/shopping-lists', {
      method: 'POST',
      token,
      body: { name: newListName },
    });
    setLists((prev) => [...prev, list]);
    setActiveListId(list.id);
    setItems([]);
  }

  async function addItem() {
    if (!token || !activeListId || !input.trim()) return;
    setError(null);
    try {
      const item = await apiFetch<ShoppingListItem>(`/shopping-lists/${activeListId}/items`, {
        method: 'POST',
        token,
        body: { rawText: input, quantity: 1 },
      });
      setItems((prev) => [...prev, item]);
      setInput('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('addError'));
    }
  }

  async function removeItem(itemId: string) {
    if (!token) return;
    await apiFetch(`/shopping-lists/items/${itemId}`, { method: 'DELETE', token });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              list.id === activeListId ? 'bg-leaf text-white' : 'bg-slate-light text-ink/70'
            }`}
          >
            {list.name}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="w-40 rounded-full border border-line px-3 py-1 text-sm focus:border-leaf focus:outline-none"
          />
          <button onClick={createList} className="rounded-full bg-ink px-3 py-1 text-sm text-white">
            {t('newListButton')}
          </button>
        </div>
      </div>

      {activeListId && (
        <>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder={t('addPlaceholder')}
              className="flex-1 rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
            />
            <button onClick={addItem} className="rounded-lg bg-leaf px-4 py-2 text-white hover:opacity-90">
              {t('add')}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <ul className="mt-6 space-y-2">
            {items.length === 0 && <p className="text-slate">{t('empty')}</p>}
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-2"
              >
                <span>
                  {item.quantity}x{' '}
                  {item.matchedProductId ? (
                    <Link href={`/products/${item.matchedProductId}`} className="hover:text-leaf hover:underline">
                      {item.rawText}
                    </Link>
                  ) : (
                    item.rawText
                  )}
                  {item.matchMethod && (
                    <span
                      className={`ml-2 text-xs ${
                        item.matchMethod === 'UNMATCHED' ? 'text-red-500' : 'text-slate'
                      }`}
                    >
                      ({item.matchMethod}
                      {item.matchConfidence != null ? `, ${Math.round(item.matchConfidence * 100)}%` : ''})
                    </span>
                  )}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-slate hover:text-red-500">
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {items.length > 0 && (
            <Link
              href={`/compare/${activeListId}`}
              className="mt-8 inline-block rounded-full bg-leaf px-6 py-3 font-medium text-white hover:opacity-90"
            >
              {t('compareButton')}
            </Link>
          )}
        </>
      )}
    </main>
  );
}

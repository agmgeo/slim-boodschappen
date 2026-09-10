'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { apiFetch, ApiError, StoreLocation, Supermarket } from '@/lib/api';

export default function SupermarketsPage() {
  const t = useTranslations('supermarkets');
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<Supermarket[]>('/supermarkets').then(setSupermarkets);
    apiFetch<StoreLocation[]>('/stores').then(setStores);
  }

  useEffect(load, []);

  async function addSupermarket() {
    if (!name.trim()) return;
    setError(null);
    try {
      await apiFetch<Supermarket>('/supermarkets', { method: 'POST', body: { name } });
      setName('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('addError'));
    }
  }

  const storeCount = (supermarketId: string) => stores.filter((s) => s.supermarketId === supermarketId).length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSupermarket()}
          placeholder={t('namePlaceholder')}
          className="flex-1 rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
        />
        <button onClick={addSupermarket} className="rounded-lg bg-leaf px-4 py-2 text-white hover:bg-leaf-dark">
          {t('add')}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 space-y-2">
        {supermarkets.length === 0 && <p className="text-slate">{t('empty')}</p>}
        {supermarkets.map((sm) => (
          <li key={sm.id} className="rounded-lg border border-line bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{sm.name}</span>
              <span className="text-xs text-slate">{t('storeCount', { count: storeCount(sm.id) })}</span>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <Link href={`/supermarkets/${sm.id}`} className="text-leaf hover:underline">
                {t('manageStores')}
              </Link>
              <Link href={`/supermarkets/${sm.id}/folders`} className="text-leaf hover:underline">
                {t('manageFolders')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

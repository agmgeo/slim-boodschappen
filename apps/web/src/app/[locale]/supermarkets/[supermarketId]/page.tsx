'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { apiFetch, ApiError, StoreLocation, Supermarket } from '@/lib/api';

export default function SupermarketStoresPage() {
  const t = useTranslations('supermarkets');
  const params = useParams();
  const supermarketId = params.supermarketId as string;

  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '' });
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<Supermarket>(`/supermarkets/${supermarketId}`).then(setSupermarket);
    apiFetch<StoreLocation[]>(`/stores?supermarketId=${supermarketId}`).then(setStores);
  }

  useEffect(load, [supermarketId]);

  async function addStore() {
    const latitude = parseFloat(form.latitude);
    const longitude = parseFloat(form.longitude);
    if (!form.name.trim() || !form.address.trim() || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setError(t('storeFormError'));
      return;
    }
    setError(null);
    try {
      await apiFetch('/stores', {
        method: 'POST',
        body: { supermarketId, name: form.name, address: form.address, latitude, longitude },
      });
      setForm({ name: '', address: '', latitude: '', longitude: '' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('addError'));
    }
  }

  if (!supermarket) {
    return <main className="mx-auto max-w-2xl px-4 py-12 text-slate sm:px-6">{t('loading')}</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/supermarkets" className="text-sm text-leaf hover:underline">
        ← {t('title')}
      </Link>
      <h1 className="mb-6 mt-2 font-display text-2xl font-semibold text-leaf">{supermarket.name}</h1>

      <div className="rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-ink">{t('addStore')}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t('storeName')}
            className="rounded-lg border border-line px-3 py-2 text-sm focus:border-leaf focus:outline-none"
          />
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder={t('storeAddress')}
            className="rounded-lg border border-line px-3 py-2 text-sm focus:border-leaf focus:outline-none"
          />
          <input
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            placeholder={t('latitude')}
            className="rounded-lg border border-line px-3 py-2 text-sm focus:border-leaf focus:outline-none"
          />
          <input
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            placeholder={t('longitude')}
            className="rounded-lg border border-line px-3 py-2 text-sm focus:border-leaf focus:outline-none"
          />
        </div>
        <button onClick={addStore} className="mt-3 rounded-lg bg-leaf px-4 py-2 text-sm text-white hover:bg-leaf-dark">
          {t('add')}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <ul className="mt-6 space-y-2">
        {stores.length === 0 && <p className="text-slate">{t('noStores')}</p>}
        {stores.map((store) => (
          <li key={store.id} className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="font-medium text-ink">{store.name}</p>
            <p className="text-sm text-slate">{store.address}</p>
            <p className="font-mono text-xs text-slate">
              {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}

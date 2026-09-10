'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { apiFetch, ApiError, Folder, Supermarket } from '@/lib/api';

export default function SupermarketFoldersPage() {
  const t = useTranslations('folders');
  const params = useParams();
  const supermarketId = params.supermarketId as string;

  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<Supermarket>(`/supermarkets/${supermarketId}`).then(setSupermarket);
    apiFetch<Folder[]>('/folders').then((all) => setFolders(all.filter((f) => f.supermarketId === supermarketId)));
  }

  useEffect(load, [supermarketId]);

  async function addFolder() {
    if (!validFrom || !validUntil) {
      setError(t('formError'));
      return;
    }
    setError(null);
    try {
      await apiFetch('/folders', {
        method: 'POST',
        body: { supermarketId, validFrom, validUntil },
      });
      setValidFrom('');
      setValidUntil('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('addError'));
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString();
  }

  if (!supermarket) {
    return <main className="mx-auto max-w-2xl px-4 py-12 text-slate sm:px-6">{t('loading')}</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/supermarkets" className="text-sm text-leaf hover:underline">
        ← {t('backToSupermarkets')}
      </Link>
      <h1 className="mb-1 mt-2 font-display text-2xl font-semibold text-leaf">{supermarket.name}</h1>
      <p className="mb-6 text-sm text-slate">{t('subtitle')}</p>

      <div className="rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-ink">{t('addFolder')}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate">
            {t('validFrom')}
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm focus:border-leaf focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate">
            {t('validUntil')}
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm focus:border-leaf focus:outline-none"
            />
          </label>
        </div>
        <button onClick={addFolder} className="mt-3 rounded-lg bg-leaf px-4 py-2 text-sm text-white hover:bg-leaf-dark">
          {t('add')}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-3 text-xs text-slate">{t('manualNote')}</p>
      </div>

      <ul className="mt-6 space-y-2">
        {folders.length === 0 && <p className="text-slate">{t('empty')}</p>}
        {folders.map((folder) => (
          <li key={folder.id} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
            <span className="text-ink">
              {formatDate(folder.validFrom)} – {formatDate(folder.validUntil)}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

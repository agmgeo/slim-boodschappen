'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

interface Favorite {
  id: string;
  productId: string;
  createdAt: string;
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}

function FavoritesContent() {
  const t = useTranslations('favorites');
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Favorite[]>('/favorites', { token }).then(setFavorites);
  }, [token]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>
      {favorites.length === 0 ? (
        <p className="text-slate">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((fav) => (
            <li key={fav.id} className="rounded-lg border border-line bg-white px-4 py-2">
              {t('productLabel')} {fav.productId}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

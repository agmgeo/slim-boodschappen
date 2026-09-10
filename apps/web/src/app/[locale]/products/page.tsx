'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { apiFetch, localizedProductName, Product } from '@/lib/api';

export default function ProductsPage() {
  const t = useTranslations('products');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      const path = query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products';
      apiFetch<Product[]>(path)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
      />

      {loading && <p className="mt-4 text-sm text-slate">{t('searching')}</p>}

      <ul className="mt-6 space-y-2">
        {!loading && results.length === 0 && <p className="text-slate">{t('empty')}</p>}
        {results.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.id}`}
              className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3 hover:border-leaf"
            >
              <span>
                {localizedProductName(product, locale)}
                {product.brand && <span className="ml-2 text-xs text-slate">{product.brand}</span>}
              </span>
              <span className="text-xs uppercase text-slate">{product.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

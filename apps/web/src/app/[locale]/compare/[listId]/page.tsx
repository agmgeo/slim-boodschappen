'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError, MultiStorePlanResult, OptimizationResult, Supermarket } from '@/lib/api';

type Strategy = 'CHEAPEST' | 'NEAREST' | 'SMARTEST';

export default function ComparePage() {
  return (
    <RequireAuth>
      <CompareContent />
    </RequireAuth>
  );
}

function CompareContent() {
  const t = useTranslations('optimization');
  const tc = useTranslations('compare');
  const { token } = useAuth();
  const params = useParams();
  const listId = params.listId as string;

  const [strategy, setStrategy] = useState<Strategy>('SMARTEST');
  const [considerPantry, setConsiderPantry] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multiStore, setMultiStore] = useState<MultiStorePlanResult | null>(null);
  const [multiStoreLoading, setMultiStoreLoading] = useState(false);

  useEffect(() => {
    apiFetch<Supermarket[]>('/supermarkets').then(setSupermarkets).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token || !listId) return;
    setLoading(true);
    setError(null);
    apiFetch<OptimizationResult>(
      `/shopping-optimization/${listId}?strategy=${strategy}&considerPantry=${considerPantry}`,
      { token },
    )
      .then(setResult)
      .catch((err) => setError(err instanceof ApiError ? err.message : tc('loadError')))
      .finally(() => setLoading(false));
  }, [token, listId, strategy, considerPantry, tc]);

  const supermarketName = (id: string) => supermarkets.find((s) => s.id === id)?.name ?? id;

  async function checkMultiStore() {
    if (!token || !listId) return;
    setMultiStoreLoading(true);
    try {
      const advice = await apiFetch<MultiStorePlanResult | null>(
        `/shopping-optimization/${listId}/multi-store?considerPantry=${considerPantry}`,
        { token },
      );
      setMultiStore(advice);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tc('multiStoreLoadError'));
    } finally {
      setMultiStoreLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{tc('title')}</h1>

      <div className="mb-3 flex gap-2">
        {(['CHEAPEST', 'NEAREST', 'SMARTEST'] as Strategy[]).map((s) => (
          <button
            key={s}
            onClick={() => setStrategy(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              strategy === s ? 'bg-leaf text-white' : 'bg-slate-light text-ink/70'
            }`}
          >
            {t(s.toLowerCase() as 'cheapest' | 'nearest' | 'smartest')}
          </button>
        ))}
      </div>

      <label className="mb-6 flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={considerPantry}
          onChange={(e) => setConsiderPantry(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-leaf"
        />
        {tc('considerPantry')}
      </label>

      {loading && <p className="text-slate">{tc('comparing')}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && !!result.excludedForStock?.length && (
        <p className="mb-3 text-sm text-leaf">{tc('excludedForStock', { count: result.excludedForStock.length })}</p>
      )}

      {result && !result.recommendation && <p className="text-slate">{result.explanation[0]}</p>}

      {result?.recommendation && (
        <div className="rounded-2xl border border-leaf bg-leaf-light p-6">
          <p className="text-sm font-medium uppercase text-leaf">{tc('recommended')}</p>
          <h2 className="mt-1 text-xl font-bold">{supermarketName(result.recommendation.supermarketId)}</h2>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-leaf">
            €{result.recommendation.totalPrice.toFixed(2)}
          </p>
          {result.recommendation.totalSavings > 0 && (
            <p className="text-sm text-leaf">
              {t('savings', { amount: result.recommendation.totalSavings.toFixed(2) })}
            </p>
          )}
          {result.recommendation.travelCost && (
            <p className="mt-1 text-sm text-ink/70">
              🚗 {result.recommendation.travelCost.distanceKm} km · €
              {result.recommendation.travelCost.estimatedTravelCost.toFixed(2)} ·{' '}
              {result.recommendation.travelCost.estimatedTravelTimeMinutes} min
            </p>
          )}
          {result.recommendation.missingProducts.length > 0 && (
            <p className="mt-1 text-sm text-amber-600">
              ⚠ {t('missingProducts', { count: result.recommendation.missingProducts.length })}
            </p>
          )}
          <ul className="mt-4 space-y-1 text-sm text-ink/80">
            {result.explanation.map((line, i) => (
              <li key={i}>• {line}</li>
            ))}
          </ul>
        </div>
      )}

      {result && result.alternatives.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-slate">{tc('otherOptions')}</h3>
          <ul className="space-y-2">
            {result.alternatives.map((alt) => (
              <li
                key={alt.supermarketId}
                className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3"
              >
                <span>{supermarketName(alt.supermarketId)}</span>
                <span className="font-mono font-medium tabular-nums">€{alt.totalPrice.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result?.recommendation && (
        <div className="mt-8 border-t border-line pt-6">
          <button
            onClick={checkMultiStore}
            disabled={multiStoreLoading}
            className="text-sm text-leaf hover:underline disabled:opacity-50"
          >
            {multiStoreLoading ? tc('multiStoreCalculating') : tc('multiStoreQuestion')}
          </button>

          {multiStore && (
            <div
              className={`mt-3 rounded-2xl border p-5 ${
                multiStore.isWorthIt ? 'border-leaf bg-leaf-light' : 'border-line bg-white'
              }`}
            >
              {multiStore.isWorthIt ? (
                <>
                  <p className="font-medium text-leaf">
                    {tc('multiStoreYes', { amount: multiStore.netSavingsVsSingleStore.toFixed(2) })}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-ink/80">
                    {multiStore.plan.map((entry) => (
                      <li key={entry.supermarketId}>
                        {supermarketName(entry.supermarketId)}: {entry.productIds.length} {tc('products')}, €
                        {entry.subtotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate">
                    {tc('multiStoreTotal', {
                      total: multiStore.totalPrice.toFixed(2),
                      travel: multiStore.totalTravelCost.toFixed(2),
                      baseline: multiStore.singleStoreBaseline.totalPrice.toFixed(2),
                    })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink/70">{tc('multiStoreNo')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

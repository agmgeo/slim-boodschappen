'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  apiFetch,
  HealthierAlternative,
  HealthScoreResult,
  localizedProductName,
  NutritionInfo,
  Product,
} from '@/lib/api';

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-600',
  B: 'bg-lime-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  E: 'bg-red-600',
};

export default function ProductDetailPage() {
  const t = useTranslations('product');
  const locale = useLocale();
  const params = useParams();
  const productId = params.productId as string;
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreResult | null>(null);
  const [alternatives, setAlternatives] = useState<HealthierAlternative[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favAdded, setFavAdded] = useState(false);

  useEffect(() => {
    if (!productId) return;
    apiFetch<Product>(`/products/${productId}`).then(setProduct);
    apiFetch<NutritionInfo | null>(`/nutrition/${productId}`).then(setNutrition).catch(() => setNutrition(null));
    apiFetch<HealthScoreResult | null>(`/health-scoring/${productId}`)
      .then(setHealthScore)
      .catch(() => setHealthScore(null));
    apiFetch<HealthierAlternative[]>(`/health-scoring/${productId}/alternatives`)
      .then(setAlternatives)
      .catch(() => setAlternatives([]));
  }, [productId]);

  async function addFavorite() {
    if (!token || favLoading) return;
    setFavLoading(true);
    try {
      await apiFetch('/favorites', { method: 'POST', token, body: { productId } });
      setFavAdded(true);
    } finally {
      setFavLoading(false);
    }
  }

  if (!product) {
    return <main className="mx-auto max-w-2xl px-6 py-12 text-slate">{t('loading')}</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase text-slate">{product.category}</p>
          <h1 className="font-display text-2xl font-semibold text-leaf">{localizedProductName(product, locale)}</h1>
          <p className="text-sm text-slate">
            {product.brand ? `${product.brand} · ` : ''}
            {product.unit}
          </p>
        </div>
        {token && (
          <button
            onClick={addFavorite}
            disabled={favAdded || favLoading}
            className="rounded-full border border-leaf px-4 py-2 text-sm text-leaf hover:bg-leaf-light disabled:opacity-50"
          >
            {favAdded ? t('isFavorite') : t('makeFavorite')}
          </button>
        )}
      </div>

      {healthScore && (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white ${GRADE_COLORS[healthScore.grade]}`}
            >
              {healthScore.grade}
            </span>
            <div>
              <p className="font-medium">
                {t('healthScoreLabel')}: {healthScore.score}/100
              </p>
              <p className="text-xs text-slate">{t('healthScoreNote')}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1 text-sm">
            {healthScore.breakdown.map((entry, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-ink/70">{entry.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-slate">{entry.reason}</span>
                  <span className={entry.points >= 0 ? 'text-green-600' : 'text-red-500'}>
                    {entry.points >= 0 ? '+' : ''}
                    {entry.points}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nutrition && (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 font-medium">{t('nutritionTitle')}</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink/80">
            <Nutrient label={t('energy')} value={`${nutrition.energyKcal} kcal`} />
            <Nutrient label={t('fat')} value={`${nutrition.fat} g`} />
            <Nutrient label={t('saturatedFat')} value={`${nutrition.saturatedFat} g`} />
            <Nutrient label={t('carbohydrates')} value={`${nutrition.carbohydrates} g`} />
            <Nutrient label={t('sugars')} value={`${nutrition.sugars} g`} />
            <Nutrient label={t('fiber')} value={`${nutrition.fiber} g`} />
            <Nutrient label={t('protein')} value={`${nutrition.protein} g`} />
            <Nutrient label={t('salt')} value={`${nutrition.salt} g`} />
          </dl>
          {nutrition.allergens.length > 0 && (
            <p className="mt-3 text-xs text-amber-600">
              {t('allergens')}: {nutrition.allergens.join(', ')}
            </p>
          )}
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-medium">{t('healthierAlternatives')}</h2>
          <ul className="space-y-2">
            {alternatives.map((alt) => (
              <li key={alt.product.id}>
                <Link
                  href={`/products/${alt.product.id}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3 hover:border-leaf"
                >
                  <span>{localizedProductName(alt.product, locale)}</span>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${GRADE_COLORS[alt.healthScore.grade]}`}
                  >
                    {alt.healthScore.grade}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

function Nutrient({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-slate">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </>
  );
}

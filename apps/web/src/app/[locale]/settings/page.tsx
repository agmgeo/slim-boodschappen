'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, UserSettings } from '@/lib/api';

const TRAVEL_MODES: UserSettings['preferredTravelMode'][] = ['WALK', 'BIKE', 'CAR', 'PUBLIC_TRANSPORT'];

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  const t = useTranslations('settings');
  const { token } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const travelModeLabels: Record<UserSettings['preferredTravelMode'], string> = {
    WALK: t('travelModeWalk'),
    BIKE: t('travelModeBike'),
    CAR: t('travelModeCar'),
    PUBLIC_TRANSPORT: t('travelModePublicTransport'),
  };

  useEffect(() => {
    if (!token) return;
    apiFetch<UserSettings>('/settings', { token }).then(setSettings);
  }, [token]);

  async function save() {
    if (!token || !settings) return;
    const updated = await apiFetch<UserSettings>('/settings', {
      method: 'PATCH',
      token,
      body: {
        homeLatitude: settings.homeLatitude,
        homeLongitude: settings.homeLongitude,
        preferredTravelMode: settings.preferredTravelMode,
        maxExtraStores: settings.maxExtraStores,
        costPerKm: settings.costPerKm,
      },
    });
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function useMyLocation() {
    if (!settings) return;
    navigator.geolocation?.getCurrentPosition((pos) => {
      setSettings({ ...settings, homeLatitude: pos.coords.latitude, homeLongitude: pos.coords.longitude });
    });
  }

  if (!settings) {
    return <main className="mx-auto max-w-xl px-6 py-12 text-slate">{t('loading')}</main>;
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('title')}</h1>

      <div className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">{t('homeLocation')}</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder={t('latitude')}
              value={settings.homeLatitude ?? ''}
              onChange={(e) => setSettings({ ...settings, homeLatitude: parseFloat(e.target.value) })}
              className="w-1/2 rounded-lg border border-line px-3 py-2 focus:border-leaf focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder={t('longitude')}
              value={settings.homeLongitude ?? ''}
              onChange={(e) => setSettings({ ...settings, homeLongitude: parseFloat(e.target.value) })}
              className="w-1/2 rounded-lg border border-line px-3 py-2 focus:border-leaf focus:outline-none"
            />
          </div>
          <button onClick={useMyLocation} className="mt-2 text-sm text-leaf hover:underline">
            {t('useMyLocation')}
          </button>
          <p className="mt-1 text-xs text-slate">{t('homeLocationHint')}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">{t('travelMode')}</label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setSettings({ ...settings, preferredTravelMode: mode })}
                className={`rounded-full px-3 py-1 text-sm ${
                  settings.preferredTravelMode === mode ? 'bg-leaf text-white' : 'bg-slate-light text-ink/70'
                }`}
              >
                {travelModeLabels[mode]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">{t('costPerKm')}</label>
          <input
            type="number"
            step="0.01"
            value={settings.costPerKm}
            onChange={(e) => setSettings({ ...settings, costPerKm: parseFloat(e.target.value) })}
            className="w-32 rounded-lg border border-line px-3 py-2 focus:border-leaf focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">{t('maxExtraStores')}</label>
          <input
            type="number"
            min={0}
            max={3}
            value={settings.maxExtraStores}
            onChange={(e) => setSettings({ ...settings, maxExtraStores: parseInt(e.target.value, 10) })}
            className="w-24 rounded-lg border border-line px-3 py-2 focus:border-leaf focus:outline-none"
          />
        </div>

        <button onClick={save} className="rounded-lg bg-leaf px-6 py-2 text-white hover:opacity-90">
          {t('save')}
        </button>
        {saved && <span className="ml-3 text-sm text-leaf">{t('saved')}</span>}
      </div>
    </main>
  );
}

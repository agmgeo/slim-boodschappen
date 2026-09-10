'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/shopping-list');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 font-display text-2xl font-semibold text-leaf">{t('login')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-line px-4 py-2 focus:border-leaf focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-leaf px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {t('login')}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate">
        <Link href="/register" className="text-leaf hover:underline">
          {t('register')}
        </Link>
      </p>
    </main>
  );
}

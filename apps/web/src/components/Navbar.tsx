'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const { user, logout } = useAuth();
  const params = useParams();
  const currentLocale = (params.locale as string) ?? routing.defaultLocale;
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/shopping-list', label: t('shoppingList') },
    { href: '/pantry', label: t('pantry') },
    { href: '/products', label: t('products') },
    { href: '/supermarkets', label: t('supermarkets') },
    { href: '/scan', label: t('scan') },
    { href: '/favorites', label: t('favorites') },
    { href: '/settings', label: t('settings') },
  ];

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-semibold text-leaf" onClick={() => setMenuOpen(false)}>
          Slim Boodschappen
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm text-ink/80 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-leaf">
              {link.label}
            </Link>
          ))}

          <div className="flex gap-2 border-l border-line pl-4 text-slate">
            {routing.locales.map((locale) => (
              <Link
                key={locale}
                href="/"
                locale={locale}
                className={`text-xs uppercase tracking-wide ${
                  locale === currentLocale ? 'font-semibold text-leaf' : 'hover:text-leaf'
                }`}
              >
                {locale}
              </Link>
            ))}
          </div>

          {user ? (
            <button onClick={logout} className="text-slate hover:text-sticker">
              {user.email.split('@')[0]} ⏻
            </button>
          ) : (
            <Link href="/login" className="rounded-full bg-leaf px-4 py-1.5 text-white hover:bg-leaf-dark">
              {tAuth('login')}
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Sluit menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink md:hidden"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <nav className="border-t border-line bg-paper px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2 text-ink hover:bg-leaf-light hover:text-leaf"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <div className="flex gap-3 text-sm text-slate">
              {routing.locales.map((locale) => (
                <Link
                  key={locale}
                  href="/"
                  locale={locale}
                  onClick={() => setMenuOpen(false)}
                  className={`uppercase ${locale === currentLocale ? 'font-semibold text-leaf' : ''}`}
                >
                  {locale}
                </Link>
              ))}
            </div>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-sm text-slate hover:text-sticker"
              >
                {user.email.split('@')[0]} ⏻
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-leaf px-4 py-1.5 text-sm text-white"
              >
                {tAuth('login')}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

import { defineRouting } from 'next-intl/routing';

// Ondersteunde talen: NL is standaard, EN vanaf dag 1 mee.
// Later uitbreiden met DE/PL/TR/FR/ES = alleen deze array + een messages/xx.json toevoegen.
export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
});

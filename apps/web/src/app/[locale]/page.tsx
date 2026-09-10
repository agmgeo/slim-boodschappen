import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-8">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            {t('app.tagline')}
          </h1>
          <p className="mt-4 max-w-sm text-ink/70">
            {t('app.title')} rekent je boodschappenlijst na bij elke supermarkt — inclusief aanbiedingen, reisafstand
            en gezondere alternatieven — en zegt je gewoon waar je vandaag moet zijn.
          </p>
          <Link
            href="/shopping-list"
            className="mt-6 inline-block rounded-full bg-leaf px-6 py-3 font-medium text-white hover:bg-leaf-dark"
          >
            {t('shoppingList.title')}
          </Link>
        </div>

        <ReceiptPreview />
      </div>
    </main>
  );
}

/**
 * Het bonnetje-motief: het ene gedurfde visuele idee op deze pagina, gebruikt
 * op precies één plek. Toont een echt (voorbeeld)resultaat in plaats van
 * lege marketingtekst — zo zie je meteen wat de app doet.
 */
function ReceiptPreview() {
  const items = [
    { name: 'Halfvolle melk', ah: 1.49, jumbo: 1.29 },
    { name: 'Bruin brood', ah: 2.19, jumbo: 2.15 },
    { name: 'Jong belegen kaas', ah: 5.49, jumbo: 4.99 },
  ];
  const totalAh = items.reduce((sum, i) => sum + i.ah, 0);
  const totalJumbo = items.reduce((sum, i) => sum + i.jumbo, 0);
  const savings = totalAh - totalJumbo;

  return (
    <div className="mx-auto w-full max-w-xs">
      <div
        className="border border-line bg-white p-5 shadow-sm"
        style={{
          clipPath:
            'polygon(0% 2%, 4% 0%, 8% 2%, 12% 0%, 16% 2%, 20% 0%, 24% 2%, 28% 0%, 32% 2%, 36% 0%, 40% 2%, 44% 0%, 48% 2%, 52% 0%, 56% 2%, 60% 0%, 64% 2%, 68% 0%, 72% 2%, 76% 0%, 80% 2%, 84% 0%, 88% 2%, 92% 0%, 96% 2%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        <p className="text-xs uppercase tracking-wide text-slate">Voorbeeld · vandaag</p>
        <ul className="mt-3 divide-y divide-line font-mono text-sm">
          {items.map((item) => (
            <li key={item.name} className="flex items-baseline justify-between py-1.5">
              <span className="font-sans text-ink/80">{item.name}</span>
              <span className="tabular-nums text-ink">€{item.jumbo.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-line pt-2 font-mono text-base font-semibold">
          <span className="font-sans font-semibold text-ink">Jumbo — totaal</span>
          <span className="tabular-nums text-leaf">€{totalJumbo.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-sticker-light px-3 py-2 text-sm">
          <span className="text-ink/80">t.o.v. Albert Heijn (€{totalAh.toFixed(2)})</span>
          <span className="font-mono font-semibold text-sticker">bespaar €{savings.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

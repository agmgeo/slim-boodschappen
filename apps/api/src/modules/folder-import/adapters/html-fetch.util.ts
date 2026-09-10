/**
 * Gedeelde HTTP-fetch + HTML-naar-platte-tekst-conversie, herbruikt door alle
 * supermarkt-adapters. Bewust eenvoudig (geen volwaardige DOM-parser): tags
 * eruit, entities decoderen, whitespace normaliseren — genoeg om de leesbare
 * aanbiedingstekst eruit te halen, zoals een browser 'm ook zou tonen.
 */
export async function fetchAndExtractText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      // Een eerlijke, herkenbare user-agent i.p.v. je voordoen als een browser.
      'User-Agent': 'SlimBoodschappenBot/1.0 (+contact: instellingen-pagina)',
    },
  });
  if (!res.ok) {
    throw new Error(`Kon ${url} niet ophalen (status ${res.status}).`);
  }
  const html = await res.text();
  return htmlToReadableText(html);
}

export function htmlToReadableText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|article|span)>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&euro;/gi, '€')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

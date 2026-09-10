export interface MatchCandidate {
  productId: string;
  names: string[]; // canonieke naam + aliassen, al genormaliseerd of niet
}

export interface MatchResult {
  productId: string | null;
  confidence: number; // 0-1
  method: 'EXACT' | 'ALIAS' | 'FUZZY' | 'UNMATCHED';
  matchedOn?: string;
}

// Confidence onder deze grens wordt als "onvoldoende" beschouwd; de aanroeper
// (ProductMatchingService) kan dit gebruiken om te beslissen of een AI-fallback
// (natuurlijke-taal interpretatie) nodig is. De engine zelf doet geen AI-call.
export const FUZZY_CONFIDENCE_THRESHOLD = 0.72;

/**
 * Normaliseert vrije tekst: lowercase, verwijdert leidende aantallen ("2x"),
 * overbodige leestekens en meervoudige spaties. Geen AI: pure string-regels.
 */
export function normalizeProductText(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^\d+\s*[xX]\s*/, '') // "2x melk" -> "melk"
    .replace(/[.,;!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matcht genormaliseerde tekst tegen een lijst kandidaat-producten
 * (elk met hun canonieke naam + eventuele aliassen).
 * Volgorde: exact match -> alias match -> fuzzy match (Levenshtein-afstand).
 */
export function matchProduct(rawText: string, candidates: MatchCandidate[]): MatchResult {
  const normalizedInput = normalizeProductText(rawText);
  if (!normalizedInput) {
    return { productId: null, confidence: 0, method: 'UNMATCHED' };
  }

  // 1) Exacte match
  for (const candidate of candidates) {
    for (const name of candidate.names) {
      if (normalizeProductText(name) === normalizedInput) {
        return { productId: candidate.productId, confidence: 1, method: 'EXACT', matchedOn: name };
      }
    }
  }

  // 2) Fuzzy match op basis van genormaliseerde Levenshtein-afstand
  let best: { candidate: MatchCandidate; name: string; score: number } | null = null;
  for (const candidate of candidates) {
    for (const name of candidate.names) {
      const score = similarity(normalizedInput, normalizeProductText(name));
      if (!best || score > best.score) {
        best = { candidate, name, score };
      }
    }
  }

  if (best && best.score >= FUZZY_CONFIDENCE_THRESHOLD) {
    return {
      productId: best.candidate.productId,
      confidence: round2(best.score),
      method: 'FUZZY',
      matchedOn: best.name,
    };
  }

  return { productId: null, confidence: best ? round2(best.score) : 0, method: 'UNMATCHED' };
}

/** Levenshtein-afstand tussen twee strings. */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // verwijderen
        matrix[i][j - 1] + 1, // invoegen
        matrix[i - 1][j - 1] + cost, // vervangen
      );
    }
  }

  return matrix[a.length][b.length];
}

/** Similariteit 0-1, gebaseerd op Levenshtein-afstand genormaliseerd op de langste string. */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

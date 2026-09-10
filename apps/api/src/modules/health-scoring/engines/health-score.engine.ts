import { HealthGrade, HealthScoreResult, NutritionInfo } from '@app/shared';

/**
 * Transparante, regelgebaseerde gezondheidsscore (géén AI/black box).
 * Iedere factor levert een puntenaantal MET reden op (`breakdown`), zodat de
 * gebruiker exact kan zien waarom een product een bepaalde score krijgt.
 *
 * Methode (per 100g), losjes gebaseerd op de publiek bekende Nutri-Score-
 * principes maar met eigen, transparante drempelwaarden:
 *  - Negatieve factoren (max 10 punten elk): energie, verzadigd vet, suikers, zout
 *  - Positieve factoren (max 5 punten elk): vezels, eiwitten
 *  - Score = 100 - (negatief * 2.5) + (positief * 2.5), geclipt 0-100
 */
export function calculateHealthScore(nutrition: NutritionInfo['per100g']): HealthScoreResult {
  const breakdown: HealthScoreResult['breakdown'] = [];

  const energyPoints = tieredPoints(nutrition.energyKcal, [80, 160, 240, 320, 400], 'energie');
  breakdown.push({
    label: 'Energie',
    points: -energyPoints,
    reason: `${nutrition.energyKcal} kcal/100g`,
  });

  const satFatPoints = tieredPoints(nutrition.saturatedFat, [1, 2, 4, 6, 10], 'verzadigd vet');
  breakdown.push({
    label: 'Verzadigd vet',
    points: -satFatPoints,
    reason: `${nutrition.saturatedFat} g/100g`,
  });

  const sugarPoints = tieredPoints(nutrition.sugars, [4.5, 9, 13.5, 22.5, 45], 'suikers');
  breakdown.push({
    label: 'Suikers',
    points: -sugarPoints,
    reason: `${nutrition.sugars} g/100g`,
  });

  const saltPoints = tieredPoints(nutrition.salt, [0.3, 0.6, 1.0, 1.5, 2.2], 'zout');
  breakdown.push({
    label: 'Zout',
    points: -saltPoints,
    reason: `${nutrition.salt} g/100g`,
  });

  const fiberPoints = tieredPoints(nutrition.fiber, [0.9, 1.9, 2.8, 3.7, 4.7], 'vezels', true);
  breakdown.push({
    label: 'Vezels',
    points: fiberPoints,
    reason: `${nutrition.fiber} g/100g (positief)`,
  });

  const proteinPoints = tieredPoints(nutrition.protein, [1.6, 3.2, 4.8, 6.4, 8], 'eiwitten', true);
  breakdown.push({
    label: 'Eiwitten',
    points: proteinPoints,
    reason: `${nutrition.protein} g/100g (positief)`,
  });

  const negativeTotal = energyPoints + satFatPoints + sugarPoints + saltPoints; // 0-40
  const positiveTotal = fiberPoints + proteinPoints; // 0-10

  const rawScore = 100 - negativeTotal * 2.5 + positiveTotal * 2.5;
  const score = clamp(Math.round(rawScore), 0, 100);

  return { grade: scoreToGrade(score), score, breakdown };
}

function tieredPoints(value: number, thresholds: number[], _label: string, positive = false): number {
  // Voor negatieve factoren: elk overschreden drempel = +2 punten (max 10 over 5 drempels).
  // Voor positieve factoren: elk gehaalde drempel = +1 punt (max 5 over 5 drempels).
  const step = positive ? 1 : 2;
  let points = 0;
  for (const threshold of thresholds) {
    if (value >= threshold) points += step;
  }
  return points;
}

function scoreToGrade(score: number): HealthGrade {
  if (score >= 80) return HealthGrade.A;
  if (score >= 60) return HealthGrade.B;
  if (score >= 40) return HealthGrade.C;
  if (score >= 20) return HealthGrade.D;
  return HealthGrade.E;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

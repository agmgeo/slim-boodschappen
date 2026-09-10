import { HealthGrade } from '@app/shared';
import { calculateHealthScore } from './health-score.engine';

describe('HealthScoreEngine', () => {
  it('geeft een hoge score (A) aan groente-achtige waarden', () => {
    const result = calculateHealthScore({
      energyKcal: 25,
      fat: 0.2,
      saturatedFat: 0,
      carbohydrates: 4,
      sugars: 2,
      fiber: 3,
      protein: 2,
      salt: 0.05,
    });
    expect(result.grade).toBe(HealthGrade.A);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('geeft een lage score (D of E) aan sterk bewerkte snacks', () => {
    const result = calculateHealthScore({
      energyKcal: 520,
      fat: 30,
      saturatedFat: 14,
      carbohydrates: 55,
      sugars: 48,
      fiber: 1,
      protein: 4,
      salt: 2.5,
    });
    expect([HealthGrade.D, HealthGrade.E]).toContain(result.grade);
    expect(result.score).toBeLessThan(40);
  });

  it('bevat een transparante breakdown met een reden per factor', () => {
    const result = calculateHealthScore({
      energyKcal: 200,
      fat: 5,
      saturatedFat: 2,
      carbohydrates: 20,
      sugars: 10,
      fiber: 2,
      protein: 5,
      salt: 0.5,
    });
    expect(result.breakdown.length).toBe(6);
    result.breakdown.forEach((entry) => {
      expect(entry.reason).toBeTruthy();
      expect(typeof entry.points).toBe('number');
    });
  });

  it('score blijft altijd tussen 0 en 100', () => {
    const worst = calculateHealthScore({
      energyKcal: 900,
      fat: 60,
      saturatedFat: 40,
      carbohydrates: 90,
      sugars: 90,
      fiber: 0,
      protein: 0,
      salt: 5,
    });
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(100);
  });
});

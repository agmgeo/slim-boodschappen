import { TravelMode } from '@app/shared';
import { calculateDistanceKm, calculateTravelCost } from './travel-cost.engine';

describe('TravelCostEngine', () => {
  // Amsterdam Centraal -> Utrecht Centraal, bekende afstand ~ 35-36 km hemelsbreed
  const amsterdam = { latitude: 52.3791, longitude: 4.9003 };
  const utrecht = { latitude: 52.0894, longitude: 5.1101 };

  it('berekent een realistische hemelsbrede afstand', () => {
    const distance = calculateDistanceKm(amsterdam, utrecht);
    expect(distance).toBeGreaterThan(30);
    expect(distance).toBeLessThan(40);
  });

  it('geeft 0 afstand voor gelijke punten', () => {
    expect(calculateDistanceKm(amsterdam, amsterdam)).toBe(0);
  });

  it('berekent reiskosten voor de auto op basis van costPerKm', () => {
    const result = calculateTravelCost(amsterdam, utrecht, TravelMode.CAR, 0.23);
    expect(result.distanceKm).toBeCloseTo(calculateDistanceKm(amsterdam, utrecht) * 2, 1);
    expect(result.estimatedTravelCost).toBeCloseTo(result.distanceKm * 0.23, 1);
    expect(result.estimatedTravelTimeMinutes).toBeGreaterThan(0);
  });

  it('rekent geen kosten voor lopen of fietsen', () => {
    const walk = calculateTravelCost(amsterdam, utrecht, TravelMode.WALK, 0.23);
    const bike = calculateTravelCost(amsterdam, utrecht, TravelMode.BIKE, 0.23);
    expect(walk.estimatedTravelCost).toBe(0);
    expect(bike.estimatedTravelCost).toBe(0);
  });

  it('lopen duurt langer dan de auto over dezelfde afstand', () => {
    const walk = calculateTravelCost(amsterdam, utrecht, TravelMode.WALK, 0.23);
    const car = calculateTravelCost(amsterdam, utrecht, TravelMode.CAR, 0.23);
    expect(walk.estimatedTravelTimeMinutes).toBeGreaterThan(car.estimatedTravelTimeMinutes);
  });
});

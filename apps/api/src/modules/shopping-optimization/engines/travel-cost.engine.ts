import { TravelCostResult, TravelMode } from '@app/shared';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

// Gemiddelde snelheid per vervoersmiddel, gebruikt om reistijd te schatten.
const AVERAGE_SPEED_KMH: Record<TravelMode, number> = {
  [TravelMode.WALK]: 5,
  [TravelMode.BIKE]: 15,
  [TravelMode.CAR]: 35, // stadsverkeer-gemiddelde
  [TravelMode.PUBLIC_TRANSPORT]: 20,
};

/**
 * Haversine-formule: hemelsbrede afstand in km tussen twee coördinaten.
 * Voor een boodschappen-app is dit een goede, snelle benadering
 * (geen dure/afhankelijke routing-API nodig voor de basis).
 */
export function calculateDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return round2(EARTH_RADIUS_KM * c);
}

/**
 * Reiskosten en -tijd voor een retourtje (heen + terug) naar een winkel.
 * `costPerKm` komt uit de gebruikersinstellingen (UserSettings.costPerKm).
 */
export function calculateTravelCost(
  from: GeoPoint,
  to: GeoPoint,
  travelMode: TravelMode,
  costPerKm: number,
): TravelCostResult {
  const oneWayDistance = calculateDistanceKm(from, to);
  const roundTripDistance = round2(oneWayDistance * 2);
  const speed = AVERAGE_SPEED_KMH[travelMode];
  const travelTimeMinutes = Math.round((roundTripDistance / speed) * 60);
  const cost = travelMode === TravelMode.WALK || travelMode === TravelMode.BIKE ? 0 : round2(roundTripDistance * costPerKm);

  return {
    distanceKm: roundTripDistance,
    estimatedTravelTimeMinutes: travelTimeMinutes,
    estimatedTravelCost: cost,
    travelMode,
  };
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

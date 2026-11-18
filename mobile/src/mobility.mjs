import { flattenArrivals } from '../../public/previsoes.js';

export { flattenArrivals };

function distanceMeters(origin, stop) {
  if (!Number.isFinite(stop.py) || !Number.isFinite(stop.px)) return null;
  const radians = Math.PI / 180;
  const latitude = (stop.py - origin.latitude) * radians;
  const longitude = (stop.px - origin.longitude) * radians;
  const a = Math.sin(latitude / 2) ** 2
    + Math.cos(origin.latitude * radians) * Math.cos(stop.py * radians)
    * Math.sin(longitude / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function rankStops(stops, position) {
  const results = stops.map(stop => ({
    ...stop,
    distance: position ? distanceMeters(position, stop) : null
  }));
  return results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}

export function distanceLabel(meters) {
  if (meters === null) return '';
  if (meters < 1000) return `${Math.round(meters)} m em linha reta`;
  return `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km em linha reta`;
}

export function qualifyingArrival(arrivals, reminder) {
  return arrivals.find(arrival => arrival.line === reminder.line
    && arrival.destination === reminder.destination
    && arrival.minutes <= reminder.minutes);
}

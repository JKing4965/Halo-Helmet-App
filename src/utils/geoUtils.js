import { RESORTS } from './resortData';

// Radius of the earth in km
const R = 6371; 

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Calculate distance between two points in km
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const findNearestResort = (lat, lng, thresholdKm = 10) => {
  let nearest = null;
  let minDistance = Infinity;

  RESORTS.forEach(resort => {
    const dist = getDistanceFromLatLonInKm(lat, lng, resort.lat, resort.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = resort;
    }
  });

  if (minDistance <= thresholdKm) {
    return nearest;
  }
  return null;
};
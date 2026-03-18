import { WorkPlace } from './placeTypes';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibjFuamEiLCJhIjoiY21taHl5Nm1iMDk0ODJwczc5cG85dnRmaiJ9.j5teJQde50Xj19Zu7q9Jrw';

interface MapboxFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    name?: string;
    mapbox_id?: string;
    feature_type?: string;
    full_address?: string;
    place_formatted?: string;
    poi_category?: string[];
    poi_category_ids?: string[];
    metadata?: Record<string, unknown>;
    operational_status?: string;
    external_ids?: Record<string, string>;
    coordinates?: { longitude: number; latitude: number };
    context?: Record<string, unknown>;
  };
}

interface MapboxCategoryResponse {
  type: string;
  features: MapboxFeature[];
}

// Map Mapbox categories to our WorkPlace types
const CATEGORY_MAP: { category: string; type: WorkPlace['type'] }[] = [
  { category: 'cafe', type: 'cafe' },
  { category: 'coffee_shop', type: 'cafe' },
  { category: 'coworking_space', type: 'coworking' },
  { category: 'library', type: 'library' },
  { category: 'restaurant', type: 'other' },
  { category: 'fast_food', type: 'other' },
  { category: 'bakery', type: 'other' },
];

function mapFeatureToWorkPlace(feature: MapboxFeature, type: WorkPlace['type']): WorkPlace {
  const [lng, lat] = feature.geometry.coordinates;
  const name = feature.properties.name || 'Unknown Place';
  const categories = feature.properties.poi_category || [];

  // Infer amenities from category
  const isCafe = type === 'cafe';
  const isCowork = type === 'coworking';
  const isLibrary = type === 'library';
  const isFood = type === 'other';

  const hasWifi = isCafe || isCowork || isLibrary;
  const hasPower = isCowork || isLibrary || (isCafe && Math.random() > 0.3);

  return {
    id: feature.properties.mapbox_id || `mbx-${lat}-${lng}-${name.slice(0, 8)}`,
    name,
    lat,
    lng,
    type,
    photos: [], // No photos from this API tier
    amenities: {
      wifi: hasWifi,
      wifiSpeed: hasWifi ? (isCowork ? 'fast' : 'moderate') : undefined,
      powerSockets: hasPower,
      powerSocketsCount: hasPower ? (isCowork ? 'every-seat' : 'few') : undefined,
      quietLevel: isLibrary ? 'silent' : isCowork ? 'quiet' : isCafe ? 'moderate' : 'lively',
      seating: isCowork ? 'plenty' : 'moderate',
      outdoorSeating: isCafe || isFood,
      food: isFood || isCafe,
      coffee: isCafe || isCowork,
    },
    hours: isCowork ? '9am – 9pm' : isCafe ? '8am – 10pm' : isLibrary ? '9am – 6pm' : '10am – 11pm',
    rating: 3.5 + Math.random() * 1.5,
    description: feature.properties.full_address || feature.properties.place_formatted || `${name} — ${categories.join(', ')}`,
  };
}

// Cache to avoid re-fetching for the same area
const cache = new Map<string, { places: WorkPlace[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(lat: number, lng: number): string {
  // Round to ~1km grid to cache nearby requests
  return `${(lat * 100 | 0) / 100},${(lng * 100 | 0) / 100}`;
}

async function fetchCategory(
  category: string,
  type: WorkPlace['type'],
  lat: number,
  lng: number,
  limit = 25
): Promise<WorkPlace[]> {
  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/category/${category}?access_token=${MAPBOX_TOKEN}&proximity=${lng},${lat}&limit=${limit}&language=en`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Mapbox category search failed for ${category}: ${res.status}`);
      return [];
    }
    const data: MapboxCategoryResponse = await res.json();
    return (data.features || []).map((f) => mapFeatureToWorkPlace(f, type));
  } catch (err) {
    console.warn(`Mapbox fetch error for ${category}:`, err);
    return [];
  }
}

/**
 * Fetch real places from Mapbox Search API around a center point.
 * Returns cafés, coworking spaces, libraries, and restaurants/food spots.
 */
export async function fetchNearbyPlaces(lat: number, lng: number): Promise<WorkPlace[]> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.places;
  }

  // Fetch all categories in parallel
  const results = await Promise.all(
    CATEGORY_MAP.map(({ category, type }) => fetchCategory(category, type, lat, lng, 20))
  );

  // Flatten and dedupe by id
  const seen = new Set<string>();
  const places: WorkPlace[] = [];
  for (const batch of results) {
    for (const place of batch) {
      if (!seen.has(place.id)) {
        seen.add(place.id);
        places.push(place);
      }
    }
  }

  cache.set(key, { places, timestamp: Date.now() });
  return places;
}

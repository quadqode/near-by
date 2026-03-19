import { WorkPlace } from './placeTypes';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibjFuamEiLCJhIjoiY21taHl5Nm1iMDk0ODJwczc5cG85dnRmaiJ9.j5teJQde50Xj19Zu7q9Jrw';

// Delhi bounding box
const DELHI_BBOX = '76.84,28.40,77.35,28.88';

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

// Photo URLs by place type using Unsplash source (deterministic by name hash)
const PLACE_PHOTOS: Record<WorkPlace['type'], string[]> = {
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop',
  ],
  coworking: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
  ],
  library: [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
  ],
  other: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop',
  ],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPhotosForPlace(name: string, type: WorkPlace['type']): string[] {
  const pool = PLACE_PHOTOS[type];
  const hash = hashString(name);
  const startIdx = hash % pool.length;
  // Pick 2-3 photos deterministically
  const count = 2 + (hash % 2);
  const photos: string[] = [];
  for (let i = 0; i < count; i++) {
    photos.push(pool[(startIdx + i) % pool.length]);
  }
  return photos;
}

function mapFeatureToWorkPlace(feature: MapboxFeature, type: WorkPlace['type']): WorkPlace {
  const [lng, lat] = feature.geometry.coordinates;
  const name = feature.properties.name || 'Unknown Place';
  const categories = feature.properties.poi_category || [];

  const isCafe = type === 'cafe';
  const isCowork = type === 'coworking';
  const isLibrary = type === 'library';
  const isFood = type === 'other';

  const hasWifi = isCafe || isCowork || isLibrary;
  const nameHash = hashString(name);
  const hasPower = isCowork || isLibrary || (isCafe && (nameHash % 10) > 3);

  return {
    id: feature.properties.mapbox_id || `mbx-${lat}-${lng}-${name.slice(0, 8)}`,
    name,
    lat,
    lng,
    type,
    photos: getPhotosForPlace(name, type),
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
    rating: Math.round((3.5 + (nameHash % 15) / 10) * 10) / 10,
    description: feature.properties.full_address || feature.properties.place_formatted || `${name} — ${categories.join(', ')}`,
  };
}

// Cache to avoid re-fetching for the same area
const cache = new Map<string, { places: WorkPlace[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function cacheKey(lat: number, lng: number): string {
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
    const url = `https://api.mapbox.com/search/searchbox/v1/category/${category}?access_token=${MAPBOX_TOKEN}&proximity=${lng},${lat}&bbox=${DELHI_BBOX}&limit=${limit}&language=en`;
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
 * Restricted to Delhi region.
 */
export async function fetchNearbyPlaces(lat: number, lng: number): Promise<WorkPlace[]> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.places;
  }

  const results = await Promise.all(
    CATEGORY_MAP.map(({ category, type }) => fetchCategory(category, type, lat, lng, 20))
  );

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

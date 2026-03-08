export interface WorkPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'cafe' | 'coworking' | 'library' | 'other';
  photos: string[]; // imported image paths
  amenities: {
    wifi: boolean;
    wifiSpeed?: 'fast' | 'moderate' | 'slow';
    powerSockets: boolean;
    powerSocketsCount?: 'few' | 'many' | 'every-seat';
    quietLevel: 'silent' | 'quiet' | 'moderate' | 'lively';
    seating: 'limited' | 'moderate' | 'plenty';
    outdoorSeating: boolean;
    food: boolean;
    coffee: boolean;
  };
  hours: string; // e.g. "7am – 10pm"
  rating: number; // 1-5
  description: string;
}

export const PLACE_TYPE_META: Record<WorkPlace['type'], { label: string; emoji: string; color: string }> = {
  cafe: { label: 'Café', emoji: '☕', color: 'var(--pin-writer)' },
  coworking: { label: 'Coworking', emoji: '🏢', color: 'var(--pin-developer)' },
  library: { label: 'Library', emoji: '📚', color: 'var(--pin-designer)' },
  other: { label: 'Other', emoji: '📍', color: 'var(--pin-other)' },
};

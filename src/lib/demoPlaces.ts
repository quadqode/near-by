import { WorkPlace } from './placeTypes';
import cafe1 from '@/assets/cafe-1.jpg';
import cafe2 from '@/assets/cafe-2.jpg';
import cafe3 from '@/assets/cafe-3.jpg';
import cafe4 from '@/assets/cafe-4.jpg';
import cafe5 from '@/assets/cafe-5.jpg';
import cafe6 from '@/assets/cafe-6.jpg';

const PLACE_TEMPLATES: Omit<WorkPlace, 'id' | 'lat' | 'lng'>[] = [
  {
    name: 'The Grind House',
    type: 'cafe',
    photos: [cafe1, cafe3],
    amenities: { wifi: true, wifiSpeed: 'fast', powerSockets: true, powerSocketsCount: 'every-seat', quietLevel: 'moderate', seating: 'plenty', outdoorSeating: false, food: true, coffee: true },
    hours: '7am – 9pm',
    rating: 4.5,
    description: 'A cozy brick-walled café perfect for deep work. Great espresso, reliable WiFi, and power outlets at every seat.',
  },
  {
    name: 'Bloom & Brew',
    type: 'cafe',
    photos: [cafe2, cafe5],
    amenities: { wifi: true, wifiSpeed: 'fast', powerSockets: true, powerSocketsCount: 'many', quietLevel: 'quiet', seating: 'moderate', outdoorSeating: true, food: true, coffee: true },
    hours: '6:30am – 8pm',
    rating: 4.7,
    description: 'Minimalist café with gorgeous natural light and a sunny terrace. Plant lovers and remote workers alike adore this spot.',
  },
  {
    name: 'Chapter & Verse',
    type: 'cafe',
    photos: [cafe3, cafe6],
    amenities: { wifi: true, wifiSpeed: 'moderate', powerSockets: true, powerSocketsCount: 'few', quietLevel: 'quiet', seating: 'moderate', outdoorSeating: false, food: true, coffee: true },
    hours: '8am – 10pm',
    rating: 4.3,
    description: 'A bohemian book-café with cozy nooks, vintage furniture, and an eclectic library. Great for writers and thinkers.',
  },
  {
    name: 'Forge & Flow',
    type: 'coworking',
    photos: [cafe4, cafe1],
    amenities: { wifi: true, wifiSpeed: 'fast', powerSockets: true, powerSocketsCount: 'every-seat', quietLevel: 'moderate', seating: 'plenty', outdoorSeating: false, food: false, coffee: true },
    hours: '6am – 11pm',
    rating: 4.6,
    description: 'Industrial-chic coworking café with communal tables, fast WiFi, and all-day drip coffee. Built for makers.',
  },
  {
    name: 'Sky Deck Coffee',
    type: 'cafe',
    photos: [cafe5, cafe2],
    amenities: { wifi: true, wifiSpeed: 'moderate', powerSockets: true, powerSocketsCount: 'few', quietLevel: 'lively', seating: 'limited', outdoorSeating: true, food: true, coffee: true },
    hours: '9am – 7pm',
    rating: 4.4,
    description: 'Rooftop café with stunning city views. Perfect for creative brainstorms and fresh-air focus sessions.',
  },
  {
    name: 'Zen Den',
    type: 'cafe',
    photos: [cafe6, cafe3],
    amenities: { wifi: true, wifiSpeed: 'fast', powerSockets: true, powerSocketsCount: 'many', quietLevel: 'silent', seating: 'moderate', outdoorSeating: false, food: true, coffee: true },
    hours: '7am – 8pm',
    rating: 4.8,
    description: 'A serene Japanese-inspired café focused on deep concentration. Matcha, silence, and beautiful wood interiors.',
  },
];

function offsetDeg(kmRange: number): number {
  const km = (Math.random() - 0.5) * 2 * kmRange;
  return km / 111.32;
}

export function generateDemoPlaces(centerLat = 40.7128, centerLng = -74.006): WorkPlace[] {
  return PLACE_TEMPLATES.map((tpl, i) => ({
    ...tpl,
    id: `place-${i}`,
    lat: centerLat + offsetDeg(2.5),
    lng: centerLng + offsetDeg(2.5) / Math.cos(centerLat * Math.PI / 180),
  }));
}

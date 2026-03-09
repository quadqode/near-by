import { WorkPlace } from './placeTypes';
import cafe1 from '@/assets/cafe-1.jpg';
import cafe2 from '@/assets/cafe-2.jpg';
import cafe3 from '@/assets/cafe-3.jpg';
import cafe4 from '@/assets/cafe-4.jpg';
import cafe5 from '@/assets/cafe-5.jpg';
import cafe6 from '@/assets/cafe-6.jpg';

const PHOTOS = [cafe1, cafe2, cafe3, cafe4, cafe5, cafe6];

type PlaceType = WorkPlace['type'];

const CAFE_NAMES = [
  'The Paris Coffeehouse', 'Libertario Coffee Roasters', 'Getafix Cafe', 'The Big Chill Cafe', 'DIGGIN',
  'Delish Mama Gelato & Cafe', 'Blue Tokai Coffee', 'Third Wave Coffee', 'Sleepy Owl Cafe', 'Café Diem',
  'Roast & Brew', 'Bean There Café', 'The Grind House', 'Percolate Coffee', 'Sip & Work Café',
  'Craft Coffee Co.', 'The Latte Lounge', 'Drip Drop Café', 'Morning Ritual Coffee', 'The Daily Grind',
  'Espresso Lab', 'Filter Stories', 'Brew & Bake', 'Cuppa Joe\'s', 'The Coffee Collective',
  'Artisan Brew House', 'Steam & Pour', 'The Roasting Plant', 'Café Nomad', 'Work & Sip',
  'Mono Coffee', 'Origin Roasters', 'The Pourover Place', 'Caffeine Hub', 'Press Coffee Bar',
  'Brew Culture', 'The Coffee Desk', 'Commune Café', 'Local Brew Co.', 'The Bean Counter',
  'Nordic Coffee House', 'Flat White Café', 'Ritual Roasters', 'Harvest Coffee', 'The Lab Café',
  'Chapter One Coffee', 'Paragraph Café', 'Footnote Coffee', 'The Margin Café', 'Syntax Café',
];

const COWORK_NAMES = [
  'WeWork Hub', 'Innov8 Coworking', '91springboard', 'CoWrks Premium', 'The Hive Workspace',
  'Awfis Space', 'Regus Business Centre', 'Smartworks Office', 'Workenstein', 'The Office Pass',
  'Hustlr Co.', 'Launchpad Cowork', 'Desk & Dock', 'Open House Cowork', 'The Collective Space',
  'Maker\'s Loft', 'GridWork', 'NexGen Workspace', 'FlexDesk Hub', 'The Commons',
  'Pioneer Workspace', 'Catalyst Cowork', 'Synapse Hub', 'Basecamp Office', 'The Garage Cowork',
];

const LIBRARY_NAMES = [
  'Central Public Library', 'The Reading Room', 'Knowledge Hub Library', 'City Reference Library',
  'The Book Nook', 'Scholars\' Den', 'The Quiet Corner', 'Heritage Library', 'Digital Library Hub',
  'The Archive Space',
];

const FOOD_NAMES = [
  'Paparizza Trattoria & Bar', 'Si Nonna\'s Sourdough Pizza', 'Sindh Dhaba', 'Baba Nagpal Corner',
  'Defence Bakery Since 1962', 'Hashery GK2', 'THEOS GK II', 'Sanjha Chulha', 'Moolchand Parantha',
  'The Bowl Company', 'Spice Route Kitchen', 'Tandoori Nights', 'The Naan Stop', 'Curry Leaf Bistro',
  'Wok This Way', 'Pho Real', 'Sushi Station', 'The Ramen Bar', 'Burrito Loco', 'Falafel Street',
  'Pita Paradise', 'The Dumpling House', 'Noodle Republic', 'Rice Bowl Express', 'The Kebab Factory',
  'Biryani Blues', 'Taco Bell Express', 'Burger Barn', 'The Salad Bar', 'Smoothie Central',
  'The Juice Press', 'Acai Bowl Co.', 'Grain & Green', 'The Poke Place', 'Gyoza Garden',
  'Mediterranean Grill', 'Shawarma Station', 'Crepe Corner', 'The Waffle House', 'Bagel & Brew',
  'The Sandwich Spot', 'Pizza By The Slice', 'Wing Street', 'The Hot Dog Stand', 'Donut District',
  'The Pastry Shop', 'Gelato Dreams', 'Cookie Crumble', 'Churro Charmer', 'Pancake Palace',
  'The Breakfast Club', 'Brunch Box', 'Dinner Bell', 'Late Night Bites', 'Street Food Corner',
  'The Food Truck Park', 'Market Kitchen', 'Farm To Fork', 'The Organic Plate', 'Harvest Table',
  'The Soup Kitchen', 'Chaat Corner', 'Momos Express', 'Dosa Republic', 'Idli Factory',
];

const DESCRIPTIONS_CAFE = [
  'A cozy café with excellent WiFi and power at every seat. Perfect for long work sessions.',
  'Specialty coffee and minimalist workspace vibes. Great espresso and quiet atmosphere.',
  'Charming spot with outdoor seating, fresh pastries, and strong connectivity.',
  'Health-focused café with wholesome bowls and calm atmosphere for remote work.',
  'Iconic café with legendary desserts and lively atmosphere for brainstorms.',
  'Garden café with rustic charm and fairy lights. The terrace is perfect for creative sessions.',
  'Artisanal coffee meets cozy workspace. Quiet enough for deep work.',
  'Modern café with fast WiFi, plenty of outlets, and great cold brews.',
  'Community-focused café where freelancers and creators gather daily.',
  'Sleek industrial-style café with strong coffee and ambient music.',
];

const DESCRIPTIONS_COWORK = [
  'Professional coworking space with meeting rooms, fast WiFi, and unlimited coffee.',
  'Flexible workspace with hot desks, dedicated desks, and private offices.',
  'Community-driven coworking with regular events, workshops, and networking.',
  'Premium workspace with ergonomic furniture, phone booths, and a rooftop terrace.',
  'Affordable coworking with 24/7 access, lockers, and printing facilities.',
];

const DESCRIPTIONS_LIBRARY = [
  'Quiet public library with study rooms, free WiFi, and extensive collections.',
  'Modern library with digital resources, comfortable seating, and silent zones.',
  'Heritage library with beautiful architecture and peaceful reading areas.',
];

const DESCRIPTIONS_FOOD = [
  'A neighbourhood favourite with incredible food and vibrant energy.',
  'Authentic flavours and generous portions. Worth every visit.',
  'Trendy spot known for creative dishes and Instagram-worthy presentations.',
  'No-frills eatery with legendary flavours. An absolute institution.',
  'Modern dining with fusion cuisine and a lively atmosphere.',
  'Family-style restaurant with hearty meals and warm hospitality.',
  'Quick bites and comfort food in a casual, friendly setting.',
  'Artisan bakery with freshly baked goods and aromatic coffee.',
];

const WIFI_SPEEDS: ('fast' | 'moderate' | 'slow')[] = ['fast', 'moderate', 'slow'];
const SOCKET_COUNTS: ('few' | 'many' | 'every-seat')[] = ['few', 'many', 'every-seat'];
const QUIET_LEVELS: ('silent' | 'quiet' | 'moderate' | 'lively')[] = ['silent', 'quiet', 'moderate', 'lively'];
const SEATINGS: ('limited' | 'moderate' | 'plenty')[] = ['limited', 'moderate', 'plenty'];

const OFFERS = [
  '☕ Buy 1 Get 1 Free on cold brews', '🍰 Free dessert with any main course', '🎉 20% off all gelato today',
  '🍕 Flat ₹100 off on sourdough pizzas', '🥐 Free coffee with any pastry order', '💻 First hour free for new members',
  '🎊 Happy hour 4-6pm — 30% off', '🥤 Free smoothie with any bowl', '🍔 Combo meal deal — save 25%',
  '☕ Unlimited refills on filter coffee', '🎁 Free WiFi pass with any purchase', '🌮 Taco Tuesday — 2 for 1',
  '🍳 Weekend brunch special — ₹299', '🧁 Baker\'s dozen — 13 for price of 12', '🥗 Healthy lunch combo — ₹199',
];

const HOURS_OPTIONS = [
  '7am – 10pm', '8am – 9pm', '9am – 10pm', '10am – 11pm', '11am – 11pm',
  '7:30am – 9pm', '6am – 8pm', '24/7', '10am – 12am', '8am – 11pm',
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickFrom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Generate 250 demo places scattered around a center point.
 */
export function generateDemoPlaces(centerLat = 28.55, centerLng = 77.22): WorkPlace[] {
  const rng = seededRandom(123);
  const places: WorkPlace[] = [];

  // Distribution: 80 cafés, 40 coworking, 15 libraries, 115 food = 250
  const typeDistribution: { type: PlaceType; count: number; names: string[]; descs: string[] }[] = [
    { type: 'cafe', count: 80, names: CAFE_NAMES, descs: DESCRIPTIONS_CAFE },
    { type: 'coworking', count: 40, names: COWORK_NAMES, descs: DESCRIPTIONS_COWORK },
    { type: 'library', count: 15, names: LIBRARY_NAMES, descs: DESCRIPTIONS_LIBRARY },
    { type: 'other', count: 115, names: FOOD_NAMES, descs: DESCRIPTIONS_FOOD },
  ];

  let globalIdx = 0;

  for (const { type, count, names, descs } of typeDistribution) {
    for (let i = 0; i < count; i++) {
      const isCafe = type === 'cafe';
      const isCowork = type === 'coworking';
      const isLibrary = type === 'library';
      const isFood = type === 'other';

      const hasWifi = isFood ? rng() > 0.6 : rng() > 0.1;
      const hasPower = isFood ? rng() > 0.7 : rng() > 0.15;

      // Vary distance: mostly close
      const r = rng();
      const rangeKm = r < 0.5 ? 1.5 : r < 0.8 ? 3 : 5;
      const offsetLat = ((rng() - 0.5) * 2 * rangeKm) / 111.32;
      const offsetLng = ((rng() - 0.5) * 2 * rangeKm) / (111.32 * Math.cos(centerLat * Math.PI / 180));

      const photo1 = PHOTOS[Math.floor(rng() * PHOTOS.length)];
      const photo2 = PHOTOS[Math.floor(rng() * PHOTOS.length)];

      const hasOffer = rng() < 0.15; // 15% chance of an offer

      places.push({
        id: `place-${globalIdx}`,
        name: names[i % names.length] + (i >= names.length ? ` #${Math.floor(i / names.length) + 1}` : ''),
        type,
        photos: [photo1, photo2],
        amenities: {
          wifi: hasWifi,
          wifiSpeed: hasWifi ? pickFrom(WIFI_SPEEDS, rng) : undefined,
          powerSockets: hasPower,
          powerSocketsCount: hasPower ? pickFrom(SOCKET_COUNTS, rng) : undefined,
          quietLevel: isLibrary ? pickFrom(['silent', 'quiet'] as const, rng) :
                      isCowork ? pickFrom(['quiet', 'moderate'] as const, rng) :
                      pickFrom(QUIET_LEVELS, rng),
          seating: pickFrom(SEATINGS, rng),
          outdoorSeating: rng() > 0.5,
          food: isFood || isCafe ? true : rng() > 0.6,
          coffee: isFood ? rng() > 0.5 : true,
        },
        hours: pickFrom(HOURS_OPTIONS, rng),
        rating: Math.round((3.2 + rng() * 1.8) * 10) / 10,
        description: descs[i % descs.length],
        lat: centerLat + offsetLat,
        lng: centerLng + offsetLng,
        ...(hasOffer ? { offer: pickFrom(OFFERS, rng) } : {}),
      });

      globalIdx++;
    }
  }

  return places;
}

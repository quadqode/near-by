import { CoworkPin, Role, TimeSlot } from './types';

const NAMES: Array<{ role: Role; timeSlot: TimeSlot; interests: string[]; message: string }> = [
  { role: 'developer', timeSlot: 'now', interests: ['Pair programming', 'Coffee chat'], message: 'Building a React app, happy to pair!' },
  { role: 'designer', timeSlot: 'now', interests: ['Design review', 'Brainstorming'], message: 'Working on a rebrand project 🎨' },
  { role: 'writer', timeSlot: 'morning', interests: ['Coffee chat', 'Accountability'], message: 'Writing my newsletter, need focus buddy' },
  { role: 'marketer', timeSlot: 'afternoon', interests: ['Networking', 'Brainstorming'], message: 'Planning a product launch campaign' },
  { role: 'developer', timeSlot: 'now', interests: ['Side projects', 'Learning'], message: 'Learning Rust, open to chat about systems' },
  { role: 'designer', timeSlot: 'evening', interests: ['Design review', 'Side projects'], message: 'Freelance UI/UX, looking for collabs' },
  { role: 'other', timeSlot: 'now', interests: ['Networking', 'Coffee chat'], message: 'Product manager, love meeting builders!' },
  { role: 'developer', timeSlot: 'morning', interests: ['Pair programming', 'Learning'], message: 'Full-stack dev, working on AI tools' },
  { role: 'writer', timeSlot: 'now', interests: ['Accountability', 'Coffee chat'], message: 'Finishing a blog series on productivity' },
  { role: 'marketer', timeSlot: 'afternoon', interests: ['Brainstorming', 'Side projects'], message: 'Growth hacker, always up for ideas' },
  { role: 'developer', timeSlot: 'evening', interests: ['Side projects', 'Pair programming'], message: 'Working on an open-source CLI tool' },
  { role: 'designer', timeSlot: 'now', interests: ['Brainstorming', 'Networking'], message: 'Motion designer at a café ☕' },
  { role: 'developer', timeSlot: 'now', interests: ['Learning', 'Coffee chat'], message: 'Exploring WebGL and 3D on the web' },
  { role: 'writer', timeSlot: 'afternoon', interests: ['Accountability', 'Side projects'], message: 'Tech journalist, researching a story' },
  { role: 'other', timeSlot: 'morning', interests: ['Networking', 'Learning'], message: 'Startup founder looking for co-builders' },
  { role: 'marketer', timeSlot: 'now', interests: ['Coffee chat', 'Brainstorming'], message: 'SEO nerd, happy to audit your site!' },
];

/** Generate a random offset in km converted to degrees */
function offsetDeg(kmRange: number): number {
  const km = (Math.random() - 0.5) * 2 * kmRange;
  return km / 111.32; // rough degree conversion
}

/**
 * Generate demo pins scattered around a center point.
 * Called with the user's geolocation so pins always appear nearby.
 */
export function generateDemoPins(centerLat = 40.7128, centerLng = -74.006): CoworkPin[] {
  return NAMES.map((data, i) => ({
    ...data,
    id: `demo-${i}`,
    lat: centerLat + offsetDeg(3),
    lng: centerLng + offsetDeg(3) / Math.cos(centerLat * Math.PI / 180),
    createdAt: new Date(Date.now() - Math.random() * 3600000),
    expiresAt: new Date(Date.now() + (2 + Math.random() * 4) * 3600000),
  }));
}

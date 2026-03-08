import { CoworkPin, Role, TimeSlot } from './types';

// Demo pins scattered around NYC (default location)
const DEMO_PINS_DATA: Array<{
  lat: number; lng: number; role: Role; timeSlot: TimeSlot;
  interests: string[]; message: string;
}> = [
  { lat: 40.7145, lng: -74.0025, role: 'developer', timeSlot: 'now', interests: ['Pair programming', 'Coffee chat'], message: 'Building a React app, happy to pair!' },
  { lat: 40.7185, lng: -73.9985, role: 'designer', timeSlot: 'now', interests: ['Design review', 'Brainstorming'], message: 'Working on a rebrand project 🎨' },
  { lat: 40.7105, lng: -74.0085, role: 'writer', timeSlot: 'morning', interests: ['Coffee chat', 'Accountability'], message: 'Writing my newsletter, need focus buddy' },
  { lat: 40.7200, lng: -74.0050, role: 'marketer', timeSlot: 'afternoon', interests: ['Networking', 'Brainstorming'], message: 'Planning a product launch campaign' },
  { lat: 40.7160, lng: -73.9950, role: 'developer', timeSlot: 'now', interests: ['Side projects', 'Learning'], message: 'Learning Rust, open to chat about systems' },
  { lat: 40.7080, lng: -74.0020, role: 'designer', timeSlot: 'evening', interests: ['Design review', 'Side projects'], message: 'Freelance UI/UX, looking for collabs' },
  { lat: 40.7220, lng: -74.0010, role: 'other', timeSlot: 'now', interests: ['Networking', 'Coffee chat'], message: 'Product manager, love meeting builders!' },
  { lat: 40.7130, lng: -74.0100, role: 'developer', timeSlot: 'morning', interests: ['Pair programming', 'Learning'], message: 'Full-stack dev, working on AI tools' },
  { lat: 40.7175, lng: -74.0070, role: 'writer', timeSlot: 'now', interests: ['Accountability', 'Coffee chat'], message: 'Finishing a blog series on productivity' },
  { lat: 40.7095, lng: -73.9970, role: 'marketer', timeSlot: 'afternoon', interests: ['Brainstorming', 'Side projects'], message: 'Growth hacker, always up for ideas' },
  { lat: 40.7210, lng: -73.9940, role: 'developer', timeSlot: 'evening', interests: ['Side projects', 'Pair programming'], message: 'Working on an open-source CLI tool' },
  { lat: 40.7150, lng: -74.0110, role: 'designer', timeSlot: 'now', interests: ['Brainstorming', 'Networking'], message: 'Motion designer at a café ☕' },
];

export function generateDemoPins(): CoworkPin[] {
  return DEMO_PINS_DATA.map((data, i) => ({
    ...data,
    id: `demo-${i}`,
    createdAt: new Date(Date.now() - Math.random() * 3600000),
    expiresAt: new Date(Date.now() + (2 + Math.random() * 4) * 3600000),
  }));
}

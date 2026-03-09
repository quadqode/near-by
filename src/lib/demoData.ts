import { CoworkPin, Role, TimeSlot } from './types';

const ROLES_LIST: Role[] = ['developer', 'designer', 'writer', 'marketer', 'other'];
const TIME_SLOTS_LIST: TimeSlot[] = ['now', 'morning', 'afternoon', 'evening'];
const INTERESTS_LIST = ['Brainstorming', 'Pair programming', 'Design review', 'Coffee chat', 'Networking', 'Accountability', 'Learning', 'Side projects'];

const MESSAGES: Record<Role, string[]> = {
  developer: [
    'Building a React app, happy to pair!', 'Full-stack dev, working on AI tools', 'Learning Rust, open to chat about systems',
    'Working on an open-source CLI tool', 'Exploring WebGL and 3D on the web', 'Hacking on a Svelte migration 🚀',
    'Backend eng exploring Elixir', 'DevOps nerd, automating everything', 'Game dev prototyping in Godot',
    'Data engineer playing with DuckDB', 'Mobile dev, building a fitness app', 'Building SaaS dashboards ☕',
    'Flutter dev, working from a cafe here', 'React Native dev, shipping a health app', 'DevOps eng at a coworking space',
    'Shipping a Rust CLI for devs', 'Kubernetes fanatic, scaling infra', 'Building real-time apps with WebSockets',
    'Hacking on a VS Code extension', 'Writing a compiler in Zig', 'Exploring WASM for edge computing',
    'Working on a GraphQL gateway', 'Building an AI code review tool', 'Optimizing database queries today',
    'Migrating a monolith to microservices', 'Building a Tailwind component library', 'Working on OAuth2 integrations',
    'Experimenting with Deno 2.0', 'Building browser extensions in TypeScript', 'Writing integration tests all day',
    'Refactoring legacy PHP to Go', 'Building a real-time dashboard with D3', 'Working on a Kafka pipeline',
    'Prototyping AR features in Swift', 'Building a CLI package manager', 'Exploring vector databases',
    'Working on a Stripe integration', 'Debugging race conditions 🐛', 'Implementing CRDT sync engine',
    'Building a RAG pipeline today', 'Setting up CI/CD with GitHub Actions', 'Exploring htmx + Go stack',
    'Writing Terraform modules', 'Building a design system in Figma tokens', 'Optimizing React renders today',
    'Working on a Chrome DevTools plugin', 'Implementing WebRTC video calls', 'Shipping an Electron desktop app',
    'Exploring edge functions', 'Building a serverless API', 'Working on distributed tracing',
  ],
  designer: [
    'Working on a rebrand project 🎨', 'Freelance UI/UX, looking for collabs', 'Motion designer at a café ☕',
    'Brand designer, talk typography with me', 'Product designer, love whiteboard jams', 'Graphic designer working on brand kits',
    '3D artist learning Blender 🧊', 'UI designer freelancing', 'Designing a mobile app from scratch',
    'Working on design tokens & systems', 'Prototyping animations in After Effects', 'Designing landing pages for startups',
    'Creating icon sets for open source', 'UX researcher doing user interviews', 'Illustration work for a children\'s book',
    'Designing email templates today', 'Working on accessibility audit', 'Building Figma plugins',
    'Designing a SaaS onboarding flow', 'Creating social media templates', 'Working on data visualization design',
    'Redesigning a checkout experience', 'Creating a design system from scratch', 'Prototyping with Framer',
    'Working on micro-interactions', 'Designing a dashboard layout', 'Creating brand guidelines',
    'Motion graphics for a product launch', 'Designing a component library', 'UX writing for a fintech app',
  ],
  writer: [
    'Writing my newsletter, need focus buddy', 'Finishing a blog series on productivity', 'Tech journalist, researching a story',
    'Copywriter cranking out landing pages', 'Screenwriter working on a pilot 🎬', 'Novelist on chapter 12, need company',
    'Freelance copywriter, need a focus buddy', 'Tech blogger writing about startups', 'Writing documentation for an API',
    'Working on a sci-fi short story', 'Editing a podcast transcript', 'Writing case studies for a SaaS',
    'Content strategist planning Q2', 'Writing a book on remote work', 'Drafting press releases today',
    'Working on SEO content strategy', 'Writing product descriptions', 'Editing a technical whitepaper',
    'Creating a content calendar', 'Writing UX copy for an app', 'Ghostwriting a founder\'s memoir',
    'Blogging about design patterns', 'Writing ad copy for campaigns', 'Creating email sequences',
    'Working on a travel blog post', 'Writing API documentation', 'Drafting investor updates',
    'Creating a style guide', 'Writing release notes', 'Scripting YouTube videos',
  ],
  marketer: [
    'Planning a product launch campaign', 'Growth hacker, always up for ideas', 'SEO nerd, happy to audit your site!',
    'Running ads for D2C brands, let us chat!', 'Content creator shooting reels nearby 🎥', 'Building my personal brand on socials',
    'Content strategist, ask me anything!', 'Working on email marketing funnels', 'A/B testing landing pages today',
    'Planning an influencer campaign', 'Analyzing Google Analytics data', 'Building a referral program',
    'Working on brand partnerships', 'Creating TikTok content strategy', 'Setting up marketing automation',
    'Optimizing PPC campaigns', 'Planning a webinar series', 'Working on customer journey maps',
    'Building a community strategy', 'Creating performance dashboards', 'Working on attribution modeling',
    'Planning a product hunt launch', 'Designing email drip campaigns', 'Analyzing funnel conversion rates',
    'Working on social media calendar', 'Setting up retargeting campaigns', 'Planning a guerrilla marketing stunt',
    'Building partnership proposals', 'Creating affiliate programs', 'Working on PR outreach',
  ],
  other: [
    'Product manager, love meeting builders!', 'Startup founder looking for co-builders', 'VC scout, always curious about projects',
    'Recruiter who loves the indie scene', 'Startup founder, building fintech product', 'Data scientist crunching numbers',
    'Project manager organizing sprints', 'Student working on thesis', 'Researcher in AI ethics',
    'Consultant helping startups scale', 'Angel investor, happy to chat', 'Operations lead streamlining processes',
    'Legal advisor for tech startups', 'HR specialist building culture', 'Financial analyst building models',
    'Business analyst mapping workflows', 'Product owner prioritizing backlog', 'Scrum master running retrospectives',
    'CTO advising early-stage startups', 'Community builder organizing events', 'Mentor at a startup accelerator',
    'Educator creating online courses', 'Researcher in quantum computing', 'Data analyst building reports',
    'Supply chain optimizer', 'Sustainability consultant', 'Policy researcher on tech regulation',
    'Podcast host interviewing founders', 'Event planner for tech meetups', 'Career coach for tech transitions',
  ],
};

/** Seeded random number generator */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function offsetDeg(kmRange: number, rng: () => number): number {
  const km = (rng() - 0.5) * 2 * kmRange;
  return km / 111.32;
}

function pickFrom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Generate 250 demo pins scattered around a center point.
 */
export function generateDemoPins(centerLat = 40.7128, centerLng = -74.006): CoworkPin[] {
  const rng = seededRandom(42);
  const pins: CoworkPin[] = [];

  for (let i = 0; i < 250; i++) {
    const role = ROLES_LIST[i % ROLES_LIST.length];
    const timeSlot = TIME_SLOTS_LIST[Math.floor(rng() * TIME_SLOTS_LIST.length)];
    const msgs = MESSAGES[role];
    const message = msgs[i % msgs.length];
    const interests = pickN(INTERESTS_LIST, 1 + Math.floor(rng() * 3), rng);

    // Vary distance: 60% close (1.5km), 25% mid (3km), 15% far (5km)
    const r = rng();
    const range = r < 0.6 ? 1.5 : r < 0.85 ? 3 : 5;

    pins.push({
      id: `demo-${i}`,
      role,
      timeSlot,
      interests,
      message,
      lat: centerLat + offsetDeg(range, rng),
      lng: centerLng + offsetDeg(range, rng) / Math.cos(centerLat * Math.PI / 180),
      createdAt: new Date(Date.now() - rng() * 3600000),
      expiresAt: new Date(Date.now() + (2 + rng() * 6) * 3600000),
    });
  }

  return pins;
}

export type Role = 'designer' | 'developer' | 'writer' | 'marketer' | 'other';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'now';

export interface CoworkPin {
  id: string;
  lat: number;
  lng: number;
  role: Role;
  interests: string[];
  timeSlot: TimeSlot;
  message: string;
  createdAt: Date;
  expiresAt: Date;
  userId?: string;
}

export const ROLES: { value: Role; label: string; emoji: string }[] = [
  { value: 'designer', label: 'Designer', emoji: '🎨' },
  { value: 'developer', label: 'Developer', emoji: '💻' },
  { value: 'writer', label: 'Writer', emoji: '✍️' },
  { value: 'marketer', label: 'Marketer', emoji: '📣' },
  { value: 'other', label: 'Other', emoji: '🤝' },
];

export const TIME_SLOTS: { value: TimeSlot; label: string }[] = [
  { value: 'now', label: "I'm here now" },
  { value: 'morning', label: 'Morning (8–12)' },
  { value: 'afternoon', label: 'Afternoon (12–17)' },
  { value: 'evening', label: 'Evening (17–21)' },
];

export const INTERESTS = [
  'Brainstorming', 'Pair programming', 'Design review', 'Coffee chat',
  'Networking', 'Accountability', 'Learning', 'Side projects',
];

export const ROLE_COLORS: Record<Role, string> = {
  designer: 'var(--pin-designer)',
  developer: 'var(--pin-developer)',
  writer: 'var(--pin-writer)',
  marketer: 'var(--pin-marketer)',
  other: 'var(--pin-other)',
};

export const RADIUS_KM = 4;
export const RADIUS_KM_EXTENDED = 10;

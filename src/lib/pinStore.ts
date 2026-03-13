import { supabase } from '@/integrations/supabase/client';
import { CoworkPin, Role, TimeSlot } from './types';
import { generateDemoPins } from './demoData';

const DEMO_SEEDED_KEY = 'cowork-demo-seeded-v4';

function mapRow(row: {
  id: string; lat: number; lng: number; role: string; time_slot: string;
  interests: string[]; message: string; created_at: string; expires_at: string;
}): CoworkPin {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    role: row.role as Role,
    timeSlot: row.time_slot as TimeSlot,
    interests: row.interests || [],
    message: row.message || '',
    createdAt: new Date(row.created_at),
    expiresAt: new Date(row.expires_at),
  };
}

export async function seedDemoPins(centerLat = 40.7128, centerLng = -74.006) {
  if (localStorage.getItem(DEMO_SEEDED_KEY)) return;
  const demos = generateDemoPins(centerLat, centerLng);
  const rows = demos.map(d => ({
    lat: d.lat,
    lng: d.lng,
    role: d.role,
    time_slot: d.timeSlot,
    interests: d.interests,
    message: d.message,
    expires_at: d.expiresAt.toISOString(),
  }));
  await supabase.from('pins').insert(rows);
  localStorage.setItem(DEMO_SEEDED_KEY, 'true');
}

export async function getPins(): Promise<CoworkPin[]> {
  const { data, error } = await supabase
    .from('pins')
    .select('*')
    .gt('expires_at', new Date().toISOString());
  if (error) { console.error('Error fetching pins:', error); return []; }
  return (data || []).map(mapRow);
}

export async function addPin(pin: Omit<CoworkPin, 'id' | 'createdAt' | 'expiresAt'>): Promise<CoworkPin | null> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('pins')
    .insert({
      lat: pin.lat,
      lng: pin.lng,
      role: pin.role,
      time_slot: pin.timeSlot,
      interests: pin.interests,
      message: pin.message,
      user_id: user?.id || null,
    })
    .select()
    .single();
  if (error) { console.error('Error adding pin:', error); return null; }
  return mapRow(data);
}

export async function removePin(id: string) {
  await supabase.from('pins').delete().eq('id', id);
}

export async function sayHi(pinId: string): Promise<boolean> {
  const { error: greetErr } = await supabase.from('greetings').insert({ pin_id: pinId });
  if (greetErr) { console.error('Error sending hi:', greetErr); return false; }
  // Increment hi_count on the pin
  const { data: pin } = await supabase.from('pins').select('hi_count').eq('id', pinId).single();
  if (pin) {
    await supabase.from('pins').update({ hi_count: (pin.hi_count || 0) + 1 }).eq('id', pinId);
  }
  return true;
}

export function filterPins(
  pins: CoworkPin[],
  filters: { roles?: Role[]; timeSlots?: TimeSlot[]; interests?: string[] }
): CoworkPin[] {
  return pins.filter(pin => {
    if (filters.roles?.length && !filters.roles.includes(pin.role)) return false;
    if (filters.timeSlots?.length && !filters.timeSlots.includes(pin.timeSlot)) return false;
    if (filters.interests?.length && !filters.interests.some(i => pin.interests.includes(i))) return false;
    return true;
  });
}

// Fuzzy a pin's location by ~200-400m for privacy
export function fuzzyLocation(lat: number, lng: number, seed: string): [number, number] {
  // Deterministic hash from seed so same pin always gets same offset
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const offsetKm = 0.2 + (Math.abs(hash >> 8) % 200) / 1000; // 0.2–0.4 km
  const dLat = (offsetKm / 110.574) * Math.cos(angle);
  const dLng = (offsetKm / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
  return [lat + dLat, lng + dLng];
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function subscribeToPins(onUpdate: () => void) {
  const channel = supabase
    .channel('pins-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => {
      onUpdate();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

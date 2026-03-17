import { supabase } from '@/integrations/supabase/client';
import { CoworkPin, Role, TimeSlot } from './types';
import { generateDemoPins } from './demoData';

const DEMO_SEEDED_KEY = 'cowork-demo-seeded-v4';

export interface HiRequest {
  id: string;
  pinId: string;
  senderId: string;
  senderName: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

function mapRow(row: {
  id: string; lat: number; lng: number; role: string; time_slot: string;
  interests: string[]; message: string; created_at: string; expires_at: string;
  user_id?: string | null;
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
    userId: row.user_id || undefined,
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

export async function addPin(pin: Omit<CoworkPin, 'id' | 'createdAt' | 'expiresAt' | 'userId'>): Promise<CoworkPin | null> {
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

// --- Hi Request Flow ---

export async function sendHi(pinId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('greetings').insert({
    pin_id: pinId,
    sender_id: user.id,
    message: '👋 Hi!',
    status: 'pending',
  });
  if (error) { console.error('Error sending hi:', error); return false; }

  // Increment hi_count on the pin
  const { data: pin } = await supabase.from('pins').select('hi_count').eq('id', pinId).single();
  if (pin) {
    await supabase.from('pins').update({ hi_count: (pin.hi_count || 0) + 1 }).eq('id', pinId);
  }
  return true;
}

export async function getHiRequestsForMyPins(): Promise<HiRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get my active pins
  const { data: myPins } = await supabase
    .from('pins')
    .select('id')
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString());

  if (!myPins?.length) return [];
  const pinIds = myPins.map(p => p.id);

  const { data: greetings, error } = await supabase
    .from('greetings')
    .select('*')
    .in('pin_id', pinIds)
    .order('created_at', { ascending: false });

  if (error || !greetings) return [];

  // Fetch sender profiles
  const senderIds = [...new Set(greetings.map(g => g.sender_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', senderIds);

  const profileMap = new Map((profiles || []).map(p => [p.id, p.display_name]));

  return greetings.map(g => ({
    id: g.id,
    pinId: g.pin_id,
    senderId: g.sender_id,
    senderName: profileMap.get(g.sender_id) || 'Someone',
    message: g.message,
    status: g.status as HiRequest['status'],
    createdAt: new Date(g.created_at),
  }));
}

export async function getMyHiStatus(pinId: string): Promise<HiRequest | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('greetings')
    .select('*')
    .eq('pin_id', pinId)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    pinId: data.pin_id,
    senderId: data.sender_id,
    senderName: '',
    message: data.message,
    status: data.status as HiRequest['status'],
    createdAt: new Date(data.created_at),
  };
}

export async function respondToHi(greetingId: string, status: 'accepted' | 'declined'): Promise<boolean> {
  const { error } = await supabase
    .from('greetings')
    .update({ status })
    .eq('id', greetingId);
  if (error) { console.error('Error responding to hi:', error); return false; }
  return true;
}

// Legacy alias
export async function sayHi(pinId: string): Promise<boolean> {
  return sendHi(pinId);
}

export function subscribeToGreetings(onUpdate: () => void) {
  const channel = supabase
    .channel('greetings-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'greetings' }, () => {
      onUpdate();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// --- Existing utilities ---

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

export function fuzzyLocation(lat: number, lng: number, seed: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const offsetKm = 0.2 + (Math.abs(hash >> 8) % 200) / 1000;
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

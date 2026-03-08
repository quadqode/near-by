import { CoworkPin, Role, TimeSlot } from './types';

const STORAGE_KEY = 'cowork-pins';

function loadPins(): CoworkPin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const pins: CoworkPin[] = JSON.parse(raw, (key, val) => {
      if (key === 'createdAt' || key === 'expiresAt') return new Date(val);
      return val;
    });
    // Filter expired
    return pins.filter(p => new Date(p.expiresAt) > new Date());
  } catch { return []; }
}

function savePins(pins: CoworkPin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
}

export function getPins(): CoworkPin[] {
  return loadPins();
}

export function addPin(pin: Omit<CoworkPin, 'id' | 'createdAt' | 'expiresAt'>): CoworkPin {
  const pins = loadPins();
  const newPin: CoworkPin = {
    ...pin,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
  };
  pins.push(newPin);
  savePins(pins);
  return newPin;
}

export function removePin(id: string) {
  const pins = loadPins().filter(p => p.id !== id);
  savePins(pins);
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

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

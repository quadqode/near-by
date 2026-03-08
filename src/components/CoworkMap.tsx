import { useEffect, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CoworkPin, Role, TimeSlot, ROLES, RADIUS_KM } from '@/lib/types';
import { getPins, filterPins, getDistance } from '@/lib/pinStore';
import DropPinDialog from './DropPinDialog';
import FilterPanel from './FilterPanel';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_HEX: Record<Role, string> = {
  designer: '#7c3aed',
  developer: '#1a9a7a',
  writer: '#d97706',
  marketer: '#e11d6d',
  other: '#6b8299',
};

function createPinIcon(role: Role, isNow: boolean) {
  const color = ROLE_HEX[role];
  return L.divIcon({
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
    html: `
      <div style="
        width:36px;height:36px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.2);
        display:flex;align-items:center;justify-content:center;
        ${isNow ? 'animation:pulse-pin 2s ease-in-out infinite;' : ''}
      ">
        <span style="transform:rotate(45deg);font-size:16px;">
          ${ROLES.find(r => r.value === role)?.emoji || '🤝'}
        </span>
      </div>
    `,
  });
}

function createPopupContent(pin: CoworkPin): string {
  const role = ROLES.find(r => r.value === pin.role);
  const nowBadge = pin.timeSlot === 'now'
    ? `<span style="background:rgba(26,154,122,0.1);color:#1a9a7a;font-size:10px;font-weight:600;padding:2px 6px;border-radius:9999px;">HERE NOW</span>`
    : '';
  const interests = pin.interests.length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${pin.interests.map(i =>
        `<span style="background:#f1f5f9;color:#64748b;font-size:10px;padding:2px 6px;border-radius:9999px;">${i}</span>`
      ).join('')}</div>`
    : '';
  const msg = pin.message ? `<p style="font-size:12px;color:#64748b;margin:6px 0;">"${pin.message}"</p>` : '';

  return `
    <div style="padding:12px;min-width:180px;font-family:'DM Sans',sans-serif;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="font-size:18px;">${role?.emoji}</span>
        <span style="font-weight:600;font-size:14px;text-transform:capitalize;">${pin.role}</span>
        ${nowBadge}
      </div>
      ${msg}
      ${interests}
      <p style="font-size:10px;color:#94a3b8;margin-top:8px;">
        Expires ${new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  `;
}

const DEFAULT_POS: [number, number] = [40.7128, -74.006];

export default function CoworkMap() {
  const [userPos, setUserPos] = useState<[number, number]>(DEFAULT_POS);
  const [pins, setPins] = useState<CoworkPin[]>([]);
  const [dropDialog, setDropDialog] = useState<{ lat: number; lng: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRoles, setFilterRoles] = useState<Role[]>([]);
  const [filterTimes, setFilterTimes] = useState<TimeSlot[]>([]);
  const [filterInterests, setFilterInterests] = useState<string[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);

  const refreshPins = useCallback(() => setPins(getPins()), []);

  // Init geolocation
  useEffect(() => {
    refreshPins();
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    );
  }, [refreshPins]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(userPos, 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      // We store click coords in a data attribute for the dropping handler
      const event = new CustomEvent('map-click', { detail: { lat: e.latlng.lat, lng: e.latlng.lng } });
      window.dispatchEvent(event);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to user position
  useEffect(() => {
    if (mapRef.current) mapRef.current.flyTo(userPos, 14);
  }, [userPos]);

  // Handle map clicks for dropping
  useEffect(() => {
    const handler = (e: Event) => {
      if (!dropping) return;
      const { lat, lng } = (e as CustomEvent).detail;
      if (getDistance(userPos[0], userPos[1], lat, lng) > RADIUS_KM) return;
      setDropDialog({ lat, lng });
      setDropping(false);
    };
    window.addEventListener('map-click', handler);
    return () => window.removeEventListener('map-click', handler);
  }, [dropping, userPos]);

  // Update markers & circle
  const filtered = filterPins(pins, { roles: filterRoles, timeSlots: filterTimes, interests: filterInterests })
    .filter(p => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= RADIUS_KM);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filtered.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createPinIcon(pin.role, pin.timeSlot === 'now'),
      }).addTo(map);
      marker.bindPopup(createPopupContent(pin));
      markersRef.current.push(marker);
    });

    // Update radius circle
    if (circleRef.current) circleRef.current.remove();
    circleRef.current = L.circle(userPos, {
      radius: RADIUS_KM * 1000,
      color: '#1a9a7a',
      fillColor: '#1a9a7a',
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: '6 4',
    }).addTo(map);
  }, [filtered, userPos]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2"
      >
        <div className="bg-card rounded-lg shadow-lg border border-border px-4 py-2 flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h1 className="font-heading font-bold text-foreground text-lg">CoWork Drop</h1>
        </div>
        <div className="bg-card rounded-lg shadow-lg border border-border px-3 py-2 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">{filtered.length} nearby</span>
        </div>
      </motion.div>

      {/* Filter */}
      <div className="absolute top-4 right-4 z-[1000]">
        <FilterPanel
          open={filterOpen}
          onToggle={() => setFilterOpen(v => !v)}
          roles={filterRoles}
          timeSlots={filterTimes}
          interests={filterInterests}
          onRolesChange={setFilterRoles}
          onTimeSlotsChange={setFilterTimes}
          onInterestsChange={setFilterInterests}
        />
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3"
      >
        <Button
          onClick={() => setDropping(!dropping)}
          className={`h-14 px-6 rounded-full shadow-lg font-heading font-semibold text-base gap-2 transition-all ${
            dropping ? 'bg-secondary hover:bg-secondary/90 ring-2 ring-secondary/30' : ''
          }`}
        >
          <Plus className={`h-5 w-5 transition-transform ${dropping ? 'rotate-45' : ''}`} />
          {dropping ? 'Tap the map' : 'Drop a pin'}
        </Button>
      </motion.div>

      {dropDialog && (
        <DropPinDialog
          open={!!dropDialog}
          onClose={() => setDropDialog(null)}
          lat={dropDialog.lat}
          lng={dropDialog.lng}
          onPinAdded={refreshPins}
        />
      )}
    </div>
  );
}

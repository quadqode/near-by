import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CoworkPin, Role, TimeSlot, ROLES, RADIUS_KM } from '@/lib/types';
import { getPins, filterPins, getDistance } from '@/lib/pinStore';
import DropPinDialog from './DropPinDialog';
import FilterPanel from './FilterPanel';
import { Button } from '@/components/ui/button';
import { Plus, Navigation, Users } from 'lucide-react';
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

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyToUser({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(pos, 14); }, [pos, map]);
  return null;
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

  const refreshPins = useCallback(() => setPins(getPins()), []);

  useEffect(() => {
    refreshPins();
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    );
  }, [refreshPins]);

  const filtered = filterPins(pins, { roles: filterRoles, timeSlots: filterTimes, interests: filterInterests })
    .filter(p => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= RADIUS_KM);

  const handleMapClick = (lat: number, lng: number) => {
    if (!dropping) return;
    if (getDistance(userPos[0], userPos[1], lat, lng) > RADIUS_KM) return;
    setDropDialog({ lat, lng });
    setDropping(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
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

      {/* Map */}
      <MapContainer
        center={userPos}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onClick={handleMapClick} />
        <FlyToUser pos={userPos} />

        <Circle
          center={userPos}
          radius={RADIUS_KM * 1000}
          pathOptions={{
            color: 'hsl(168, 60%, 42%)',
            fillColor: 'hsl(168, 60%, 42%)',
            fillOpacity: 0.04,
            weight: 1.5,
            dashArray: '6 4',
          }}
        />

        {filtered.map(pin => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createPinIcon(pin.role, pin.timeSlot === 'now')}
          >
            <Popup>
              <div className="p-3 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{ROLES.find(r => r.value === pin.role)?.emoji}</span>
                  <span className="font-heading font-semibold text-sm capitalize">{pin.role}</span>
                  {pin.timeSlot === 'now' && (
                    <span className="bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      HERE NOW
                    </span>
                  )}
                </div>
                {pin.message && <p className="text-xs text-muted-foreground mb-2">"{pin.message}"</p>}
                {pin.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pin.interests.map(i => (
                      <span key={i} className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">{i}</span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  Expires {new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

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

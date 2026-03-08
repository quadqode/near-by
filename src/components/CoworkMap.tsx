import { useEffect, useState, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CoworkPin, Role, TimeSlot, ROLES, RADIUS_KM } from '@/lib/types';
import { getPins, filterPins, getDistance, seedDemoPins, subscribeToPins } from '@/lib/pinStore';
import DropPinDialog from './DropPinDialog';
import FilterPanel from './FilterPanel';
import PinListView from './PinListView';
import PinDetailPanel from './PinDetailPanel';
import UsageGuide from './UsageGuide';
import { Button } from '@/components/ui/button';
import { Plus, Users, Map, List, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtYnJhajV0ODA0NnEya3B6ZHZiMXkxNHoifQ.yb0EKMzW1TSzQMOjmv-IpA';

const ROLE_HEX: Record<Role, string> = {
  designer: '#7c3aed',
  developer: '#1a9a7a',
  writer: '#d97706',
  marketer: '#d9365b',
  other: '#6b8299',
};

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
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedPin, setSelectedPin] = useState<CoworkPin | null>(null);
  const [guideOpen, setGuideOpen] = useState(() => !localStorage.getItem('cowork-guide-seen'));

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const refreshPins = useCallback(async () => {
    const data = await getPins();
    setPins(data);
  }, []);

  // Init: seed demo data, fetch pins, geolocate, subscribe to realtime
  useEffect(() => {
    seedDemoPins().then(() => refreshPins());
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    );
    const unsub = subscribeToPins(() => refreshPins());
    return unsub;
  }, [refreshPins]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [userPos[1], userPos[0]],
      zoom: 13,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: true }), 'top-right');
    map.on('click', (e) => {
      const event = new CustomEvent('map-click', { detail: { lat: e.lngLat.lat, lng: e.lngLat.lng } });
      window.dispatchEvent(event);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) mapRef.current.flyTo({ center: [userPos[1], userPos[0]], zoom: 13 });
  }, [userPos]);

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

  const filtered = filterPins(pins, { roles: filterRoles, timeSlots: filterTimes, interests: filterInterests })
    .filter(p => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= RADIUS_KM);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filtered.forEach(pin => {
      const el = document.createElement('div');
      el.className = `pin-marker ${pin.timeSlot === 'now' ? 'is-now' : ''}`;
      el.style.backgroundColor = ROLE_HEX[pin.role];
      const role = ROLES.find(r => r.value === pin.role);
      el.textContent = role?.emoji || '🤝';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedPin(pin);
      });
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [filtered]);

  const handleGuideClose = () => {
    setGuideOpen(false);
    localStorage.setItem('cowork-guide-seen', 'true');
  };

  const handlePinSelect = (pin: CoworkPin) => {
    setSelectedPin(pin);
    if (view === 'map' && mapRef.current) {
      mapRef.current.flyTo({ center: [pin.lng, pin.lat], zoom: 15 });
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div ref={mapContainerRef} className={`h-full w-full transition-opacity duration-300 ${view === 'list' ? 'opacity-0 pointer-events-none absolute' : ''}`} />

      <AnimatePresence>
        {view === 'list' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background z-[500]">
            <div className="h-full pt-16">
              <PinListView pins={filtered} userPos={userPos} onPinSelect={handlePinSelect} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPin && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/20 z-[1050]" onClick={() => setSelectedPin(null)} />
            <PinDetailPanel pin={selectedPin} userPos={userPos} onClose={() => setSelectedPin(null)} />
          </>
        )}
      </AnimatePresence>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
        <div className="bg-card rounded-xl shadow-lg border border-border px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-lg">🗺️</span>
          <h1 className="font-heading font-bold text-foreground text-base">CoWork Drop</h1>
        </div>
        <div className="bg-card rounded-xl shadow-lg border border-border px-3 py-2.5 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{filtered.length} nearby</span>
        </div>
      </motion.div>

      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <div className="bg-card rounded-xl shadow-lg border border-border p-1 flex">
          <Button size="icon" variant={view === 'map' ? 'default' : 'ghost'} className="h-8 w-8 rounded-lg" onClick={() => setView('map')}>
            <Map className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={view === 'list' ? 'default' : 'ghost'} className="h-8 w-8 rounded-lg" onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button size="icon" variant="outline" className="bg-card shadow-lg border-border h-10 w-10 rounded-xl" onClick={() => setGuideOpen(true)}>
          <HelpCircle className="h-4 w-4" />
        </Button>
        <FilterPanel open={filterOpen} onToggle={() => setFilterOpen(v => !v)} roles={filterRoles} timeSlots={filterTimes} interests={filterInterests} onRolesChange={setFilterRoles} onTimeSlotsChange={setFilterTimes} onInterestsChange={setFilterInterests} />
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <Button onClick={() => setDropping(!dropping)} size="lg" className={`h-14 px-7 rounded-full shadow-xl font-heading font-semibold text-base gap-2.5 transition-all ${dropping ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}>
          <Plus className={`h-5 w-5 transition-transform ${dropping ? 'rotate-45' : ''}`} />
          {dropping ? 'Tap the map' : 'Drop a pin'}
        </Button>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border px-3 py-1.5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {filtered.length} people</span>
          <span className="text-border">|</span>
          <span>{RADIUS_KM}km radius</span>
        </div>
      </motion.div>

      {dropDialog && <DropPinDialog open={!!dropDialog} onClose={() => setDropDialog(null)} lat={dropDialog.lat} lng={dropDialog.lng} onPinAdded={refreshPins} />}
      <UsageGuide open={guideOpen} onClose={handleGuideClose} />
    </div>
  );
}

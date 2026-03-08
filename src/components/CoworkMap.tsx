import { useEffect, useState, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibjFuamEiLCJhIjoiY21taHl5Nm1iMDk0ODJwczc5cG85dnRmaiJ9.j5teJQde50Xj19Zu7q9Jrw';
import { CoworkPin, Role, TimeSlot, ROLES } from '@/lib/types';
import { WorkPlace } from '@/lib/placeTypes';
import { PLACE_TYPE_META } from '@/lib/placeTypes';
import { generateDemoPlaces } from '@/lib/demoPlaces';
import { getPins, filterPins, getDistance, seedDemoPins, subscribeToPins } from '@/lib/pinStore';
import DropPinDialog from './DropPinDialog';
import FilterPanel from './FilterPanel';
import PinListView from './PinListView';
import PinDetailPanel from './PinDetailPanel';
import PlaceDetailPanel from './PlaceDetailPanel';
import UsageGuide from './UsageGuide';
import LocationPicker from './LocationPicker';
import ExpiryCheckIn, { useExpiryCheckIn } from './ExpiryCheckIn';
import { Button } from '@/components/ui/button';
import { Plus, Users, Map, List, HelpCircle, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_HEX: Record<Role, string> = {
  designer: '#7c3aed',
  developer: '#1a9a7a',
  writer: '#d97706',
  marketer: '#d9365b',
  other: '#6b8299'
};

// Helper: create GeoJSON circle
function createGeoJSONCircle(center: [number, number], radiusKm: number, points = 64) {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return { type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [coords] }, properties: {} };
}

export default function CoworkMap() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [pins, setPins] = useState<CoworkPin[]>([]);
  const [dropDialog, setDropDialog] = useState<{lat: number; lng: number} | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRoles, setFilterRoles] = useState<Role[]>([]);
  const [filterTimes, setFilterTimes] = useState<TimeSlot[]>([]);
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedPin, setSelectedPin] = useState<CoworkPin | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<WorkPlace | null>(null);
  const [guideOpen, setGuideOpen] = useState(() => !localStorage.getItem('cowork-guide-seen'));
  const [visibleRadius, setVisibleRadius] = useState(2);
  const [places, setPlaces] = useState<WorkPlace[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { showCheckIn, handleStillHere, handleRemove, registerPin } = useExpiryCheckIn();

  const refreshPins = useCallback(async () => {
    const data = await getPins();
    setPins(data);
  }, []);

  const handleLocationSet = useCallback((lat: number, lng: number) => {
    setUserPos([lat, lng]);
    seedDemoPins(lat, lng).then(() => refreshPins());
  }, [refreshPins]);

  // Subscribe to realtime
  useEffect(() => {
    const unsub = subscribeToPins(() => refreshPins());
    return unsub;
  }, [refreshPins]);

  // Update radius circle on map
  const updateRadiusCircle = useCallback((map: mapboxgl.Map, center: [number, number], radiusKm: number) => {
    const circleData = createGeoJSONCircle([center[1], center[0]], radiusKm);
    const source = map.getSource('radius-circle') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(circleData as any);
    }
  }, []);

  // Init map when userPos is set
  useEffect(() => {
    if (!userPos || !mapContainerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userPos[1], userPos[0]],
      zoom: 14,
      minZoom: 12.5,
      attributionControl: false
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: true }), 'top-right');
    map.on('click', (e) => {
      setDropDialog({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    const updateRadius = () => {
      const zoom = map.getZoom();
      const km = Math.round(40000 / 2 ** zoom * 10) / 10;
      const clamped = Math.max(0.5, Math.min(km, 4));
      setVisibleRadius(clamped);
      updateRadiusCircle(map, userPos, clamped);
    };

    map.on('zoomend', updateRadius);

    map.on('load', () => {
      // Add radius circle source + layers
      const initialCircle = createGeoJSONCircle([userPos[1], userPos[0]], 2);
      map.addSource('radius-circle', { type: 'geojson', data: initialCircle as any });
      map.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: {
          'fill-color': 'hsl(210, 70%, 55%)',
          'fill-opacity': 0.06,
        },
      });
      map.addLayer({
        id: 'radius-circle-stroke',
        type: 'line',
        source: 'radius-circle',
        paint: {
          'line-color': 'hsl(210, 70%, 55%)',
          'line-opacity': 0.25,
          'line-width': 1.5,
          'line-dasharray': [4, 3],
        },
      });
      updateRadius();
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPos]);

  useEffect(() => {
    if (userPos && mapRef.current) mapRef.current.flyTo({ center: [userPos[1], userPos[0]], zoom: 14 });
  }, [userPos]);

  const filtered = userPos
    ? filterPins(pins, { roles: filterRoles, timeSlots: filterTimes, interests: filterInterests })
        .filter((p) => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= Math.min(visibleRadius, 4))
    : [];

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtered.forEach((pin) => {
      const el = document.createElement('div');
      el.className = `pin-marker ${pin.timeSlot === 'now' ? 'is-now' : ''}`;
      el.style.backgroundColor = ROLE_HEX[pin.role];
      const role = ROLES.find((r) => r.value === pin.role);
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

  const handlePinAdded = (pinId: string) => {
    registerPin(pinId);
    refreshPins();
  };

  // Show location picker if no position yet
  if (!userPos) {
    return <LocationPicker onLocationSet={handleLocationSet} />;
  }

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

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center gap-2">
        <div className="bg-card rounded-xl shadow-lg border border-border px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
          <span className="text-base sm:text-lg">🗺️</span>
          <h1 className="font-heading font-bold text-foreground text-sm sm:text-base">CoWork Drop</h1>
        </div>
        <div className="bg-card rounded-xl shadow-lg border border-border px-2 sm:px-3 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{filtered.length}</span>
          <span className="text-border">|</span>
          <Radar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{visibleRadius < 1 ? `${Math.round(visibleRadius * 1000)}m` : `${visibleRadius.toFixed(1)}km`}</span>
        </div>
      </motion.div>

      <div className="absolute bottom-20 sm:bottom-4 left-4 z-[1000] flex items-center gap-2">
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
        <FilterPanel open={filterOpen} onToggle={() => setFilterOpen((v) => !v)} onClose={() => setFilterOpen(false)} roles={filterRoles} timeSlots={filterTimes} interests={filterInterests} onRolesChange={setFilterRoles} onTimeSlotsChange={setFilterTimes} onInterestsChange={setFilterInterests} />
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
        <Button onClick={() => userPos && setDropDialog({ lat: userPos[0], lng: userPos[1] })} size="lg" className="pointer-events-auto h-12 sm:h-14 px-6 sm:px-7 rounded-lg shadow-xl font-heading font-semibold text-sm sm:text-base gap-2 sm:gap-2.5">
          <Plus className="h-5 w-5" />
          Drop a pin
        </Button>
      </motion.div>

      {dropDialog && <DropPinDialog open={!!dropDialog} onClose={() => setDropDialog(null)} lat={dropDialog.lat} lng={dropDialog.lng} onPinAdded={handlePinAdded} />}
      <UsageGuide open={guideOpen} onClose={handleGuideClose} />
      <ExpiryCheckIn open={showCheckIn} onStillHere={handleStillHere} onRemove={handleRemove} />
    </div>
  );
}

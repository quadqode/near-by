import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibjFuamEiLCJhIjoiY21taHl5Nm1iMDk0ODJwczc5cG85dnRmaiJ9.j5teJQde50Xj19Zu7q9Jrw';
import { CoworkPin, Role, TimeSlot, ROLES } from '@/lib/types';
import type { UserIntent } from './LocationPicker';
import { WorkPlace } from '@/lib/placeTypes';
import { PLACE_TYPE_META } from '@/lib/placeTypes';
import { getPins, filterPins, getDistance, subscribeToPins, fuzzyLocation } from '@/lib/pinStore';
import { useAuth } from '@/contexts/AuthContext';
import DropPinDialog from './DropPinDialog';
import FilterPanel from './FilterPanel';
import PinListView from './PinListView';
import PinDetailPanel from './PinDetailPanel';
import PlaceDetailPanel from './PlaceDetailPanel';
import SplashScreen from './SplashScreen';
import UsageGuide from './UsageGuide';
import IntentPicker from './IntentPicker';
import LocationPicker from './LocationPicker';
import ExpiryCheckIn, { useExpiryCheckIn } from './ExpiryCheckIn';
import PostSessionFeedback from './PostSessionFeedback';
import OfferBanner from './OfferBanner';
import HiRequestsPanel from './HiRequestsPanel';
import { Button } from '@/components/ui/button';
import { Plus, Users, Map, List, HelpCircle, Radar, SlidersHorizontal, MapPin, Store, User, Bell, Search, X } from 'lucide-react';
import BottomNav from './BottomNav';
import LocationAutocomplete from './LocationAutocomplete';
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
  const distanceX = radiusKm / (111.32 * Math.cos(center[1] * Math.PI / 180));
  const distanceY = radiusKm / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = i / points * (2 * Math.PI);
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return { type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [coords] }, properties: {} };
}

export default function CoworkMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPos, setUserPos] = useState<[number, number] | null>(() => {
    const stored = localStorage.getItem('cowork-user-pos');
    if (stored) {
      try { const [lat, lng] = JSON.parse(stored); return [lat, lng]; } catch { return null; }
    }
    return null;
  });
  const [pins, setPins] = useState<CoworkPin[]>([]);
  const [dropDialog, setDropDialog] = useState<{lat: number;lng: number;} | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRoles, setFilterRoles] = useState<Role[]>([]);
  const [filterTimes, setFilterTimes] = useState<TimeSlot[]>([]);
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedPin, setSelectedPin] = useState<CoworkPin | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<WorkPlace | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('cowork-splash-seen'));
  const [intentPickerOpen, setIntentPickerOpen] = useState(false);
  const [userIntents, setUserIntents] = useState<UserIntent[]>(() => {
    const stored = localStorage.getItem('cowork-user-intents');
    return stored ? JSON.parse(stored) : ['food', 'cowork', 'people'];
  });
  const [visibleRadius, setVisibleRadius] = useState(2);
  const [places, setPlaces] = useState<WorkPlace[]>([]);
  const [offersOnly, setOffersOnly] = useState(false);
  const [hiPanelOpen, setHiPanelOpen] = useState(false);
  const [hiRequestCount, setHiRequestCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [expiredPinId, setExpiredPinId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const placeMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const userPosRef = useRef(userPos);

  const { showCheckIn, handleStillHere, handleRemove, registerPin } = useExpiryCheckIn();

  const refreshPins = useCallback(async () => {
    const data = await getPins();
    setPins(data);
  }, []);

  const handleLocationSet = useCallback((lat: number, lng: number, intents?: UserIntent[]) => {
    setUserPos([lat, lng]);
    localStorage.setItem('cowork-user-pos', JSON.stringify([lat, lng]));
    if (intents) setUserIntents(intents);
    // Places will come from real data - no demo places
    refreshPins();
  }, [refreshPins]);

  // Load pins when restoring position from localStorage
  useEffect(() => {
    if (userPos) {
      refreshPins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Keep ref in sync
  useEffect(() => { userPosRef.current = userPos; }, [userPos]);

  // Init map ONCE when userPos is first available
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
    
    const geolocateControl = new mapboxgl.GeolocateControl({ 
      trackUserLocation: true,
      showUserHeading: true
    });
    map.addControl(geolocateControl, 'top-right');
    
    // Update position and data when user moves
    geolocateControl.on('geolocate', (e: any) => {
      const newPos: [number, number] = [e.coords.latitude, e.coords.longitude];
      setUserPos(newPos);
      localStorage.setItem('cowork-user-pos', JSON.stringify(newPos));
      refreshPins();
    });

    const updateRadius = () => {
      const currentPos = userPosRef.current;
      if (!currentPos) return;
      const zoom = map.getZoom();
      const km = Math.round(20000 / 2 ** zoom * 10) / 10;
      const clamped = Math.max(0.3, Math.min(km, 3));
      setVisibleRadius(clamped);
      updateRadiusCircle(map, currentPos, clamped);
    };

    map.on('zoomend', updateRadius);

    map.on('load', () => {
      const currentPos = userPosRef.current;
      if (!currentPos) return;
      const initialCircle = createGeoJSONCircle([currentPos[1], currentPos[0]], 1.2);
      map.addSource('radius-circle', { type: 'geojson', data: initialCircle as any });
      map.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: {
          'fill-color': 'hsl(243, 75%, 58%)',
          'fill-opacity': 0.12
        }
      });
      map.addLayer({
        id: 'radius-circle-stroke',
        type: 'line',
        source: 'radius-circle',
        paint: {
          'line-color': 'hsl(243, 75%, 50%)',
          'line-opacity': 0.4,
          'line-width': 2.5,
          'line-dasharray': [4, 3]
        }
      });
      updateRadius();
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!userPos]);

  // When userPos changes, fly to new location and update radius circle
  useEffect(() => {
    if (!userPos || !mapRef.current) return;
    const map = mapRef.current;
    map.flyTo({ center: [userPos[1], userPos[0]], zoom: 14 });
    // Update radius circle center
    const zoom = map.getZoom();
    const km = Math.round(20000 / 2 ** zoom * 10) / 10;
    const clamped = Math.max(0.3, Math.min(km, 3));
    setVisibleRadius(clamped);
    updateRadiusCircle(map, userPos, clamped);
  }, [userPos, updateRadiusCircle]);

  const showPeople = userIntents.includes('people');
  const showPlaces = userIntents.includes('food') || userIntents.includes('cowork');

  const filtered = userPos && showPeople ?
  filterPins(pins, { roles: filterRoles, timeSlots: filterTimes, interests: filterInterests }).
  filter((p) => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= visibleRadius) :
  [];

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
      // Use fuzzy location on map for privacy
      const [fLat, fLng] = fuzzyLocation(pin.lat, pin.lng, pin.id);
      const marker = new mapboxgl.Marker({ element: el }).
      setLngLat([fLng, fLat]).
      addTo(map);
      markersRef.current.push(marker);
    });
  }, [filtered]);

  // Update place markers
  const filteredPlaces = userPos && showPlaces ?
  places.filter((p) => {
    const dist = getDistance(userPos[0], userPos[1], p.lat, p.lng);
    if (dist > visibleRadius) return false;
    if (offersOnly && !p.offer) return false;
    const isFoodPlace = p.type === 'other';
    const isWorkPlace = p.type === 'cafe' || p.type === 'coworking' || p.type === 'library';
    if (userIntents.includes('food') && isFoodPlace) return true;
    if (userIntents.includes('cowork') && isWorkPlace) return true;
    return false;
  }) :
  [];

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    placeMarkersRef.current.forEach((m) => m.remove());
    placeMarkersRef.current = [];

    filteredPlaces.forEach((place) => {
      const meta = PLACE_TYPE_META[place.type];
      // Count pins within ~200m of this place
      const nearbyCount = pins.filter(p => getDistance(place.lat, place.lng, p.lat, p.lng) <= 0.2).length;
      const el = document.createElement('div');
      el.className = `place-marker${place.offer ? ' has-offer' : ''}${nearbyCount > 0 ? ' has-activity' : ''}`;
      el.textContent = meta.emoji;
      if (nearbyCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'activity-badge';
        const dot = document.createElement('span');
        dot.className = 'pulse-dot';
        badge.appendChild(dot);
        badge.appendChild(document.createTextNode(`${nearbyCount}`));
        el.appendChild(badge);
      }
      if (place.offer) {
        const tag = document.createElement('span');
        tag.className = 'offer-tag';
        tag.textContent = '🏷️';
        el.appendChild(tag);
      }
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedPlace(place);
      });

      // Hover popup
      el.addEventListener('mouseenter', () => {
        popupRef.current?.remove();
        const amenities: string[] = [];
        if (place.amenities.wifi) amenities.push(`📶 WiFi${place.amenities.wifiSpeed ? ` (${place.amenities.wifiSpeed})` : ''}`);
        if (place.amenities.powerSockets) amenities.push(`🔌 Power${place.amenities.powerSocketsCount ? ` (${place.amenities.powerSocketsCount})` : ''}`);
        if (place.amenities.coffee) amenities.push('☕ Coffee');
        if (place.amenities.food) amenities.push('🍽️ Food');
        if (place.amenities.outdoorSeating) amenities.push('🌤️ Outdoor');
        amenities.push(`🔇 ${place.amenities.quietLevel}`);

        const activityHtml = nearbyCount > 0 
          ? `<div style="margin-top:4px;font-size:11px;font-weight:600;color:hsl(var(--primary));display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:hsl(var(--success));display:inline-block"></span> ${nearbyCount} working here now</div>` 
          : '';

        const html = `<div style="font-family:system-ui;min-width:160px;color:hsl(var(--foreground))">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${meta.emoji} ${place.name}</div>
          <div style="font-size:11px;color:hsl(var(--muted-foreground));margin-bottom:4px">${'⭐'.repeat(Math.round(place.rating))} · ${place.hours}</div>
          <div style="font-size:11px;display:flex;flex-wrap:wrap;gap:4px">${amenities.map(a => `<span style="background:hsl(var(--muted));padding:1px 5px;border-radius:6px">${a}</span>`).join('')}</div>
          ${activityHtml}
          ${place.offer ? `<div style="margin-top:4px;font-size:11px;font-weight:600;color:hsl(var(--primary))">🏷️ ${place.offer}</div>` : ''}
        </div>`;

        const popup = new mapboxgl.Popup({ offset: [0, -8], anchor: 'bottom', closeButton: false, closeOnClick: false, className: 'place-hover-popup' })
          .setLngLat([place.lng, place.lat])
          .setHTML(html)
          .addTo(map);
        popupRef.current = popup;
      });

      el.addEventListener('mouseleave', () => {
        popupRef.current?.remove();
        popupRef.current = null;
      });

      const marker = new mapboxgl.Marker({ element: el }).
      setLngLat([place.lng, place.lat]).
      addTo(map);
      placeMarkersRef.current.push(marker);
    });
  }, [filteredPlaces, pins]);

  const handleGuideClose = () => {
    setGuideOpen(false);
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

  // Show splash screen first time
  if (showSplash) {
    return <SplashScreen onContinue={() => { setShowSplash(false); localStorage.setItem('cowork-splash-seen', '1'); }} />;
  }

  // Show location picker if no position yet
  if (!userPos) {
    return <LocationPicker onLocationSet={handleLocationSet} />;
  }

    const activeFilterCount = filterRoles.length + filterTimes.length + filterInterests.length + (userIntents.length < 3 ? 1 : 0);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div ref={mapContainerRef} className={`h-full w-full transition-opacity duration-300 ${view === 'list' ? 'opacity-0 pointer-events-none absolute' : ''}`} />

      {view === 'map' && <OfferBanner places={filteredPlaces} onPlaceSelect={(place) => setSelectedPlace(place)} />}

      <AnimatePresence>
        {view === 'list' &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background z-[500]">
            <div className="h-full pt-16 pb-20 md:pb-[76px]">
              <PinListView pins={filtered} places={filteredPlaces} userPos={userPos} intents={userIntents} offersOnly={offersOnly} onOffersOnlyChange={setOffersOnly} onPinSelect={handlePinSelect} onPlaceSelect={(place) => setSelectedPlace(place)} />
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {selectedPin &&
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/20 z-[1050]" onClick={() => setSelectedPin(null)} />
            <PinDetailPanel pin={selectedPin} userPos={userPos} onClose={() => setSelectedPin(null)} />
          </>
        }
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlace &&
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/20 z-[1050]" onClick={() => setSelectedPlace(null)} />
            <PlaceDetailPanel place={selectedPlace} userPos={userPos} onClose={() => setSelectedPlace(null)} />
          </>
        }
      </AnimatePresence>

      {/* Top bar */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-card rounded-xl shadow-lg border border-border px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
            <span className="text-base sm:text-lg">🗺️</span>
            <h1 className="font-heading font-bold text-foreground text-sm sm:text-base">NearBy</h1>
          </div>
          <div className="bg-card rounded-xl shadow-lg border border-border px-2 sm:px-3 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2">
            {showPeople && (
              <>
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{filtered.length}</span>
              </>
            )}
            {showPeople && showPlaces && <span className="text-border">|</span>}
            {showPlaces && (
              <>
                <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{filteredPlaces.length}</span>
              </>
            )}
            <span className="text-border">|</span>
            <Radar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">{visibleRadius < 1 ? `${Math.round(visibleRadius * 1000)}m` : `${visibleRadius.toFixed(1)}km`}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="bg-card shadow-lg border-border h-9 w-9 rounded-xl"
              onClick={() => setSearchOpen(v => !v)}
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
            {user && (
              <div className="relative">
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-card shadow-lg border-border h-9 w-9 rounded-xl"
                  onClick={() => setHiPanelOpen(true)}
                >
                  <Bell className="h-4 w-4" />
                </Button>
                {hiRequestCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {hiRequestCount}
                  </span>
                )}
              </div>
            )}
            {/* Profile button - desktop only, mobile uses bottom nav */}
            <Button
              size="icon"
              variant="outline"
              className="bg-card shadow-lg border-border h-9 w-9 rounded-xl hidden md:flex"
              onClick={() => navigate(user ? '/profile' : '/auth')}
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <LocationAutocomplete
                placeholder="Search a place in Delhi…"
                proximity={userPos || undefined}
                autoFocus
                className="w-full"
                onSelect={(lat, lng) => {
                  handleLocationSet(lat, lng);
                  setSearchOpen(false);
                  if (mapRef.current) {
                    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Desktop bottom controls */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden md:flex items-center gap-2">
        <div className="bg-card rounded-xl shadow-lg border border-border p-1 flex">
          <Button size="icon" variant={view === 'map' ? 'default' : 'ghost'} className="h-9 w-9 rounded-lg" onClick={() => setView('map')}>
            <Map className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={view === 'list' ? 'default' : 'ghost'} className="h-9 w-9 rounded-lg" onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button size="icon" variant="outline" className="bg-card shadow-lg border-border h-11 w-11 rounded-xl" onClick={() => setGuideOpen(true)}>
          <HelpCircle className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button size="icon" variant="outline" className="relative bg-card shadow-lg border-border h-11 w-11 rounded-xl" onClick={() => setIntentPickerOpen(v => !v)}>
            <SlidersHorizontal className="h-4 w-4" />
            {userIntents.length < 3 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {userIntents.length}
              </span>
            )}
          </Button>
          <IntentPicker
            open={intentPickerOpen}
            intents={userIntents}
            onToggle={(v) => {
              const next = userIntents.includes(v) ? userIntents.filter(i => i !== v) : [...userIntents, v];
              setUserIntents(next);
              localStorage.setItem('cowork-user-intents', JSON.stringify(next));
            }}
            onClose={() => setIntentPickerOpen(false)}
          />
        </div>
        <FilterPanel open={filterOpen} onToggle={() => setFilterOpen((v) => !v)} onClose={() => setFilterOpen(false)} roles={filterRoles} timeSlots={filterTimes} interests={filterInterests} onRolesChange={setFilterRoles} onTimeSlotsChange={setFilterTimes} onInterestsChange={setFilterInterests} />
      </div>

      {/* Desktop drop pin button */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="absolute bottom-4 sm:bottom-8 right-4 sm:left-0 sm:right-0 z-[1000] hidden md:flex justify-center pointer-events-none">
        <Button onClick={() => userPos && setDropDialog({ lat: userPos[0], lng: userPos[1] })} size="lg" className="pointer-events-auto h-14 px-7 rounded-xl shadow-xl font-heading font-semibold text-base gap-2.5">
          <Plus className="h-5 w-5" />
          Drop a pin
        </Button>
      </motion.div>

      {/* Mobile bottom nav */}
      <BottomNav
        view={view}
        onViewChange={setView}
        onDropPin={() => userPos && setDropDialog({ lat: userPos[0], lng: userPos[1] })}
        onHelpOpen={() => setGuideOpen(true)}
        activeFilters={activeFilterCount}
      />

      {/* Mobile-only filter/intent panels anchored above bottom nav */}
      <div className="md:hidden">
        <IntentPicker
          open={intentPickerOpen}
          intents={userIntents}
          onToggle={(v) => {
            const next = userIntents.includes(v) ? userIntents.filter(i => i !== v) : [...userIntents, v];
            setUserIntents(next);
            localStorage.setItem('cowork-user-intents', JSON.stringify(next));
          }}
          onClose={() => setIntentPickerOpen(false)}
        />
        <FilterPanel
          open={filterOpen}
          onToggle={() => setFilterOpen(v => !v)}
          onClose={() => setFilterOpen(false)}
          roles={filterRoles}
          timeSlots={filterTimes}
          interests={filterInterests}
          onRolesChange={setFilterRoles}
          onTimeSlotsChange={setFilterTimes}
          onInterestsChange={setFilterInterests}
        />
      </div>

      {dropDialog && <DropPinDialog open={!!dropDialog} onClose={() => setDropDialog(null)} lat={dropDialog.lat} lng={dropDialog.lng} onPinAdded={handlePinAdded} />}
      <UsageGuide open={guideOpen} onClose={handleGuideClose} />
      <HiRequestsPanel open={hiPanelOpen} onClose={() => setHiPanelOpen(false)} onRequestCount={setHiRequestCount} />
      <ExpiryCheckIn open={showCheckIn} onStillHere={handleStillHere} onRemove={() => {
        handleRemove();
        // Show feedback after pin removal
        const raw = localStorage.getItem('cowork-my-pin-id');
        if (raw) {
          try {
            const { id } = JSON.parse(raw);
            setExpiredPinId(id);
            setFeedbackOpen(true);
          } catch {}
        }
      }} />
      {feedbackOpen && expiredPinId && (
        <PostSessionFeedback open={feedbackOpen} onClose={() => { setFeedbackOpen(false); setExpiredPinId(null); }} pinId={expiredPinId} />
      )}
    </div>);

}
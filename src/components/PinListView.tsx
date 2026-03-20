import { useState } from 'react';
import { CoworkPin, ROLES } from '@/lib/types';
import { WorkPlace, PLACE_TYPE_META } from '@/lib/placeTypes';
import { getDistance } from '@/lib/pinStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Wifi, Plug, Volume2, Coffee, Tag, Store, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserIntent } from './LocationPicker';
import RegisterPlaceDialog from './RegisterPlaceDialog';

type ViewFilter = 'all' | 'people' | 'places';
type PlaceSubFilter = 'all' | 'cafe' | 'food';

interface Props {
  pins: CoworkPin[];
  places: WorkPlace[];
  userPos: [number, number];
  intents: UserIntent[];
  offersOnly: boolean;
  onOffersOnlyChange: (v: boolean) => void;
  onPinSelect: (pin: CoworkPin) => void;
  onPlaceSelect: (place: WorkPlace) => void;
}

type ListItem =
{kind: 'pin';data: CoworkPin;dist: number;} |
{kind: 'place';data: WorkPlace;dist: number;};

function distLabel(dist: number) {
  return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
}

function PinCard({ pin, dist, onClick }: {pin: CoworkPin;dist: number;onClick: () => void;}) {
  const role = ROLES.find((r) => r.value === pin.role);
  const isNow = pin.timeSlot === 'now';

  return (
    <div
      className="flex items-start gap-3.5 cursor-pointer group"
      tabIndex={0}
      role="button"
      aria-label={`${pin.role} pin, ${distLabel(dist)} away`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 shadow-sm"
        style={{ background: `hsl(var(--pin-${pin.role}) / 0.15)`, border: `2px solid hsl(var(--pin-${pin.role}) / 0.3)` }}>
        
        {role?.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-heading font-semibold text-sm text-foreground capitalize group-hover:text-primary transition-colors">{pin.role}</span>
            {isNow &&
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success-foreground))] animate-pulse" />
                NOW
              </span>
            }
          </div>
          <span className="text-xs font-semibold text-primary shrink-0">{distLabel(dist)}</span>
        </div>
        {pin.message &&
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">"{pin.message}"</p>
        }
        {pin.interests.length > 0 &&
        <div className="flex flex-wrap gap-1.5 mt-2">
            {pin.interests.map((i) =>
          <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent/50 text-accent-foreground border border-border/50">{i}</span>
          )}
          </div>
        }
        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Expires {new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>);

}

function PlaceCard({ place, dist, onClick }: {place: WorkPlace;dist: number;onClick: () => void;}) {
  const meta = PLACE_TYPE_META[place.type];

  return (
    <div
      className="flex items-start gap-3.5 cursor-pointer group"
      tabIndex={0}
      role="button"
      aria-label={`${place.name}, ${distLabel(dist)} away`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-sm border-2 ${
        place.offer ?
        'bg-[hsl(35_90%_55%_/_0.12)] border-[hsl(35_90%_55%_/_0.35)]' :
        'bg-accent/40 border-accent-foreground/15'}`
        }>
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{place.name}</span>
          <span className="text-xs font-semibold text-primary shrink-0">{distLabel(dist)}</span>
        </div>
        {place.offer &&
        <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg bg-[hsl(35_90%_55%_/_0.08)] border border-[hsl(35_90%_55%_/_0.2)] w-fit">
            <Tag className="h-3 w-3 text-[hsl(35_90%_50%)]" />
            <span className="text-[10px] font-semibold text-[hsl(35_80%_35%)]">{place.offer}</span>
          </div>
        }
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent/50 text-accent-foreground border border-border/50">{meta.label}</span>
          <span className="text-[10px] text-muted-foreground">⭐ {place.rating}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          {place.amenities.wifi && <span className="flex items-center gap-0.5"><Wifi className="h-3 w-3" /> WiFi</span>}
          {place.amenities.powerSockets && <span className="flex items-center gap-0.5"><Plug className="h-3 w-3" /> Power</span>}
          {place.amenities.coffee && <span className="flex items-center gap-0.5"><Coffee className="h-3 w-3" /> Coffee</span>}
          <span className="flex items-center gap-0.5"><Volume2 className="h-3 w-3" /> {place.amenities.quietLevel}</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />{place.hours}
        </div>
      </div>
    </div>);

}

export default function PinListView({ pins, places, userPos, intents, offersOnly, onOffersOnlyChange, onPinSelect, onPlaceSelect }: Props) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [placeSubFilter, setPlaceSubFilter] = useState<PlaceSubFilter>('all');
  const [registerOpen, setRegisterOpen] = useState(false);

  // Determine which categories are available based on intents
  const hasPeople = intents.includes('people');
  const hasFood = intents.includes('food');
  const hasCowork = intents.includes('cowork');
  const hasPlaces = hasFood || hasCowork;
  const multipleCategories = hasPeople && hasPlaces;
  // Show place sub-filters when both food and cowork intents are active (or when viewing places in multi-category mode)
  const showPlaceSubFilter = hasFood && hasCowork;

  const items: ListItem[] = [];

  if (hasPeople && viewFilter !== 'places') {
    pins.forEach((p) => {
      const dist = getDistance(userPos[0], userPos[1], p.lat, p.lng);
      if (dist <= 4) items.push({ kind: 'pin', data: p, dist }); // already filtered by parent
    });
  }
  if (hasPlaces && viewFilter !== 'people') {
    places.forEach((p) => {
      const dist = getDistance(userPos[0], userPos[1], p.lat, p.lng);
      if (dist <= 4) {
        // Apply place sub-filter
        if (placeSubFilter === 'cafe' && p.type === 'other') return;
        if (placeSubFilter === 'food' && p.type !== 'other') return;
        items.push({ kind: 'place', data: p, dist });
      }
    });
  }

  items.sort((a, b) => a.dist - b.dist);

  const mainFilters: {value: ViewFilter;label: string;emoji: string;}[] = [
  { value: 'all', label: 'All', emoji: '🔍' },
  { value: 'people', label: 'People', emoji: '👤' },
  { value: 'places', label: 'Places', emoji: '📍' }];


  const placeFilters: {value: PlaceSubFilter;label: string;emoji: string;}[] = [
  { value: 'all', label: 'All Places', emoji: '📍' },
  { value: 'cafe', label: 'Cafés & Cowork', emoji: '☕' },
  { value: 'food', label: 'Food Places', emoji: '🍽️' }];

  const hasPlacesVisible = hasPlaces && viewFilter !== 'people';


  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main category filter tabs */}
      {multipleCategories &&
      <div className="px-4 pt-5 pb-2 gap-1.5 border-b border-border/50 flex items-center justify-start py-[12px]">
          {mainFilters.map((f) =>
        <button
          key={f.value}
          onClick={() => setViewFilter(f.value)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
          viewFilter === f.value ?
          'bg-primary text-primary-foreground border-primary shadow-sm' :
          'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'}`
          }>
          
              <span>{f.emoji}</span>
              {f.label}
            </button>
        )}
        </div>
      }

      {/* Place sub-filter (cafés vs food) — show when places are visible and both intents active */}
      {showPlaceSubFilter && viewFilter !== 'people' &&
      <div className="px-4 py-3 gap-1.5 border-b border-border/50 flex items-center justify-start">
          {placeFilters.map((f) =>
        <button
          key={f.value}
          onClick={() => setPlaceSubFilter(f.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
          placeSubFilter === f.value ?
          'bg-accent text-accent-foreground border-primary/40 shadow-sm' :
          'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'}`
          }>
          
              <span>{f.emoji}</span>
              {f.label}
            </button>
        )}
        </div>
      }

      {/* Offers toggle */}
      {hasPlacesVisible











      }

      {items.length === 0 ?
      <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-heading font-semibold text-muted-foreground">Nothing nearby</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different filter or drop a pin!</p>
        </div> :

      <ScrollArea className="flex-1">
          <div className="p-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {items.map((item, idx) =>
          <motion.div
            key={item.kind === 'pin' ? `pin-${item.data.id}` : `place-${item.data.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all">
            
                {item.kind === 'pin' ?
            <PinCard pin={item.data} dist={item.dist} onClick={() => onPinSelect(item.data)} /> :

            <PlaceCard place={item.data} dist={item.dist} onClick={() => onPlaceSelect(item.data)} />
            }
              </motion.div>
          )}
            {/* Register place card — show when only places intents are active */}
            {hasPlaces && viewFilter === 'places' &&
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: items.length * 0.03 }}
            className="bg-card border border-dashed border-primary/30 rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setRegisterOpen(true)}>
            
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-sm border-2 bg-primary/10 border-primary/30">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-semibold text-sm text-foreground">Your Place Here</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        BE NEXT
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">Get your café or restaurant listed on CoWork Drop</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent/50 text-accent-foreground border border-border/50">Register</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-semibold">
                      <Send className="h-3 w-3" /> Tap to submit your place →
                    </div>
                  </div>
                </div>
              </motion.div>
          }
          </div>
        </ScrollArea>
      }

      <RegisterPlaceDialog open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>);

}
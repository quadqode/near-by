import { useState } from 'react';
import { CoworkPin, ROLES } from '@/lib/types';
import { WorkPlace, PLACE_TYPE_META } from '@/lib/placeTypes';
import { getDistance } from '@/lib/pinStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Wifi, Plug, Volume2, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

type ViewFilter = 'all' | 'people' | 'places';

interface Props {
  pins: CoworkPin[];
  places: WorkPlace[];
  userPos: [number, number];
  onPinSelect: (pin: CoworkPin) => void;
  onPlaceSelect: (place: WorkPlace) => void;
}

type ListItem =
  | { kind: 'pin'; data: CoworkPin; dist: number }
  | { kind: 'place'; data: WorkPlace; dist: number };

function distLabel(dist: number) {
  return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
}

function PinCard({ pin, dist, onClick }: { pin: CoworkPin; dist: number; onClick: () => void }) {
  const role = ROLES.find(r => r.value === pin.role);
  const isNow = pin.timeSlot === 'now';

  return (
    <div className="flex items-start gap-3 cursor-pointer group" onClick={onClick}>
      {/* Circular marker for people */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2 border-primary/30"
        style={{ background: `hsl(var(--pin-${pin.role}) / 0.18)` }}
      >
        {role?.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-heading font-semibold text-sm text-foreground capitalize group-hover:text-primary transition-colors">{pin.role}</span>
            {isNow && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success-foreground))] animate-pulse" />
                NOW
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-primary shrink-0">{distLabel(dist)}</span>
        </div>
        {pin.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">"{pin.message}"</p>
        )}
        {pin.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {pin.interests.map(i => (
              <Badge key={i} variant="outline" className="text-[10px] font-normal border-border/60">{i}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/50">
          <Clock className="h-3 w-3" />
          Expires {new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function PlaceCard({ place, dist, onClick }: { place: WorkPlace; dist: number; onClick: () => void }) {
  const meta = PLACE_TYPE_META[place.type];

  return (
    <div className="flex items-start gap-3 cursor-pointer group" onClick={onClick}>
      {/* Square marker for places */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border-2 border-accent/40 bg-muted/60">
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{place.name}</span>
          <span className="text-xs font-semibold text-primary shrink-0">{distLabel(dist)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[10px] font-normal border-border/60 px-1.5 py-0">{meta.label}</Badge>
          <span className="text-[10px] text-muted-foreground">⭐ {place.rating}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
          {place.amenities.wifi && <span className="flex items-center gap-0.5"><Wifi className="h-3 w-3" /> WiFi</span>}
          {place.amenities.powerSockets && <span className="flex items-center gap-0.5"><Plug className="h-3 w-3" /> Power</span>}
          {place.amenities.coffee && <span className="flex items-center gap-0.5"><Coffee className="h-3 w-3" /> Coffee</span>}
          <span className="flex items-center gap-0.5"><Volume2 className="h-3 w-3" /> {place.amenities.quietLevel}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/50">
          <Clock className="h-3 w-3" />{place.hours}
        </div>
      </div>
    </div>
  );
}

export default function PinListView({ pins, places, userPos, onPinSelect, onPlaceSelect }: Props) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');

  // Build combined list
  const items: ListItem[] = [];

  if (viewFilter !== 'places') {
    pins.forEach(p => {
      const dist = getDistance(userPos[0], userPos[1], p.lat, p.lng);
      if (dist <= 4) items.push({ kind: 'pin', data: p, dist });
    });
  }
  if (viewFilter !== 'people') {
    places.forEach(p => {
      const dist = getDistance(userPos[0], userPos[1], p.lat, p.lng);
      if (dist <= 4) items.push({ kind: 'place', data: p, dist });
    });
  }

  items.sort((a, b) => a.dist - b.dist);

  const filters: { value: ViewFilter; label: string; emoji: string }[] = [
    { value: 'all', label: 'All', emoji: '🔍' },
    { value: 'people', label: 'People', emoji: '👤' },
    { value: 'places', label: 'Places', emoji: '📍' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex gap-1.5">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setViewFilter(f.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewFilter === f.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nothing nearby</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different filter or drop a pin!</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {items.map((item, idx) => (
              <motion.div
                key={item.kind === 'pin' ? `pin-${item.data.id}` : `place-${item.data.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all"
              >
                {item.kind === 'pin' ? (
                  <PinCard pin={item.data} dist={item.dist} onClick={() => onPinSelect(item.data)} />
                ) : (
                  <PlaceCard place={item.data} dist={item.dist} onClick={() => onPlaceSelect(item.data)} />
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

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

export default function PinListView({ pins, places, userPos, onPinSelect, onPlaceSelect }: Props) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');

  const sortedPins = [...pins]
    .filter(p => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= 4)
    .sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng));

  const sortedPlaces = [...places]
    .filter(p => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= 4)
    .sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng));

  const showPins = viewFilter === 'all' || viewFilter === 'people';
  const showPlaces = viewFilter === 'all' || viewFilter === 'places';
  const isEmpty = (showPins ? sortedPins.length : 0) + (showPlaces ? sortedPlaces.length : 0) === 0;

  const filters: { value: ViewFilter; label: string; emoji: string }[] = [
    { value: 'all', label: 'All', emoji: '🔍' },
    { value: 'people', label: 'People', emoji: '👤' },
    { value: 'places', label: 'Places', emoji: '📍' },
  ];

  const distLabel = (lat: number, lng: number) => {
    const dist = getDistance(userPos[0], userPos[1], lat, lng);
    return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs */}
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

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nothing nearby</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different filter or drop a pin!</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2.5">
            {/* Places section */}
            {showPlaces && sortedPlaces.length > 0 && (
              <>
                {viewFilter === 'all' && (
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-1">Places</p>
                )}
                {sortedPlaces.map((place, idx) => {
                  const meta = PLACE_TYPE_META[place.type];
                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => onPlaceSelect(place)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center text-lg shrink-0 border border-border/50">
                            {meta.emoji}
                          </div>
                          <div>
                            <span className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {place.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] font-normal border-border/60 px-1.5 py-0">
                                {meta.label}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">⭐ {place.rating}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-primary shrink-0">{distLabel(place.lat, place.lng)}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                        {place.amenities.wifi && (
                          <span className="flex items-center gap-0.5"><Wifi className="h-3 w-3" /> WiFi</span>
                        )}
                        {place.amenities.powerSockets && (
                          <span className="flex items-center gap-0.5"><Plug className="h-3 w-3" /> Power</span>
                        )}
                        {place.amenities.coffee && (
                          <span className="flex items-center gap-0.5"><Coffee className="h-3 w-3" /> Coffee</span>
                        )}
                        <span className="flex items-center gap-0.5"><Volume2 className="h-3 w-3" /> {place.amenities.quietLevel}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/50">
                        <Clock className="h-3 w-3" />
                        {place.hours}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}

            {/* People section */}
            {showPins && sortedPins.length > 0 && (
              <>
                {viewFilter === 'all' && (
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-2">People</p>
                )}
                {sortedPins.map((pin, idx) => {
                  const role = ROLES.find(r => r.value === pin.role);
                  const isNow = pin.timeSlot === 'now';

                  return (
                    <motion.div
                      key={pin.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => onPinSelect(pin)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ background: `hsl(var(--pin-${pin.role}) / 0.15)` }}
                          >
                            {role?.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-semibold text-sm text-foreground capitalize group-hover:text-primary transition-colors">{pin.role}</span>
                              {isNow && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success-foreground))] animate-pulse" />
                                  NOW
                                </span>
                              )}
                            </div>
                            {pin.message && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">"{pin.message}"</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-primary shrink-0">{distLabel(pin.lat, pin.lng)}</span>
                      </div>

                      {pin.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {pin.interests.map(i => (
                            <Badge key={i} variant="outline" className="text-[10px] font-normal border-border/60">
                              {i}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground/50">
                        <Clock className="h-3 w-3" />
                        Expires {new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

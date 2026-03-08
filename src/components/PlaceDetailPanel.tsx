import { useState } from 'react';
import { WorkPlace, PLACE_TYPE_META } from '@/lib/placeTypes';
import { getDistance } from '@/lib/pinStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Navigation, ExternalLink, Wifi, WifiOff, Plug, Volume2, Star, Clock, Armchair, Sun, Coffee, UtensilsCrossed, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  place: WorkPlace;
  userPos: [number, number];
  onClose: () => void;
}

export default function PlaceDetailPanel({ place, userPos, onClose }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const meta = PLACE_TYPE_META[place.type];
  const dist = getDistance(userPos[0], userPos[1], place.lat, place.lng);
  const distLabel = dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)}km away`;

  const handleGetDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
  };

  const a = place.amenities;

  const amenityItems = [
    { icon: a.wifi ? Wifi : WifiOff, label: a.wifi ? `WiFi${a.wifiSpeed ? ` (${a.wifiSpeed})` : ''}` : 'No WiFi', good: a.wifi },
    { icon: Plug, label: a.powerSockets ? `Outlets: ${a.powerSocketsCount || 'available'}` : 'No outlets', good: a.powerSockets },
    { icon: Volume2, label: `Noise: ${a.quietLevel}`, good: a.quietLevel === 'quiet' || a.quietLevel === 'silent' },
    { icon: Armchair, label: `Seating: ${a.seating}`, good: a.seating !== 'limited' },
    ...(a.outdoorSeating ? [{ icon: Sun, label: 'Outdoor seating', good: true }] : []),
    ...(a.coffee ? [{ icon: Coffee, label: 'Coffee', good: true }] : []),
    ...(a.food ? [{ icon: UtensilsCrossed, label: 'Food available', good: true }] : []),
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-card z-[1100] border-l border-border shadow-2xl flex flex-col"
    >
      {/* Photo carousel */}
      <div className="relative w-full aspect-[16/10] bg-muted shrink-0">
        <img
          src={place.photos[photoIdx]}
          alt={`${place.name} photo ${photoIdx + 1}`}
          className="w-full h-full object-cover"
        />
        {place.photos.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIdx(i => (i - 1 + place.photos.length) % place.photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-foreground/50 text-background flex items-center justify-center hover:bg-foreground/70 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPhotoIdx(i => (i + 1) % place.photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-foreground/50 text-background flex items-center justify-center hover:bg-foreground/70 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {place.photos.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === photoIdx ? 'bg-background' : 'bg-background/40'}`}
                />
              ))}
            </div>
          </>
        )}
        <Button size="icon" variant="ghost" onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-foreground/40 hover:bg-foreground/60 text-background">
          <X className="h-4 w-4" />
        </Button>
        <Badge className="absolute top-3 left-3 bg-foreground/60 text-background border-0 text-[11px]">
          {meta.emoji} {meta.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Name & rating */}
        <div>
          <h2 className="font-heading font-bold text-lg text-foreground">{place.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[hsl(var(--pin-writer))] fill-[hsl(var(--pin-writer))]" />
              <span className="text-sm font-semibold text-foreground">{place.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{distLabel}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {place.hours}
            </div>
          </div>
        </div>

        {/* Offer banner */}
        {place.offer && (
          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-[hsl(35_90%_55%_/_0.08)] border border-[hsl(35_90%_55%_/_0.2)]">
            <Tag className="h-4 w-4 text-[hsl(35_90%_50%)] shrink-0" />
            <span className="text-xs font-semibold text-[hsl(35_80%_35%)]">{place.offer}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>

        {/* Amenities grid */}
        <div>
          <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5">Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {amenityItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-xl p-3 border ${
                  item.good
                    ? 'bg-[hsl(var(--success)_/_0.06)] border-[hsl(var(--success)_/_0.15)]'
                    : 'bg-muted/10 border-border/50'
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${item.good ? 'text-[hsl(var(--success))]' : 'text-muted-foreground/50'}`} />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <button
          onClick={handleGetDirections}
          className="w-full bg-accent/40 hover:bg-accent/60 rounded-xl p-3.5 flex items-center gap-3 transition-colors group border border-border/50"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Navigation className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Get Directions</p>
            <p className="text-xs font-medium text-foreground truncate">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Bottom action */}
      <div className="px-5 py-4 border-t border-border">
        <Button className="w-full font-heading font-semibold h-11 rounded-xl gap-2" onClick={handleGetDirections}>
          <Navigation className="h-4 w-4" /> Get Directions
        </Button>
      </div>
    </motion.div>
  );
}

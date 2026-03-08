import { CoworkPin, ROLES } from '@/lib/types';
import { getDistance } from '@/lib/pinStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  pins: CoworkPin[];
  userPos: [number, number];
  onPinSelect: (pin: CoworkPin) => void;
}

export default function PinListView({ pins, userPos, onPinSelect }: Props) {
  const sorted = [...pins]
    .filter(p => getDistance(userPos[0], userPos[1], p.lat, p.lng) <= 4)
    .sort((a, b) => {
      const da = getDistance(userPos[0], userPos[1], a.lat, a.lng);
      const db = getDistance(userPos[0], userPos[1], b.lat, b.lng);
      return da - db;
    });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
        <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No pins nearby</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Drop the first pin to get started!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2.5">
        {sorted.map((pin, idx) => {
          const role = ROLES.find(r => r.value === pin.role);
          const dist = getDistance(userPos[0], userPos[1], pin.lat, pin.lng);
          const distLabel = dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
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
                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-primary">{distLabel}</span>
                </div>
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
      </div>
    </ScrollArea>
  );
}

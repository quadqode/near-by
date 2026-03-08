import { useState } from 'react';
import { CoworkPin, ROLES, TIME_SLOTS } from '@/lib/types';
import { getDistance, sayHi } from '@/lib/pinStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, MapPin, Navigation, MessageCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const ROLE_HEX: Record<string, string> = {
  designer: '#7c3aed',
  developer: '#1a9a7a',
  writer: '#d97706',
  marketer: '#d9365b',
  other: '#6b8299',
};

interface Props {
  pin: CoworkPin;
  userPos: [number, number];
  onClose: () => void;
}

export default function PinDetailPanel({ pin, userPos, onClose }: Props) {
  const [hiSent, setHiSent] = useState(false);
  const [sending, setSending] = useState(false);
  const role = ROLES.find(r => r.value === pin.role);
  const timeSlot = TIME_SLOTS.find(t => t.value === pin.timeSlot);
  const dist = getDistance(userPos[0], userPos[1], pin.lat, pin.lng);
  const distLabel = dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)}km away`;
  const isNow = pin.timeSlot === 'now';

  const handleSayHi = async () => {
    setSending(true);
    const ok = await sayHi(pin.id);
    setSending(false);
    if (ok) {
      setHiSent(true);
      toast({ title: '👋 Hi sent!', description: 'They know you\'re interested.' });
    } else {
      toast({ title: 'Oops', description: 'Could not send hi. Try again.', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-card z-[1100] border-l border-border shadow-2xl flex flex-col"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ background: ROLE_HEX[pin.role] }} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="font-heading font-bold text-sm text-foreground">Pin Details</span>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-lg">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Role + status */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${ROLE_HEX[pin.role]}20` }}
          >
            {role?.emoji}
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground capitalize">{pin.role}</h2>
            <div className="flex items-center gap-2 mt-1">
              {isNow && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--success-foreground))] animate-pulse" />
                  HERE NOW
                </span>
              )}
              {!isNow && timeSlot && (
                <Badge variant="secondary" className="text-xs">
                  {timeSlot.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {pin.message && (
          <div className="bg-secondary rounded-xl p-4">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">"{pin.message}"</p>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-xl p-4">
            <Navigation className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="font-heading font-semibold text-sm text-foreground mt-0.5">{distLabel}</p>
          </div>
          <div className="bg-secondary rounded-xl p-4">
            <Clock className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Expires</p>
            <p className="font-heading font-semibold text-sm text-foreground mt-0.5">
              {new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Interests */}
        {pin.interests.length > 0 && (
          <div>
            <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Open to</h3>
            <div className="flex flex-wrap gap-2">
              {pin.interests.map(i => (
                <Badge key={i} variant="outline" className="text-xs rounded-lg px-3 py-1.5">
                  {i}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Location</h3>
          <div className="bg-secondary rounded-xl p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Coordinates</p>
              <p className="text-sm font-medium text-foreground">{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Posted time */}
        <div className="text-xs text-muted-foreground/60 text-center pt-2">
          Dropped {new Date(pin.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-6 py-4 border-t border-border">
        <Button className="w-full font-heading font-semibold h-12 rounded-xl gap-2" size="lg">
          <span>👋</span> Say Hi
        </Button>
      </div>
    </motion.div>
  );
}

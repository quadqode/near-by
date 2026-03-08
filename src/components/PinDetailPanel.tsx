import { useState } from 'react';
import { CoworkPin, ROLES, TIME_SLOTS } from '@/lib/types';
import { getDistance, sayHi, fuzzyLocation } from '@/lib/pinStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, MapPin, Navigation, MessageCircle, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

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

  const handleGetDirections = () => {
    const destination = `${pin.lat},${pin.lng}`;
    // Google Maps URL works on both Android and iOS — opens native app if installed
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-card z-[1100] border-l border-border shadow-2xl flex flex-col"
    >
      {/* Header with role color accent */}
      <div className="relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `hsl(var(--pin-${pin.role}))` }}
        />
        <div className="relative flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `hsl(var(--pin-${pin.role}) / 0.2)` }}
            >
              {role?.emoji}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-foreground capitalize">{pin.role}</h2>
              {isNow && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--success))]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                  HERE NOW
                </span>
              )}
              {!isNow && timeSlot && (
                <span className="text-[11px] text-muted-foreground">{timeSlot.label}</span>
              )}
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Message */}
        {pin.message && (
          <div className="bg-accent/50 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <MessageCircle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed italic">"{pin.message}"</p>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-muted/20 rounded-xl p-3.5 border border-border/50">
            <Navigation className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Distance</p>
            <p className="font-heading font-semibold text-sm text-foreground mt-0.5">{distLabel}</p>
          </div>
          <div className="bg-muted/20 rounded-xl p-3.5 border border-border/50">
            <Clock className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expires</p>
            <p className="font-heading font-semibold text-sm text-foreground mt-0.5">
              {new Date(pin.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Interests */}
        {pin.interests.length > 0 && (
          <div>
            <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Open to</h3>
            <div className="flex flex-wrap gap-1.5">
              {pin.interests.map(i => (
                <Badge key={i} variant="outline" className="text-[11px] rounded-lg px-2.5 py-1 border-border/60">
                  {i}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Location with directions */}
        <div>
          <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Location</h3>
          <button
            onClick={handleGetDirections}
            className="w-full bg-accent/40 hover:bg-accent/60 rounded-xl p-3.5 flex items-center gap-3 transition-colors group border border-border/50"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Get Directions</p>
              <p className="text-xs font-medium text-foreground truncate">{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Posted time */}
        <p className="text-[10px] text-muted-foreground/50 text-center pt-1">
          Dropped {new Date(pin.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Bottom actions */}
      <div className="px-5 py-4 border-t border-border flex gap-2.5">
        <Button
          variant="outline"
          className="flex-1 font-heading font-semibold h-11 rounded-xl gap-2 border-border"
          onClick={handleGetDirections}
        >
          <Navigation className="h-4 w-4" /> Directions
        </Button>
        <Button
          className="flex-1 font-heading font-semibold h-11 rounded-xl gap-2"
          onClick={handleSayHi}
          disabled={hiSent || sending}
        >
          {hiSent ? <><Check className="h-4 w-4" /> Sent!</> : <><span>👋</span> {sending ? 'Sending...' : 'Say Hi'}</>}
        </Button>
      </div>
    </motion.div>
  );
}

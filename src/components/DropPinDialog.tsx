import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ROLES, TIME_SLOTS, INTERESTS, Role, TimeSlot } from '@/lib/types';
import { addPin } from '@/lib/pinStore';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LocationAutocomplete from './LocationAutocomplete';

interface Props {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPinAdded: (pinId: string) => void;
}

export default function DropPinDialog({ open, onClose, lat, lng, onPinAdded }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('developer');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('now');
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [customLat, setCustomLat] = useState(lat);
  const [customLng, setCustomLng] = useState(lng);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  // If not authenticated, prompt login
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={v => !v && onClose()}>
        <DialogContent className="sm:max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-card border-border p-6 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-foreground">Sign in to drop a pin</h3>
            <p className="text-sm text-muted-foreground">Create an account to let others know you're working nearby.</p>
            <Button onClick={() => { onClose(); navigate('/auth'); }} className="w-full h-11 rounded-xl font-heading font-semibold">
              Sign in / Sign up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleLocationSelect = (foundLat: number, foundLng: number, label: string) => {
    setCustomLat(foundLat);
    setCustomLng(foundLng);
    setLocationLabel(label);
    setUseCustomLocation(true);
  };

  const handleSubmit = async () => {
    const finalLat = useCustomLocation ? customLat : lat;
    const finalLng = useCustomLocation ? customLng : lng;
    const result = await addPin({ lat: finalLat, lng: finalLng, role, timeSlot, interests, message });
    setMessage('');
    setInterests([]);
    setUseCustomLocation(false);
    setLocationLabel('');
    if (result) onPinAdded(result.id);
    onClose();
  };

  const isScheduled = timeSlot !== 'now';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)] rounded-2xl bg-card border-border p-0">
        <div className="px-5 sm:px-6 pt-5 sm:pt-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 font-heading text-foreground">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4.5 w-4.5 text-primary" />
              </div>
              Drop your pin
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5">
          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">Your role</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border active:scale-[0.95] ${
                    role === r.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-border text-foreground hover:border-primary/30 hover:bg-accent/30'
                  }`}
                >
                  <span>{r.emoji}</span> {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">When</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTimeSlot(t.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border active:scale-[0.95] ${
                    timeSlot === t.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-border text-foreground hover:border-primary/30 hover:bg-accent/30'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Pins auto-expire after 4 hours</p>
          </div>

          {/* Manual location — shown when scheduling */}
          {isScheduled && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
                📍 Pin location {useCustomLocation ? '(custom)' : '(map tap)'}
              </label>
              <LocationAutocomplete
                placeholder="Search a different location…"
                onSelect={handleLocationSelect}
                proximity={[lat, lng]}
                className="w-full"
              />
              {locationLabel && useCustomLocation && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-primary truncate flex-1">✓ {locationLabel}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-6 px-2 text-muted-foreground"
                    onClick={() => { setUseCustomLocation(false); setLocationLabel(''); }}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Interests */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">Open to</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border active:scale-[0.95] ${
                    interests.includes(i)
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">Short note (optional)</label>
            <Textarea
              placeholder="e.g. Working on a side project, happy to chat!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={120}
              rows={2}
              className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full font-heading font-semibold h-11 rounded-xl text-sm">
            Drop Pin 📍
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

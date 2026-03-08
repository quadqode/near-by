import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ROLES, TIME_SLOTS, INTERESTS, Role, TimeSlot } from '@/lib/types';
import { addPin } from '@/lib/pinStore';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPinAdded: (pinId: string) => void;
}

export default function DropPinDialog({ open, onClose, lat, lng, onPinAdded }: Props) {
  const [role, setRole] = useState<Role>('developer');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('now');
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [customLat, setCustomLat] = useState(lat);
  const [customLng, setCustomLng] = useState(lng);
  const [locationQuery, setLocationQuery] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleLocationSearch = async () => {
    if (!locationQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery.trim())}.json?access_token=pk.eyJ1IjoibjFuamEiLCJhIjoiY21taHl5Nm1iMDk0ODJwczc5cG85dnRmaiJ9.j5teJQde50Xj19Zu7q9Jrw&limit=1`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const [foundLng, foundLat] = data.features[0].center;
        setCustomLat(foundLat);
        setCustomLng(foundLng);
        setLocationLabel(data.features[0].place_name || '');
        setUseCustomLocation(true);
      }
    } catch { /* ignore */ }
    setSearching(false);
  };

  const handleSubmit = async () => {
    const finalLat = useCustomLocation ? customLat : lat;
    const finalLng = useCustomLocation ? customLng : lng;
    const result = await addPin({ lat: finalLat, lng: finalLng, role, timeSlot, interests, message });
    setMessage('');
    setInterests([]);
    setLocationQuery('');
    setUseCustomLocation(false);
    if (result) onPinAdded(result.id);
    onClose();
  };

  const isScheduled = timeSlot !== 'now';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <MapPin className="h-5 w-5 text-primary" />
            Drop your pin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Role */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Your role</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <Button
                  key={r.value}
                  size="sm"
                  variant={role === r.value ? 'default' : 'outline'}
                  onClick={() => setRole(r.value)}
                  className="gap-1.5"
                >
                  <span>{r.emoji}</span> {r.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">When</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map(t => (
                <Button
                  key={t.value}
                  size="sm"
                  variant={timeSlot === t.value ? 'default' : 'outline'}
                  onClick={() => setTimeSlot(t.value)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Pins auto-expire after 4 hours</p>
          </div>

          {/* Manual location — shown when scheduling */}
          {isScheduled && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                📍 Pin location {useCustomLocation ? '(custom)' : '(map tap)'}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search a different location…"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                  className="h-10 rounded-lg text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleLocationSearch}
                  disabled={searching || !locationQuery.trim()}
                  className="h-10 w-10 shrink-0 rounded-lg"
                >
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {locationLabel && useCustomLocation && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-primary truncate flex-1">✓ {locationLabel}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-6 px-2"
                    onClick={() => { setUseCustomLocation(false); setLocationLabel(''); setLocationQuery(''); }}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Interests */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Open to</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <Badge
                  key={i}
                  variant={interests.includes(i) ? 'default' : 'outline'}
                  className="cursor-pointer select-none transition-colors"
                  onClick={() => toggleInterest(i)}
                >
                  {i}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Short note (optional)</label>
            <Textarea
              placeholder="e.g. Working on a side project, happy to chat!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={120}
              rows={2}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full font-heading font-semibold">
            Drop Pin 📍
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

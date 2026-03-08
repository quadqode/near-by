import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ROLES, TIME_SLOTS, INTERESTS, Role, TimeSlot } from '@/lib/types';
import { addPin } from '@/lib/pinStore';
import { MapPin } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPinAdded: () => void;
}

export default function DropPinDialog({ open, onClose, lat, lng, onPinAdded }: Props) {
  const [role, setRole] = useState<Role>('developer');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('now');
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleSubmit = async () => {
    await addPin({ lat, lng, role, timeSlot, interests, message });
    setMessage('');
    setInterests([]);
    onPinAdded();
    onClose();
  };

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
          </div>

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

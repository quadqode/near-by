import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CHECK_IN_KEY = 'cowork-my-pin-id';
const CHECK_IN_INTERVAL = 3.5 * 60 * 60 * 1000; // 3.5 hours — warn 30min before expiry

export function useExpiryCheckIn() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [pinId, setPinId] = useState<string | null>(null);

  const registerPin = useCallback((id: string) => {
    localStorage.setItem(CHECK_IN_KEY, JSON.stringify({ id, droppedAt: Date.now() }));
    setPinId(id);
  }, []);

  useEffect(() => {
    const check = () => {
      const raw = localStorage.getItem(CHECK_IN_KEY);
      if (!raw) return;
      try {
        const { id, droppedAt } = JSON.parse(raw);
        if (Date.now() - droppedAt >= CHECK_IN_INTERVAL) {
          setPinId(id);
          setShowCheckIn(true);
        }
      } catch {
        localStorage.removeItem(CHECK_IN_KEY);
      }
    };
    check();
    const interval = setInterval(check, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const handleStillHere = async () => {
    if (!pinId) return;
    // Extend expiry by another 4 hours
    const newExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    await supabase.from('pins').update({ expires_at: newExpiry }).eq('id', pinId);
    localStorage.setItem(CHECK_IN_KEY, JSON.stringify({ id: pinId, droppedAt: Date.now() }));
    setShowCheckIn(false);
  };

  const handleRemove = async () => {
    if (!pinId) return;
    await supabase.from('pins').delete().eq('id', pinId);
    localStorage.removeItem(CHECK_IN_KEY);
    setShowCheckIn(false);
    setPinId(null);
  };

  return { showCheckIn, setShowCheckIn, handleStillHere, handleRemove, registerPin };
}

interface Props {
  open: boolean;
  onStillHere: () => void;
  onRemove: () => void;
}

export default function ExpiryCheckIn({ open, onStillHere, onRemove }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Clock className="h-5 w-5 text-primary" />
            Still there?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Your pin is about to expire. Are you still at this location?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={onRemove}
            className="flex-1 h-11 rounded-xl font-heading font-semibold gap-2 border-border"
          >
            <X className="h-4 w-4" /> Remove pin
          </Button>
          <Button
            onClick={onStillHere}
            className="flex-1 h-11 rounded-xl font-heading font-semibold gap-2"
          >
            <Check className="h-4 w-4" /> I'm still here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

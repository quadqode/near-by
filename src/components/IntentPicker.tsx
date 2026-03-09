import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserIntent } from './LocationPicker';

interface Props {
  open: boolean;
  intents: UserIntent[];
  onToggle: (v: UserIntent) => void;
  onClose: () => void;
}

const intentOptions: { value: UserIntent; emoji: string; label: string }[] = [
  { value: 'food', emoji: '🍽️', label: 'Handcrafted Food' },
  { value: 'cowork', emoji: '☕', label: 'Cafés & Cowork' },
  { value: 'people', emoji: '👥', label: 'People Nearby' },
];

export default function IntentPicker({ open, intents, onToggle, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    document.addEventListener('keydown', keyHandler);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', keyHandler); };
  }, [open, onClose]);

  const handleToggle = (v: UserIntent) => {
    // Prevent deselecting the last intent
    if (intents.includes(v) && intents.length <= 1) return;
    onToggle(v);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          className="fixed bottom-32 left-4 right-4 sm:absolute sm:bottom-14 sm:left-0 sm:right-auto sm:w-72 bg-card rounded-2xl shadow-xl border border-border p-5 space-y-4 z-[1100]"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-foreground">Show on map</h3>
            <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 rounded-lg">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {intentOptions.map(opt => (
              <Badge
                key={opt.value}
                variant={intents.includes(opt.value) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs rounded-lg px-3 py-1.5 transition-colors active:scale-[0.97] ${
                  intents.includes(opt.value)
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border/60 hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => handleToggle(opt.value)}
              >
                {opt.emoji} {opt.label}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useRef } from 'react';
import { ROLES, TIME_SLOTS, INTERESTS, Role, TimeSlot } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  roles: Role[];
  timeSlots: TimeSlot[];
  interests: string[];
  onRolesChange: (r: Role[]) => void;
  onTimeSlotsChange: (t: TimeSlot[]) => void;
  onInterestsChange: (i: string[]) => void;
}

export default function FilterPanel({
  open, onToggle, onClose, roles, timeSlots, interests,
  onRolesChange, onTimeSlotsChange, onInterestsChange,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const activeCount = roles.length + timeSlots.length + interests.length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the toggle click
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [open, onClose]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        size="icon"
        variant="outline"
        onClick={onToggle}
        className="relative bg-card shadow-lg border-border h-10 w-10 rounded-xl"
      >
        <Filter className="h-4 w-4" />
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="fixed bottom-32 left-4 right-4 sm:absolute sm:bottom-auto sm:left-0 sm:top-auto sm:mb-2 sm:right-auto sm:w-80 bg-card rounded-2xl shadow-xl border border-border p-5 space-y-5 z-[1100]"
            style={{ bottom: 'calc(100% + 8px)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-foreground">Filters</h3>
              <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 rounded-lg">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map(r => (
                  <Badge
                    key={r.value}
                    variant={roles.includes(r.value) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs rounded-lg px-3 py-1 transition-colors ${
                      roles.includes(r.value)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-border/60 hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => onRolesChange(toggle(roles, r.value))}
                  >
                    {r.emoji} {r.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Time</p>
              <div className="flex flex-wrap gap-1.5">
                {TIME_SLOTS.map(t => (
                  <Badge
                    key={t.value}
                    variant={timeSlots.includes(t.value) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs rounded-lg px-3 py-1 transition-colors ${
                      timeSlots.includes(t.value)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-border/60 hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => onTimeSlotsChange(toggle(timeSlots, t.value))}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map(i => (
                  <Badge
                    key={i}
                    variant={interests.includes(i) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs rounded-lg px-3 py-1 transition-colors ${
                      interests.includes(i)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-border/60 hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => onInterestsChange(toggle(interests, i))}
                  >
                    {i}
                  </Badge>
                ))}
              </div>
            </div>

            {activeCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => { onRolesChange([]); onTimeSlotsChange([]); onInterestsChange([]); }}
              >
                ✕ Clear all filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

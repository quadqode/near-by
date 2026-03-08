import { ROLES, TIME_SLOTS, INTERESTS, Role, TimeSlot } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onToggle: () => void;
  roles: Role[];
  timeSlots: TimeSlot[];
  interests: string[];
  onRolesChange: (r: Role[]) => void;
  onTimeSlotsChange: (t: TimeSlot[]) => void;
  onInterestsChange: (i: string[]) => void;
}

export default function FilterPanel({
  open, onToggle, roles, timeSlots, interests,
  onRolesChange, onTimeSlotsChange, onInterestsChange,
}: Props) {
  const toggle = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const activeCount = roles.length + timeSlots.length + interests.length;

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={onToggle}
        className="relative bg-card shadow-lg border-border"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 right-0 w-72 bg-card rounded-lg shadow-xl border border-border p-4 space-y-4 z-[1000]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-sm">Filters</h3>
              <Button size="icon" variant="ghost" onClick={onToggle} className="h-6 w-6">
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Role</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map(r => (
                  <Badge
                    key={r.value}
                    variant={roles.includes(r.value) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => onRolesChange(toggle(roles, r.value))}
                  >
                    {r.emoji} {r.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Time</p>
              <div className="flex flex-wrap gap-1.5">
                {TIME_SLOTS.map(t => (
                  <Badge
                    key={t.value}
                    variant={timeSlots.includes(t.value) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => onTimeSlotsChange(toggle(timeSlots, t.value))}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map(i => (
                  <Badge
                    key={i}
                    variant={interests.includes(i) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
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
                className="w-full text-xs"
                onClick={() => { onRolesChange([]); onTimeSlotsChange([]); onInterestsChange([]); }}
              >
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

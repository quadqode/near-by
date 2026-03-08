import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import type { UserIntent } from './LocationPicker';

interface Props {
  open: boolean;
  intents: UserIntent[];
  onSave: (intents: UserIntent[]) => void;
  onClose: () => void;
}

const intentOptions: { value: UserIntent; emoji: string; label: string }[] = [
  { value: 'food', emoji: '🍽️', label: 'Handcrafted Food Places' },
  { value: 'cowork', emoji: '☕', label: 'Cafés & Places to Work' },
  { value: 'people', emoji: '👥', label: 'People to Work With' },
];

export default function IntentPicker({ open, intents, onSave, onClose }: Props) {
  const [selected, setSelected] = useState<UserIntent[]>(intents);

  const toggle = (v: UserIntent) =>
    setSelected(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v]);

  const handleSave = () => {
    const final = selected.length > 0 ? selected : (['food', 'cowork', 'people'] as UserIntent[]);
    onSave(final);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-card border-border p-0 z-[2000]">
        <div className="px-5 pt-5 pb-2 text-center">
          <div className="mx-auto w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-base text-foreground">What do you want to see?</h2>
        </div>

        <div className="px-5 space-y-2">
          {intentOptions.map(opt => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  active ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className={`font-heading font-semibold text-sm flex-1 ${active ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  active ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {active && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-5 pt-3">
          <Button onClick={handleSave} className="w-full font-heading font-semibold h-11 rounded-xl text-sm">
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

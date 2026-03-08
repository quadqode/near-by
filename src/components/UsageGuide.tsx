import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee, Users, UtensilsCrossed, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export type UserIntent = 'food' | 'cowork' | 'people';

interface Props {
  open: boolean;
  onClose: (intents: UserIntent[]) => void;
}

const intentOptions: { value: UserIntent; emoji: string; icon: React.ElementType; label: string; description: string }[] = [
  {
    value: 'food',
    emoji: '🍽️',
    icon: UtensilsCrossed,
    label: 'Handcrafted Food Places',
    description: 'Discover curated restaurants, bakeries & street food gems nearby',
  },
  {
    value: 'cowork',
    emoji: '☕',
    icon: Coffee,
    label: 'Cafés to Work From',
    description: 'Find WiFi-friendly cafés, coworking spots & quiet libraries',
  },
  {
    value: 'people',
    emoji: '👥',
    icon: Users,
    label: 'People to Work With',
    description: 'Connect with designers, developers & creatives around you',
  },
];

export default function UsageGuide({ open, onClose }: Props) {
  const handleSelect = (intent: UserIntent) => {
    onClose([intent]);
  };

  const handleAll = () => {
    onClose(['food', 'cowork', 'people']);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleAll()}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] p-0 overflow-hidden z-[2000] border-border w-[calc(100%-2rem)] rounded-2xl bg-card">
        {/* Header */}
        <div className="px-5 sm:px-7 pt-7 sm:pt-9 pb-2 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
            className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4"
          >
            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </motion.div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
            What are you looking for?
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
            We'll personalize your experience based on what matters to you
          </p>
        </div>

        {/* Intent cards */}
        <div className="px-5 sm:px-7 pb-3 space-y-2.5">
          {intentOptions.map((opt, idx) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-accent/30 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center text-2xl shrink-0 group-hover:bg-primary/15 transition-colors border border-border/50">
                {opt.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {opt.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Show all */}
        <div className="px-5 sm:px-7 pb-6 sm:pb-7">
          <Button
            onClick={handleAll}
            variant="outline"
            className="w-full font-heading font-semibold h-11 rounded-xl text-sm border-border hover:border-primary/30"
          >
            Show me everything ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

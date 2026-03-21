import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Filter, List, Navigation, MousePointer2, Clock, SlidersHorizontal, Smartphone } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: <SlidersHorizontal className="h-5 w-5" />,
    title: 'Choose your intent',
    items: ['Pick what you are looking for: Food, Cafes, or People', 'The map & list adapt to show only what matters to you', 'Change anytime with the sliders button at the bottom'],
  },
  {
    icon: <Navigation className="h-5 w-5" />,
    title: 'Map navigation',
    items: ['Scroll to zoom in and out', 'Click and drag to pan the map', 'Pinch on mobile to zoom'],
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Drop a pin',
    items: ['Tap anywhere on the map to drop a pin', 'Or use the "Drop a pin" button', 'Select your role, availability, and interests'],
  },
  {
    icon: <Filter className="h-5 w-5" />,
    title: 'Filters',
    items: ['Filter by role: Designer, Developer, Writer…', 'Filter by time: Morning, Afternoon, Evening, Now', 'Filter by interests to find your match'],
  },
  {
    icon: <List className="h-5 w-5" />,
    title: 'List view',
    items: ['Toggle between Map and List views', 'List adapts filters based on your selected intents', 'Click any card to see details'],
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'How it works',
    items: ['Pins expire after 4 hours automatically', 'Only pins within the radius are visible', 'No personal names — just roles and interests'],
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Add to home screen',
    items: ['iPhone — Safari → Share → "Add to Home Screen"', 'Android — Chrome → Menu → "Install app"', 'Works offline-first, no app store needed'],
  },
];

export default function UsageGuide({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] p-0 overflow-hidden z-[2000] border-border w-[calc(100%-2rem)] rounded-2xl bg-card">
        <div className="px-5 sm:px-6 pt-6 sm:pt-8 pb-2 text-center">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <MousePointer2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground">Usage Guide</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Learn how to navigate and use the platform</p>
        </div>

        <div className="px-5 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4 max-h-[55dvh] overflow-y-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-2.5 sm:gap-3 p-3 rounded-xl bg-background border border-border/50">
              <div className="mt-0.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {step.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-semibold text-xs sm:text-sm text-foreground">{step.title}</h3>
                <ul className="mt-1 sm:mt-1.5 space-y-0.5 sm:space-y-1">
                  {step.items.map((item, i) => (
                    <li key={i} className="text-[11px] sm:text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary/50 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <Button onClick={onClose} className="w-full font-heading font-semibold h-10 sm:h-11 rounded-xl text-sm">
            Got it, let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

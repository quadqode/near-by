import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Filter, List, Navigation, MousePointer2, Clock } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: <Navigation className="h-5 w-5" />,
    title: 'Map navigation',
    items: [
      'Scroll to zoom in and out',
      'Click and drag to pan the map',
      'Pinch on mobile to zoom',
    ],
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Drop a pin',
    items: [
      'Tap "Drop a pin" at the bottom',
      'Click anywhere on the map within your radius',
      'Select your role, availability, and interests',
    ],
  },
  {
    icon: <Filter className="h-5 w-5" />,
    title: 'Filters',
    items: [
      'Filter by role: Designer, Developer, Writer…',
      'Filter by time: Morning, Afternoon, Evening, Now',
      'Filter by interests to find your match',
    ],
  },
  {
    icon: <List className="h-5 w-5" />,
    title: 'List view',
    items: [
      'Toggle between Map and List views',
      'List is sorted by nearest location first',
      'Click any card to see details',
    ],
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'How it works',
    items: [
      'Pins expire after 4 hours automatically',
      'Only pins within 15km are visible',
      'No personal names — just roles and interests',
    ],
  },
];

export default function UsageGuide({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="px-6 pt-8 pb-2 text-center">
          <div className="mx-auto w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-4">
            <MousePointer2 className="h-7 w-7 text-foreground" />
          </div>
          <h2 className="font-heading font-bold text-xl text-foreground">Usage Guide</h2>
          <p className="text-sm text-muted-foreground mt-1">Learn how to navigate and use the platform effectively</p>
        </div>

        <div className="px-6 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-foreground">
                {step.icon}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground">{step.title}</h3>
                <ul className="mt-1.5 space-y-1">
                  {step.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-muted-foreground/50 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <Button onClick={onClose} className="w-full font-heading font-semibold">
            Got it, let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

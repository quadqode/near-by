import { useState, useEffect } from 'react';
import { WorkPlace } from '@/lib/placeTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from 'lucide-react';

interface OfferBannerProps {
  places: WorkPlace[];
  onPlaceSelect: (place: WorkPlace) => void;
}

export default function OfferBanner({ places, onPlaceSelect }: OfferBannerProps) {
  const offersPlaces = places.filter((p) => !!p.offer);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (offersPlaces.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % offersPlaces.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [offersPlaces.length]);

  if (offersPlaces.length === 0) return null;

  const current = offersPlaces[index % offersPlaces.length];
  if (!current) return null;

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-[70px] sm:top-[72px] left-0 right-0 z-[900] flex justify-center px-4"
    >
      <button
        onClick={() => onPlaceSelect(current)}
        className="flex items-center gap-2 bg-card border border-border rounded-xl shadow-lg px-3 py-2 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
      >
        <span className="bg-accent text-accent-foreground rounded-lg p-1.5">
          <Tag className="h-3.5 w-3.5" />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]"
          >
            <span className="font-semibold">{current.name}</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span className="text-primary">{current.offer}</span>
          </motion.span>
        </AnimatePresence>
        {offersPlaces.length > 1 && (
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {(index % offersPlaces.length) + 1}/{offersPlaces.length}
          </span>
        )}
      </button>
    </motion.div>
  );
}

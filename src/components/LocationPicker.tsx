import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LocateFixed, Search, Loader2, Coffee, Users, UtensilsCrossed, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationAutocomplete from './LocationAutocomplete';

export type UserIntent = 'food' | 'cowork' | 'people';

interface Props {
  onLocationSet: (lat: number, lng: number, intents: UserIntent[]) => void;
}

const intentOptions: { value: UserIntent; emoji: string; label: string; description: string }[] = [
  {
    value: 'food',
    emoji: '🍽️',
    label: 'Handcrafted Food Places',
    description: 'Restaurants, bakeries & street food gems',
  },
  {
    value: 'cowork',
    emoji: '☕',
    label: 'Cafés & Places to Work',
    description: 'WiFi-friendly cafés & coworking spots',
  },
  {
    value: 'people',
    emoji: '👥',
    label: 'People to Work With',
    description: 'Designers, developers & creatives nearby',
  },
];

export default function LocationPicker({ onLocationSet }: Props) {
  const [step, setStep] = useState<'intent' | 'location' | 'manual'>('intent');
  const [selectedIntents, setSelectedIntents] = useState<UserIntent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleIntent = (intent: UserIntent) => {
    setSelectedIntents(prev =>
      prev.includes(intent) ? prev.filter(i => i !== intent) : [...prev, intent]
    );
  };

  const handleContinue = () => {
    const intents = selectedIntents.length > 0 ? selectedIntents : ['food', 'cowork', 'people'] as UserIntent[];
    setSelectedIntents(intents);
    setStep('location');
  };

  const handleSelectAll = () => {
    setSelectedIntents(['food', 'cowork', 'people']);
    setStep('location');
  };

  const finishWithLocation = (lat: number, lng: number) => {
    const intents = selectedIntents.length > 0 ? selectedIntents : ['food', 'cowork', 'people'] as UserIntent[];
    localStorage.setItem('cowork-user-intents', JSON.stringify(intents));
    onLocationSet(lat, lng, intents);
  };

  const handleGeolocate = () => {
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        finishWithLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLoading(false);
        setError('Could not access location. Please type it manually.');
        setStep('manual');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm"
      >
        {/* Intent step */}
        {step === 'intent' && (
          <>
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="font-heading font-bold text-2xl text-foreground mb-1.5">What are you looking for?</h1>
              <p className="text-sm text-muted-foreground">Pick one or more to personalize your experience</p>
            </div>

            <div className="space-y-2.5 mb-5">
              {intentOptions.map((opt, idx) => {
                const selected = selectedIntents.includes(opt.value);
                return (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08 }}
                    onClick={() => toggleIntent(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left active:scale-[0.98] ${
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border transition-colors ${
                      selected ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border/50'
                    }`}>
                      {opt.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-heading font-semibold text-sm transition-colors ${selected ? 'text-primary' : 'text-foreground'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {selected && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleContinue}
                disabled={selectedIntents.length === 0}
                className="w-full h-12 rounded-xl font-heading font-semibold text-sm"
              >
                Continue →
              </Button>
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="w-full h-11 rounded-xl font-heading font-semibold text-sm border-border"
              >
                Show me everything ✨
              </Button>
            </div>
          </>
        )}

        {/* Location step */}
        {(step === 'location' || step === 'manual') && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LocateFixed className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Where are you?</h1>
              <p className="text-sm text-muted-foreground">We'll show what's nearby</p>
            </div>

            {step === 'location' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleGeolocate}
                  disabled={loading}
                  className="w-full h-14 rounded-xl font-heading font-semibold text-base gap-3"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LocateFixed className="h-5 w-5" />
                  )}
                  {loading ? 'Getting location…' : 'Use my current location'}
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep('manual')}
                  className="w-full h-14 rounded-xl font-heading font-semibold text-base gap-3 border-border"
                >
                  <Search className="h-5 w-5" />
                  Type a location
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep('intent')}
                  className="w-full text-sm text-muted-foreground"
                >
                  ← Back
                </Button>
              </motion.div>
            )}

            {step === 'manual' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <LocationAutocomplete
                  placeholder="e.g. Connaught Place, Delhi"
                  onSelect={(lat, lng) => finishWithLocation(lat, lng)}
                  autoFocus
                />

                <Button
                  variant="ghost"
                  onClick={() => { setStep('location'); setError(''); }}
                  className="w-full text-sm text-muted-foreground"
                >
                  ← Back to options
                </Button>
              </motion.div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center mt-3">{error}</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

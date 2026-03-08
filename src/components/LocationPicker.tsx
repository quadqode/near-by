import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, LocateFixed, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onLocationSet: (lat: number, lng: number) => void;
}

export default function LocationPicker({ onLocationSet }: Props) {
  const [mode, setMode] = useState<'choice' | 'manual'>('choice');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeolocate = () => {
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onLocationSet(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLoading(false);
        setError('Could not access location. Please type it manually.');
        setMode('manual');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=pk.eyJ1IjoibjFuamEiLCJhIjoiY21taHl5Nm1iMDk0ODJwczc5cG85dnRmaiJ9.j5teJQde50Xj19Zu7q9Jrw&limit=1`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        onLocationSet(lat, lng);
      } else {
        setError('No results found. Try a different search.');
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">CoWork Drop</h1>
          <p className="text-sm text-muted-foreground">Find nearby people to work with</p>
        </div>

        {mode === 'choice' && (
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
              onClick={() => setMode('manual')}
              className="w-full h-14 rounded-xl font-heading font-semibold text-base gap-3 border-border"
            >
              <Search className="h-5 w-5" />
              Type a location
            </Button>
          </motion.div>
        )}

        {mode === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Times Square, NYC"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12 rounded-xl text-sm"
                autoFocus
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="h-12 px-4 rounded-xl shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => { setMode('choice'); setError(''); }}
              className="w-full text-sm text-muted-foreground"
            >
              ← Back to options
            </Button>
          </motion.div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center mt-3">{error}</p>
        )}
      </motion.div>
    </div>
  );
}

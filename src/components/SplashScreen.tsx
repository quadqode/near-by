import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Coffee, UtensilsCrossed, Compass, ArrowRight, ArrowLeft, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onContinue: () => void;
}

const pages = [
  {
    title: 'Welcome to NearBy',
    subtitle: 'Your neighbourhood, reimagined for remote work',
    content: (
      <div className="w-full space-y-3">
        {[
          { icon: MapPin, title: 'Drop a Pin', desc: "Share where you're working so others can find you", color: 'text-primary' },
          { icon: Users, title: 'Find People', desc: 'Discover designers, developers & creatives nearby', color: 'text-primary' },
          { icon: Coffee, title: 'Work-Friendly Spots', desc: 'Cafés & coworking spaces with WiFi, power & good vibes', color: 'text-primary' },
          { icon: UtensilsCrossed, title: 'Local Eats', desc: 'Handcrafted food places worth walking to', color: 'text-primary' },
        ].map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1, type: 'spring', damping: 20 }}
            className="flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0">
              <f.icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="pt-0.5">
              <p className="font-heading font-semibold text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    title: 'What the pins mean',
    subtitle: 'Each icon on the map tells you something specific',
    content: (
      <div className="w-full space-y-2.5">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">People pins (by role)</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '🎨', label: 'Designer', color: '#7c3aed' },
            { emoji: '💻', label: 'Developer', color: '#1a9a7a' },
            { emoji: '✍️', label: 'Writer', color: '#d97706' },
            { emoji: '📣', label: 'Marketer', color: '#d9365b' },
            { emoji: '🤝', label: 'Other', color: '#6b8299' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: r.color + '20' }}>
                {r.emoji}
              </div>
              <span className="text-xs font-medium text-foreground">{r.label}</span>
            </div>
          ))}
        </div>

        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2">Place pins</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '☕', label: 'Café' },
            { emoji: '🏢', label: 'Coworking' },
            { emoji: '📚', label: 'Library' },
            { emoji: '🍜', label: 'Food spot' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border">
              <span className="text-base">{p.emoji}</span>
              <span className="text-xs font-medium text-foreground">{p.label}</span>
            </div>
          ))}
        </div>

        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2">Indicators</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-foreground">Pulsing dot = "Here now"</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border">
            <span className="text-sm">🏷️</span>
            <span className="text-xs text-foreground">Tag = Active offer / deal</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border">
            <span className="bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
            <span className="text-xs text-foreground">Badge = People working nearby</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Add to home screen',
    subtitle: 'Use NearBy like a native app',
    content: (
      <div className="w-full space-y-4">
        <div className="bg-background border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-foreground">iPhone / iPad</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">Safari</span>
                <span className="text-xs text-muted-foreground">→</span>
                <Share className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Share</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-xs font-medium text-foreground">"Add to Home Screen"</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-foreground">Android</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">Chrome</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-xs text-muted-foreground">⋮ Menu</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-xs font-medium text-foreground">"Install app"</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          NearBy works offline-first and loads instantly from your home screen — no app store needed.
        </p>
      </div>
    ),
  },
];

export default function SplashScreen({ onContinue }: Props) {
  const [page, setPage] = useState(0);
  const isLast = page === pages.length - 1;
  const current = pages[page];

  return (
    <div className="fixed inset-0 z-[4000] bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg"
        >
          <Compass className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="font-heading font-bold text-2xl text-foreground text-center">{current.title}</h1>
            <p className="text-sm text-muted-foreground text-center mt-1.5 mb-6">{current.subtitle}</p>

            <div className="w-full max-h-[50dvh] overflow-y-auto mb-6 px-1">
              {current.content}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center gap-2 mb-5">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="w-full flex gap-3">
          {page > 0 && (
            <Button variant="outline" onClick={() => setPage(p => p - 1)} className="flex-1 h-12 rounded-xl font-heading font-semibold gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button
            onClick={() => isLast ? onContinue() : setPage(p => p + 1)}
            className={`${page > 0 ? 'flex-1' : 'w-full'} h-12 rounded-xl font-heading font-semibold text-base gap-2.5 group`}
          >
            {isLast ? "Get Started" : "Next"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[11px] text-muted-foreground/60 text-center mt-4"
        >
          No sign-up needed · 100% free
        </motion.p>
      </div>
    </div>
  );
}

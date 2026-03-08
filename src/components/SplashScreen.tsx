import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Coffee, UtensilsCrossed, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onContinue: () => void;
}

const features = [
  {
    icon: MapPin,
    title: 'Drop a Pin',
    desc: 'Share where you\'re working so others can find you',
  },
  {
    icon: Users,
    title: 'Find People',
    desc: 'Discover designers, developers & creatives nearby',
  },
  {
    icon: Coffee,
    title: 'Work-Friendly Spots',
    desc: 'Cafés & coworking spaces with WiFi, power & good vibes',
  },
  {
    icon: UtensilsCrossed,
    title: 'Local Eats',
    desc: 'Handcrafted food places worth walking to',
  },
];

export default function SplashScreen({ onContinue }: Props) {
  return (
    <div className="fixed inset-0 z-[4000] bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg"
        >
          <Compass className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-heading font-bold text-2xl text-foreground text-center"
        >
          CoWork Drop
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-muted-foreground text-center mt-1.5 mb-8"
        >
          Your neighbourhood, reimagined for remote work
        </motion.p>

        {/* Feature list */}
        <div className="w-full space-y-3 mb-8">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, type: 'spring', damping: 20 }}
              className="flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <f.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="pt-0.5">
                <p className="font-heading font-semibold text-sm text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="w-full"
        >
          <Button
            onClick={onContinue}
            className="w-full h-13 rounded-xl font-heading font-semibold text-base gap-2.5 group"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[11px] text-muted-foreground/60 text-center mt-4"
        >
          No sign-up needed · 100% free
        </motion.p>
      </motion.div>
    </div>
  );
}

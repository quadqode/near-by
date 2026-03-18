import { useState, useEffect, useCallback } from 'react';
import { HiRequest, getHiRequestsForMyPins, respondToHi, subscribeToGreetings } from '@/lib/pinStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, XIcon, Bell, Inbox, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import SessionReviewForm from './SessionReviewForm';

interface Props {
  open: boolean;
  onClose: () => void;
  onRequestCount?: (count: number) => void;
}

export default function HiRequestsPanel({ open, onClose, onRequestCount }: Props) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HiRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const data = await getHiRequestsForMyPins();
    setRequests(data);
    setLoading(false);
    const pendingCount = data.filter(r => r.status === 'pending').length;
    onRequestCount?.(pendingCount);
  }, [user, onRequestCount]);

  useEffect(() => {
    refresh();
    const unsub = subscribeToGreetings(() => refresh());
    return unsub;
  }, [refresh]);

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    setResponding(id);
    const ok = await respondToHi(id, status);
    setResponding(null);
    if (ok) {
      toast({
        title: status === 'accepted' ? '✅ Hi accepted!' : '❌ Hi declined',
        description: status === 'accepted' ? 'Your exact location has been shared.' : 'Request declined.',
      });
      refresh();
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/20 z-[1050]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[380px] bg-card z-[1100] border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-foreground">Hi Requests</h2>
                  <p className="text-[10px] text-muted-foreground">
                    {pendingRequests.length} pending
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loading && (
                <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
              )}

              {!loading && requests.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No Hi requests yet</p>
                  <p className="text-xs text-muted-foreground/60">
                    When someone says Hi to your pin, it will appear here
                  </p>
                </div>
              )}

              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    Pending
                  </h3>
                  {pendingRequests.map(req => (
                    <div
                      key={req.id}
                      className="bg-accent/30 border border-primary/20 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                          👋
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {req.senderName || 'Someone'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {req.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                        ⚠️ Accepting reveals your exact pin location to this person
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-9 rounded-xl font-heading font-semibold gap-1.5 text-xs"
                          onClick={() => handleRespond(req.id, 'accepted')}
                          disabled={responding === req.id}
                        >
                          <Check className="h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9 rounded-xl font-heading font-semibold gap-1.5 text-xs"
                          onClick={() => handleRespond(req.id, 'declined')}
                          disabled={responding === req.id}
                        >
                          <XIcon className="h-3.5 w-3.5" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Past requests */}
              {pastRequests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mt-4">
                    History
                  </h3>
                  {pastRequests.map(req => (
                    <div
                      key={req.id}
                      className="bg-muted/10 border border-border/50 rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted/20 flex items-center justify-center text-xs">
                        {req.status === 'accepted' ? '✅' : '❌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {req.senderName || 'Someone'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {req.status === 'accepted' ? 'Accepted' : 'Declined'} · {req.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

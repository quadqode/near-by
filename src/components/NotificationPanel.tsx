import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { HiRequest, getHiRequestsForMyPins, respondToHi, subscribeToGreetings } from '@/lib/pinStore';
import { WorkPlace } from '@/lib/placeTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, XIcon, Bell, Inbox, Star, Tag, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import SessionReviewForm from './SessionReviewForm';

interface Props {
  open: boolean;
  onClose: () => void;
  onNotificationCount?: (count: number) => void;
  places?: WorkPlace[];
  onPlaceSelect?: (place: WorkPlace) => void;
  onFeedbackOpen?: (pinId: string) => void;
}

interface FeedbackReminder {
  id: string;
  pinId: string;
  message: string;
  createdAt: Date;
}

export default function NotificationPanel({
  open,
  onClose,
  onNotificationCount,
  places = [],
  onPlaceSelect,
  onFeedbackOpen,
}: Props) {
  const { user } = useAuth();
  const [hiRequests, setHiRequests] = useState<HiRequest[]>([]);
  const [feedbackReminders, setFeedbackReminders] = useState<FeedbackReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hi' | 'offers' | 'feedback'>('all');

  const offersPlaces = places.filter(p => !!p.offer);

  // Refresh Hi requests
  const refreshHi = useCallback(async () => {
    if (!user) return;
    const data = await getHiRequestsForMyPins();
    setHiRequests(data);
    setLoading(false);
  }, [user]);

  // Check for expired pins needing feedback
  const checkFeedbackReminders = useCallback(async () => {
    if (!user) return;
    const { data: expiredPins } = await supabase
      .from('pins')
      .select('id, created_at, expires_at')
      .eq('user_id', user.id)
      .lt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(5);

    if (!expiredPins) return;

    // Check which ones already have feedback
    const pinIds = expiredPins.map(p => p.id);
    const { data: existingReviews } = await supabase
      .from('session_reviews')
      .select('session_id')
      .eq('reviewer_id', user.id)
      .in('session_id', pinIds);

    const reviewedIds = new Set((existingReviews || []).map(r => r.session_id));

    setFeedbackReminders(
      expiredPins
        .filter(p => !reviewedIds.has(p.id))
        .map(p => ({
          id: p.id,
          pinId: p.id,
          message: 'Share how your session went',
          createdAt: new Date(p.expires_at),
        }))
    );
  }, [user]);

  useEffect(() => {
    refreshHi();
    checkFeedbackReminders();
    const unsub = subscribeToGreetings(() => refreshHi());
    return unsub;
  }, [refreshHi, checkFeedbackReminders]);

  // Update total count
  useEffect(() => {
    const pendingHi = hiRequests.filter(r => r.status === 'pending').length;
    const totalCount = pendingHi + feedbackReminders.length + offersPlaces.length;
    onNotificationCount?.(totalCount);
  }, [hiRequests, feedbackReminders, offersPlaces, onNotificationCount]);

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    setResponding(id);
    const ok = await respondToHi(id, status);
    setResponding(null);
    if (ok) {
      toast({
        title: status === 'accepted' ? '✅ Hi accepted!' : '❌ Hi declined',
        description: status === 'accepted' ? 'Your exact location has been shared.' : 'Request declined.',
      });
      refreshHi();
    }
  };

  const [reviewTarget, setReviewTarget] = useState<{ sessionId: string; revieweeId: string; revieweeName: string } | null>(null);

  const handleOpenReview = async (req: HiRequest) => {
    const { data: existing } = await supabase
      .from('cowork_sessions')
      .select('id')
      .eq('pin_id', req.pinId)
      .eq('responder_id', req.senderId)
      .limit(1)
      .maybeSingle();

    let sessionId = existing?.id;
    if (!sessionId && user) {
      const { data: newSession } = await supabase
        .from('cowork_sessions')
        .insert({ initiator_id: user.id, responder_id: req.senderId, pin_id: req.pinId, status: 'completed' })
        .select('id')
        .single();
      sessionId = newSession?.id;
    }
    if (sessionId) {
      setReviewTarget({ sessionId, revieweeId: req.senderId, revieweeName: req.senderName || 'Someone' });
    }
  };

  const pendingHi = hiRequests.filter(r => r.status === 'pending');
  const pastHi = hiRequests.filter(r => r.status !== 'pending');

  const tabs = [
    { key: 'all' as const, label: 'All', count: pendingHi.length + feedbackReminders.length + offersPlaces.length },
    { key: 'hi' as const, label: "Hi's", count: pendingHi.length },
    { key: 'offers' as const, label: 'Offers', count: offersPlaces.length },
    { key: 'feedback' as const, label: 'Feedback', count: feedbackReminders.length },
  ];

  const showHi = activeTab === 'all' || activeTab === 'hi';
  const showOffers = activeTab === 'all' || activeTab === 'offers';
  const showFeedback = activeTab === 'all' || activeTab === 'feedback';

  const isEmpty = (showHi ? pendingHi.length + pastHi.length : 0) +
    (showOffers ? offersPlaces.length : 0) +
    (showFeedback ? feedbackReminders.length : 0) === 0;

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
                  <h2 className="font-heading font-bold text-base text-foreground">Notifications</h2>
                  <p className="text-[10px] text-muted-foreground">
                    {pendingHi.length} hi · {offersPlaces.length} offers · {feedbackReminders.length} feedback
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 py-2.5 border-b border-border overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[9px] rounded-full px-1.5 py-0.5 ${
                      activeTab === tab.key
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {loading && (
                <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
              )}

              {!loading && isEmpty && (
                <div className="text-center py-12 space-y-3">
                  <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60">
                    Hi requests, offers, and feedback reminders will appear here
                  </p>
                </div>
              )}

              {/* Café Offers */}
              {showOffers && offersPlaces.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Active Offers
                  </h3>
                  {offersPlaces.map(place => (
                    <button
                      key={place.id}
                      onClick={() => { onPlaceSelect?.(place); onClose(); }}
                      className="w-full bg-accent/20 border border-accent/30 rounded-xl p-3 flex items-center gap-3 hover:bg-accent/30 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/30 flex items-center justify-center text-sm">
                        🏷️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{place.name}</p>
                        <p className="text-[10px] text-primary font-medium truncate">{place.offer}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Feedback Reminders */}
              {showFeedback && feedbackReminders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Share Feedback
                  </h3>
                  {feedbackReminders.map(rem => (
                    <div
                      key={rem.id}
                      className="bg-muted/20 border border-border rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                        📝
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{rem.message}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          Expired {rem.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 rounded-lg text-[10px] shrink-0"
                        onClick={() => onFeedbackOpen?.(rem.pinId)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Hi Requests */}
              {showHi && pendingHi.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    Pending Hi's
                  </h3>
                  {pendingHi.map(req => (
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

              {/* Past Hi Requests */}
              {showHi && pastHi.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mt-2">
                    Hi History
                  </h3>
                  {pastHi.map(req => (
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
                      {req.status === 'accepted' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg text-[10px] gap-1 shrink-0"
                          onClick={() => handleOpenReview(req)}
                        >
                          <Star className="h-3 w-3" /> Review
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Form */}
            {reviewTarget && (
              <SessionReviewForm
                open={!!reviewTarget}
                onClose={() => setReviewTarget(null)}
                sessionId={reviewTarget.sessionId}
                revieweeId={reviewTarget.revieweeId}
                revieweeName={reviewTarget.revieweeName}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

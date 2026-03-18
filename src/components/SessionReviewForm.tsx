import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const BADGE_TAGS = [
  { value: 'reliable_coworker', emoji: '🤝', label: 'Reliable Coworker' },
  { value: 'great_conversation', emoji: '💬', label: 'Great Conversation' },
  { value: 'quiet_partner', emoji: '🔇', label: 'Quiet Work Partner' },
  { value: 'super_connector', emoji: '⭐', label: 'Super Connector' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  revieweeId: string;
  revieweeName: string;
}

export default function SessionReviewForm({ open, onClose, sessionId, revieweeId, revieweeName }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);

    // Insert review
    const { error: reviewError } = await supabase.from('session_reviews').insert({
      session_id: sessionId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment: comment.trim(),
      tags: selectedTags,
    });

    if (reviewError) {
      toast({ title: 'Error', description: 'Could not submit review.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    // Award badges for selected tags
    if (selectedTags.length > 0) {
      const badgeRows = selectedTags.map(tag => ({
        user_id: revieweeId,
        badge_type: tag,
      }));
      await supabase.from('user_badges').insert(badgeRows);
    }

    // Update reviewee's collaboration score (running average)
    const { data: reviews } = await supabase
      .from('session_reviews')
      .select('rating')
      .eq('reviewee_id', revieweeId);

    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await supabase.from('profiles').update({
        collaboration_score: Math.round(avg * 10) / 10,
      }).eq('id', revieweeId);
    }

    // Increment sessions_count and people_met_count for both users
    const { data: myProfile } = await supabase.from('profiles').select('sessions_count, people_met_count').eq('id', user.id).single();
    if (myProfile) {
      await supabase.from('profiles').update({
        sessions_count: (myProfile.sessions_count || 0) + 1,
        people_met_count: (myProfile.people_met_count || 0) + 1,
      }).eq('id', user.id);
    }

    setSubmitting(false);
    toast({ title: '⭐ Review submitted!', description: `Thanks for reviewing ${revieweeName}.` });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-[2000]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border shadow-2xl z-[2100] max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="font-heading font-bold text-base text-foreground">Rate your session</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  How was coworking with <span className="font-semibold text-foreground">{revieweeName}</span>?
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-5 pb-6 space-y-5">
              {/* Star Rating */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
                  Overall Rating
                </label>
                <div className="flex gap-1.5 justify-center py-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredStar || rating)
                            ? 'fill-primary text-primary'
                            : 'text-border fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-xs text-muted-foreground mt-1">
                    {rating === 1 && 'Not great'}
                    {rating === 2 && 'Could be better'}
                    {rating === 3 && 'It was okay'}
                    {rating === 4 && 'Great session!'}
                    {rating === 5 && 'Amazing! 🎉'}
                  </p>
                )}
              </div>

              {/* Badge Tags */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
                  Award a badge (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {BADGE_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border active:scale-[0.95] ${
                        selectedTags.includes(tag.value)
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/20'
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
                  Comment (optional)
                </label>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="e.g. Great energy, would love to work together again!"
                  maxLength={500}
                  rows={3}
                  className="rounded-xl bg-background border-border resize-none text-sm"
                />
              </div>

              {/* Submit */}
              <Button
                className="w-full h-11 rounded-xl font-heading font-semibold gap-2"
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <>⭐ Submit Review</>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

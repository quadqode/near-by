import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  pinId: string;
}

const FEEDBACK_TAGS = [
  'Found a cowork buddy', 'Great conversations', 'Productive session',
  'Met new people', 'Good vibes', 'Will come back',
];

export default function PostSessionFeedback({ open, onClose, pinId }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async () => {
    if (!user) { onClose(); return; }
    setSaving(true);

    // Store feedback as a self-review on the pin session
    const { error } = await supabase.from('session_reviews').insert({
      session_id: pinId, // We use pinId as a reference
      reviewer_id: user.id,
      reviewee_id: user.id, // self-assessment
      rating,
      tags,
      comment: comment.trim(),
    });

    // Update collaboration score on profile
    if (!error) {
      const { data: reviews } = await supabase
        .from('session_reviews')
        .select('rating')
        .eq('reviewee_id', user.id);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase.from('profiles').update({
          collaboration_score: Math.round(avg * 10) / 10,
          sessions_count: reviews.length,
        }).eq('id', user.id);
      }
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Error saving feedback', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Thanks for your feedback! 🙏' });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-card border-border z-[3000]">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground text-center">How was your session?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            Your pin has expired. Share how your cowork session went.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Star rating */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    s <= (hoverRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">What happened?</label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border active:scale-[0.95] ${
                    tags.includes(t)
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Any notes? (optional)</label>
            <Textarea
              placeholder="e.g. Met a great designer at the café!"
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={200}
              rows={2}
              className="rounded-xl border-border bg-background resize-none"
            />
          </div>

          <div className="flex gap-2.5">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl font-heading font-semibold border-border">
              Skip
            </Button>
            <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl font-heading font-semibold" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

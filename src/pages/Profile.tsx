import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, LogOut, Star, Users, MapPin, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const COLLAB_STYLES = [
  'Quiet coworker', 'Loves brainstorming', 'Focused worker',
  'Social butterfly', 'Pair programmer', 'Mentor', 'Open to anything',
];

interface ProfileData {
  display_name: string;
  bio: string;
  collaboration_style: string[];
  collaboration_score: number;
  sessions_count: number;
  people_met_count: number;
  cafes_visited: number;
}

interface Badge {
  id: string;
  badge_type: string;
  earned_at: string;
}

const BADGE_META: Record<string, { emoji: string; label: string }> = {
  reliable_coworker: { emoji: '🤝', label: 'Reliable Coworker' },
  great_conversation: { emoji: '💬', label: 'Great Conversation' },
  quiet_partner: { emoji: '🔇', label: 'Quiet Work Partner' },
  super_connector: { emoji: '⭐', label: 'Super Connector' },
  early_adopter: { emoji: '🚀', label: 'Early Adopter' },
};

export default function Profile() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStyles, setEditStyles] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadProfile();
      loadBadges();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, bio, collaboration_style, collaboration_score, sessions_count, people_met_count, cafes_visited')
      .eq('id', user!.id)
      .single();
    if (data) {
      setProfile(data as ProfileData);
      setEditName(data.display_name);
      setEditBio(data.bio || '');
      setEditStyles((data.collaboration_style as string[]) || []);
    }
  };

  const loadBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user!.id);
    if (data) setBadges(data as Badge[]);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editName.trim(),
        bio: editBio.trim(),
        collaboration_style: editStyles,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
      setEditing(false);
      loadProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleStyle = (s: string) => {
    setEditStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border shadow-lg p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              {profile.display_name.charAt(0).toUpperCase() || '?'}
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-xl text-xs">
                Edit profile
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Display name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 rounded-xl bg-background border-border" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Bio / tagline</label>
                <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="e.g. Building a fintech startup" maxLength={160} rows={2} className="rounded-xl bg-background border-border resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Collaboration style</label>
                <div className="flex flex-wrap gap-2">
                  {COLLAB_STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border active:scale-[0.95] ${
                        editStyles.includes(s)
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 h-10 rounded-xl font-heading font-semibold text-sm" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="h-10 rounded-xl text-sm">Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">{profile.display_name || 'Anonymous'}</h2>
              {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
              {profile.collaboration_style.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.collaboration_style.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-accent text-accent-foreground border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Collaboration Score */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl border border-border shadow-lg p-5 mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Collaboration Score</h3>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-3xl font-heading font-bold text-foreground">{profile.collaboration_score.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-1">/ 5.0</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <div className="text-xl font-heading font-bold text-foreground">{profile.people_met_count}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">People met</div>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-lg p-4 text-center">
            <MapPin className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <div className="text-xl font-heading font-bold text-foreground">{profile.cafes_visited}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cafés visited</div>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-lg p-4 text-center">
            <Award className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <div className="text-xl font-heading font-bold text-foreground">{profile.sessions_count}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sessions</div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl border border-border shadow-lg p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Badges</h3>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No badges yet. Start coworking to earn badges!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map(b => {
                const meta = BADGE_META[b.badge_type] || { emoji: '🏅', label: b.badge_type };
                return (
                  <div key={b.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent border border-border">
                    <span>{meta.emoji}</span>
                    <span className="text-xs font-medium text-accent-foreground">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

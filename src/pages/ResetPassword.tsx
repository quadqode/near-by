import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated!', description: 'You can now sign in.' });
      navigate('/auth');
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Set New Password</h1>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 rounded-xl bg-background border-border" required minLength={6} />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-heading font-semibold" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast({ title: 'Login failed', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome back! 🎉' });
        navigate('/');
      }
    } else {
      if (!displayName.trim()) {
        toast({ title: 'Name required', description: 'Please enter your display name.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const cleanedPhone = phone.replace(/[^\d]/g, '').trim();
      const { error } = await signUp(email, password, displayName, cleanedPhone ? `+91${cleanedPhone}` : undefined);
      setLoading(false);
      if (error) {
        toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Account created!', description: 'Please check your email to verify your account.' });
        setMode('login');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Enter your email', description: 'Please enter your email address first.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Reset email sent', description: 'Check your inbox for a password reset link.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-1">🗺️ NearBy</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-background border-border text-base"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-background border-border text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-background border-border text-base"
                  required
                  minLength={6}
                />
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-primary font-semibold hover:underline mt-1.5 block ml-auto"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Phone Number <span className="text-muted-foreground/60 normal-case">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center h-12 px-3 rounded-xl bg-muted/50 border border-border text-sm font-medium text-foreground shrink-0">
                    🇮🇳 +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    className="h-12 rounded-xl bg-background border-border text-base"
                    maxLength={12}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl font-heading font-semibold" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Continue without account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Auth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned || cleaned.length < 10) {
      toast({ title: 'Invalid phone', description: 'Please enter a valid phone number with country code.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signInWithPhone(cleaned.startsWith('+') ? cleaned : `+91${cleaned}`);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'OTP sent!', description: 'Check your phone for a verification code.' });
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit code.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const fullPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;
    const { error } = await verifyOtp(fullPhone, otp);
    setLoading(false);
    if (error) {
      toast({ title: 'Verification failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome to NearBy! 🎉' });
      navigate('/');
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
            {step === 'phone' ? 'Sign in with your phone number' : 'Enter the verification code'}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Phone number</label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center h-12 px-3 rounded-xl bg-muted/50 border border-border text-sm font-medium text-foreground shrink-0">
                    🇮🇳 +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ''))}
                    className="h-12 rounded-xl bg-background border-border text-base"
                    maxLength={12}
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">We'll send you a one-time verification code</p>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-heading font-semibold" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex flex-col items-center">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 block">Enter 6-digit OTP</label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Sent to <span className="font-medium text-foreground">{phone}</span>
                </p>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-heading font-semibold" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Sign In
              </Button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Change number
              </button>
            </form>
          )}
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

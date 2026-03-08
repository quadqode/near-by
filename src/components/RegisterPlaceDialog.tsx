import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RegisterPlaceDialog({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: '' as string,
    address: '',
    hours: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    hasWifi: false,
    hasPower: false,
  });

  const update = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.type || !form.address.trim() || !form.contactEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any).from('place_registrations').insert({
        name: form.name.trim().slice(0, 100),
        type: form.type,
        address: form.address.trim().slice(0, 200),
        hours: form.hours.trim().slice(0, 50),
        description: form.description.trim().slice(0, 500),
        contact_email: form.contactEmail.trim().slice(0, 100),
        contact_phone: form.contactPhone.trim().slice(0, 20),
        has_wifi: form.hasWifi,
        has_power: form.hasPower,
      });

      if (error) throw error;

      toast.success('Registration submitted! We\'ll review your place shortly.');
      setForm({ name: '', type: '', address: '', hours: '', description: '', contactEmail: '', contactPhone: '', hasWifi: false, hasPower: false });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] rounded-2xl bg-card border-border z-[2000]">
        <DialogHeader>
          <div className="mx-auto w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-1">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-center font-heading">Register Your Place</DialogTitle>
          <DialogDescription className="text-center text-xs">
            Submit your café, restaurant, or coworking space to be listed on CoWork Drop
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs font-semibold">Place Name *</Label>
            <Input
              placeholder="e.g. The Paris Coffeehouse"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              maxLength={100}
              className="mt-1 h-10 rounded-xl text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Type *</Label>
            <Select value={form.type} onValueChange={v => update('type', v)}>
              <SelectTrigger className="mt-1 h-10 rounded-xl text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe">☕ Café</SelectItem>
                <SelectItem value="coworking">🏢 Coworking Space</SelectItem>
                <SelectItem value="library">📚 Library</SelectItem>
                <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Address *</Label>
            <Input
              placeholder="Full address"
              value={form.address}
              onChange={e => update('address', e.target.value)}
              maxLength={200}
              className="mt-1 h-10 rounded-xl text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Operating Hours</Label>
            <Input
              placeholder="e.g. 8am – 10pm"
              value={form.hours}
              onChange={e => update('hours', e.target.value)}
              maxLength={50}
              className="mt-1 h-10 rounded-xl text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Description</Label>
            <Textarea
              placeholder="Tell us about your place..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              maxLength={500}
              className="mt-1 rounded-xl text-sm min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Email *</Label>
              <Input
                type="email"
                placeholder="you@email.com"
                value={form.contactEmail}
                onChange={e => update('contactEmail', e.target.value)}
                maxLength={100}
                className="mt-1 h-10 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Phone</Label>
              <Input
                type="tel"
                placeholder="+91..."
                value={form.contactPhone}
                onChange={e => update('contactPhone', e.target.value)}
                maxLength={20}
                className="mt-1 h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasWifi}
                onChange={e => update('hasWifi', e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-xs font-medium">WiFi Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasPower}
                onChange={e => update('hasPower', e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-xs font-medium">Power Outlets</span>
            </label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-xl font-heading font-semibold text-sm gap-2 mt-2"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

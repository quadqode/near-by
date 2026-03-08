import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, LogOut, CheckCircle, XCircle, Clock, Mail, Phone, Wifi, Plug, Store } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlaceRequest {
  id: string;
  name: string;
  type: string;
  address: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  has_wifi: boolean;
  has_power: boolean;
  hours: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<PlaceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/admin/login'); return; }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles?.some((r: any) => r.role === 'admin')) {
      toast.error('No admin access');
      navigate('/admin/login');
      return;
    }

    await loadRequests();
  };

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('place_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { toast.error('Failed to load requests'); console.error(error); }
    else setRequests(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    const { error } = await supabase
      .from('place_registrations')
      .update({ status })
      .eq('id', id);

    if (error) { toast.error('Failed to update'); console.error(error); }
    else {
      toast.success(`Request ${status}`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
    setUpdating(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">Pending</Badge>;
  };

  const filterByStatus = (status: string) =>
    requests.filter(r => r.status === status);

  const RequestCard = ({ req }: { req: PlaceRequest }) => (
    <Card key={req.id} className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-heading font-semibold text-foreground truncate">{req.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground capitalize">{req.type}</p>
          </div>
          {statusBadge(req.status)}
        </div>

        <p className="text-sm text-muted-foreground">{req.address}</p>
        {req.description && <p className="text-sm text-foreground/80">{req.description}</p>}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{req.contact_email}</span>
          {req.contact_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{req.contact_phone}</span>}
          {req.has_wifi && <span className="flex items-center gap-1"><Wifi className="h-3 w-3" />WiFi</span>}
          {req.has_power && <span className="flex items-center gap-1"><Plug className="h-3 w-3" />Power</span>}
          {req.hours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.hours}</span>}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Submitted {new Date(req.created_at).toLocaleDateString()}
        </p>

        {req.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              disabled={updating === req.id}
              onClick={() => updateStatus(req.id, 'approved')}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={updating === req.id}
              onClick={() => updateStatus(req.id, 'rejected')}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="font-heading font-bold text-foreground">Admin Panel</h1>
        </div>
        <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading requests…</div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="w-full">
              <TabsTrigger value="pending" className="flex-1 gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Pending ({filterByStatus('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex-1 gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Approved ({filterByStatus('approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1 gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Rejected ({filterByStatus('rejected').length})
              </TabsTrigger>
            </TabsList>

            {['pending', 'approved', 'rejected'].map(status => (
              <TabsContent key={status} value={status} className="space-y-3 mt-4">
                {filterByStatus(status).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">No {status} requests</p>
                ) : (
                  filterByStatus(status).map(req => <RequestCard key={req.id} req={req} />)
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
}

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useHiNotifications() {
  const { user } = useAuth();
  const permissionRef = useRef<NotificationPermission>('default');

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      permissionRef.current = result;
    }
  }, []);

  useEffect(() => {
    if (user) requestPermission();
  }, [user, requestPermission]);

  useEffect(() => {
    if (!user) return;

    // Listen for new greetings on my pins
    const channel = supabase
      .channel('hi-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'greetings' },
        async (payload) => {
          const greeting = payload.new as { pin_id: string; sender_id: string };
          if (greeting.sender_id === user.id) return; // ignore own

          // Check if this greeting is for one of my pins
          const { data: pin } = await supabase
            .from('pins')
            .select('id, user_id')
            .eq('id', greeting.pin_id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (!pin) return;

          // Get sender name
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', greeting.sender_id)
            .maybeSingle();

          const name = profile?.display_name || 'Someone';

          // Show browser notification
          if (permissionRef.current === 'granted' && document.hidden) {
            new Notification('👋 New Hi Request!', {
              body: `${name} wants to connect with you`,
              icon: '/placeholder.svg',
              tag: `hi-${greeting.pin_id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}

'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function useApplicationRealtime(applicationId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const retryCountRef = useRef(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();
    const channelName = applicationId
      ? `app-status-${applicationId}`
      : `app-status-student-${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: applicationId
            ? `id=eq.${applicationId}`
            : `student_id=eq.${user.id}`,
        },
        () => {
          // Invalidate queries on any change
          if (applicationId) {
            queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
          }
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          retryCountRef.current = 0;
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          retryCountRef.current = 0;
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          retryCountRef.current += 1;
          if (retryCountRef.current > 5) {
            // Fall back to polling
            channel.unsubscribe();
            pollingRef.current = setInterval(() => {
              if (applicationId) {
                queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
              }
              queryClient.invalidateQueries({ queryKey: ['applications'] });
            }, 30000);
          }
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [user?.id, applicationId, queryClient]);
}

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function SessionExpiredToast() {
  const router = useRouter();
  const hasNotified = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT' && !hasNotified.current) {
          hasNotified.current = true;
          toast.error('Your session has expired. Please log in again.', {
            duration: 5000,
            action: {
              label: 'Log in',
              onClick: () => router.push('/login'),
            },
          });

          // Reset after a delay
          setTimeout(() => {
            hasNotified.current = false;
          }, 10000);
        }

        if (event === 'SIGNED_IN') {
          hasNotified.current = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}

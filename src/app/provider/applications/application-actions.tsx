'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: string;
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    setIsLoading(newStatus);
    try {
      const res = await fetch(`/api/v1/provider/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update application status');
      }

      toast({
        title: 'Success',
        description: `Application ${newStatus}.`,
      });

      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  }

  // Only show actions for actionable statuses
  if (currentStatus === 'accepted' || currentStatus === 'rejected') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => handleStatusChange('accepted')}
        disabled={isLoading !== null}
        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7"
      >
        {isLoading === 'accepted' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3 mr-1" />
        )}
        Accept
      </Button>
      <Button
        size="sm"
        onClick={() => handleStatusChange('rejected')}
        disabled={isLoading !== null}
        className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 h-7"
      >
        {isLoading === 'rejected' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3 mr-1" />
        )}
        Reject
      </Button>
      <Button
        size="sm"
        onClick={() => handleStatusChange('waitlisted')}
        disabled={isLoading !== null}
        variant="outline"
        className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs px-2 py-1 h-7"
      >
        {isLoading === 'waitlisted' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Clock className="h-3 w-3 mr-1" />
        )}
        Waitlist
      </Button>
    </div>
  );
}

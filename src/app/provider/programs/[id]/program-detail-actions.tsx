'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, XCircle, Archive } from 'lucide-react';

interface ProgramDetailActionsProps {
  programId: string;
  currentStatus: string;
}

export function ProgramDetailActions({ programId, currentStatus }: ProgramDetailActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    setIsLoading(newStatus);
    try {
      const res = await fetch(`/api/v1/provider/programs/${programId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update program status');
      }

      toast({
        title: 'Success',
        description: `Program status updated to ${newStatus}.`,
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

  return (
    <div className="flex items-center gap-3">
      {currentStatus === 'draft' && (
        <Button
          onClick={() => handleStatusChange('published')}
          disabled={isLoading !== null}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading === 'published' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          Publish
        </Button>
      )}

      {currentStatus === 'published' && (
        <Button
          onClick={() => handleStatusChange('closed')}
          disabled={isLoading !== null}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isLoading === 'closed' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Close Applications
        </Button>
      )}

      {(currentStatus === 'draft' || currentStatus === 'published' || currentStatus === 'closed') && (
        <Button
          onClick={() => handleStatusChange('archived')}
          disabled={isLoading !== null}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          {isLoading === 'archived' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Archive className="h-4 w-4 mr-2" />
          )}
          Archive
        </Button>
      )}
    </div>
  );
}

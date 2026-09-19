'use client';

import { useCopilotStore } from '@/stores/copilot-store';

export function CopilotRateLimitBanner() {
  const { rateLimitRemaining, rateLimitResetsAt } = useCopilotStore();

  if (rateLimitRemaining > 10) return null;

  const getTimeRemaining = () => {
    if (!rateLimitResetsAt) return '';
    const diff = new Date(rateLimitResetsAt).getTime() - Date.now();
    if (diff <= 0) return '';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `Resets in ${hours}h ${minutes}m`;
  };

  if (rateLimitRemaining <= 0) {
    return (
      <p className="text-[11px] text-red-400 mt-2 px-1">
        You&apos;ve used all 50 messages today. {getTimeRemaining()}
      </p>
    );
  }

  return (
    <p className="text-[11px] text-amber-400 mt-2 px-1">
      {rateLimitRemaining} messages remaining today
    </p>
  );
}

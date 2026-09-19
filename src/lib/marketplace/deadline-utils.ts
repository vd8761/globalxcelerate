export function getDeadlineUrgency(
  deadline: string | null
): 'critical' | 'warning' | 'normal' | 'none' {
  if (!deadline) return 'none';
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'none';
  if (diffDays <= 3) return 'critical';
  if (diffDays <= 7) return 'warning';
  return 'normal';
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline';
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Expired';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  if (diffDays <= 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;

  return `Due ${deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export function isExpired(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function getCountdown(deadline: string): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = Math.max(0, deadlineDate.getTime() - now.getTime());

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

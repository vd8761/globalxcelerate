import type { ApplicationStatus } from './types';

export const VALID_TRANSITIONS: Record<ApplicationStatus, { to: ApplicationStatus; actors: string[] }[]> = {
  draft: [
    { to: 'submitted', actors: ['student'] },
    { to: 'withdrawn', actors: ['student'] },
  ],
  submitted: [
    { to: 'under_review', actors: ['employer', 'admin'] },
    { to: 'rejected', actors: ['employer', 'admin'] },
    { to: 'withdrawn', actors: ['student'] },
  ],
  under_review: [
    { to: 'shortlisted', actors: ['employer', 'admin'] },
    { to: 'rejected', actors: ['employer', 'admin'] },
    { to: 'withdrawn', actors: ['student'] },
  ],
  shortlisted: [
    { to: 'assessment', actors: ['employer', 'admin'] },
    { to: 'interview', actors: ['employer', 'admin'] },
    { to: 'rejected', actors: ['employer', 'admin'] },
  ],
  assessment: [
    { to: 'interview', actors: ['employer', 'admin'] },
    { to: 'shortlisted', actors: ['employer', 'admin'] },
    { to: 'rejected', actors: ['employer', 'admin'] },
  ],
  interview: [
    { to: 'selected', actors: ['employer', 'admin'] },
    { to: 'rejected', actors: ['employer', 'admin'] },
  ],
  selected: [],
  rejected: [],
  withdrawn: [],
};

export function validateTransition(
  currentStatus: ApplicationStatus,
  targetStatus: ApplicationStatus,
  actorRole: string
): { valid: boolean; error?: string } {
  const transitions = VALID_TRANSITIONS[currentStatus];
  if (!transitions || transitions.length === 0) {
    return { valid: false, error: `No transitions available from status '${currentStatus}'` };
  }

  const match = transitions.find((t) => t.to === targetStatus);
  if (!match) {
    return { valid: false, error: `Cannot transition from '${currentStatus}' to '${targetStatus}'` };
  }

  if (!match.actors.includes(actorRole) && actorRole !== 'admin') {
    return { valid: false, error: `Role '${actorRole}' cannot perform this transition` };
  }

  return { valid: true };
}

export function getAvailableTransitions(
  currentStatus: ApplicationStatus,
  actorRole: string
): ApplicationStatus[] {
  const transitions = VALID_TRANSITIONS[currentStatus];
  if (!transitions) return [];

  return transitions
    .filter((t) => t.actors.includes(actorRole) || actorRole === 'admin')
    .map((t) => t.to);
}

export function isTerminalStatus(status: ApplicationStatus): boolean {
  return ['selected', 'rejected', 'withdrawn'].includes(status);
}

export function canStudentEdit(status: ApplicationStatus): boolean {
  return status === 'draft';
}

export function canStudentWithdraw(status: ApplicationStatus): boolean {
  return status === 'submitted' || status === 'under_review';
}

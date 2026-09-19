import { checkRateLimit, resetRateLimit } from './rate-limiter';
import { RATE_LIMITS, SESSION_CONFIG } from './constants';

interface BruteForceResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutUntil?: Date;
}

export function checkLoginAttempt(email: string, ip: string): BruteForceResult {
  const key = `login_attempts:${email.toLowerCase()}`;
  const ipKey = `login_attempts_ip:${ip}`;

  const emailResult = checkRateLimit(
    key,
    RATE_LIMITS.bruteForce.limit,
    RATE_LIMITS.bruteForce.windowSeconds
  );

  const ipResult = checkRateLimit(
    ipKey,
    RATE_LIMITS.login.limit,
    RATE_LIMITS.login.windowSeconds
  );

  if (!emailResult.allowed) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutUntil: new Date(Date.now() + SESSION_CONFIG.lockoutDuration * 1000),
    };
  }

  if (!ipResult.allowed) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutUntil: ipResult.resetAt,
    };
  }

  return {
    allowed: true,
    remainingAttempts: emailResult.remaining,
  };
}

export function recordLoginSuccess(email: string): void {
  const key = `login_attempts:${email.toLowerCase()}`;
  resetRateLimit(key);
}

export function recordLoginFailure(
  email: string,
  _ip: string,
  _userAgent?: string,
  _failureReason?: string
): BruteForceResult {
  // The rate limit was already incremented in checkLoginAttempt
  // This function can be used for additional logging
  const key = `login_attempts:${email.toLowerCase()}`;
  const result = checkRateLimit(
    key,
    RATE_LIMITS.bruteForce.limit,
    RATE_LIMITS.bruteForce.windowSeconds
  );

  return {
    allowed: result.allowed,
    remainingAttempts: result.remaining,
    lockoutUntil: result.allowed ? undefined : result.resetAt,
  };
}

import type { CircuitBreakerState } from '../types';

interface FailureRecord {
  timestamp: number;
}

/**
 * Circuit Breaker: Protect against cascading AI API failures.
 * States: CLOSED (normal) → OPEN (failures) → HALF_OPEN (testing)
 */
export class CircuitBreaker {
  private failures: FailureRecord[] = [];
  private state: CircuitBreakerState = 'CLOSED';
  private openedAt: number | null = null;
  private readonly failureThreshold = 3;
  private readonly windowMs = 60000; // 60 seconds
  private readonly cooldownMs = 300000; // 5 minutes

  canRequest(): boolean {
    this.cleanup();

    if (this.state === 'CLOSED') return true;

    if (this.state === 'OPEN') {
      // Check cooldown
      if (this.openedAt && Date.now() - this.openedAt >= this.cooldownMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    // HALF_OPEN: allow one request
    return true;
  }

  recordFailure(): void {
    this.failures.push({ timestamp: Date.now() });
    this.cleanup();

    const recentFailures = this.failures.filter(f => Date.now() - f.timestamp < this.windowMs);

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    } else if (recentFailures.length >= this.failureThreshold) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = [];
      this.openedAt = null;
    }
  }

  getState(): CircuitBreakerState {
    this.cleanup();
    if (this.state === 'OPEN' && this.openedAt && Date.now() - this.openedAt >= this.cooldownMs) {
      this.state = 'HALF_OPEN';
    }
    return this.state;
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.failures = this.failures.filter(f => f.timestamp > cutoff);
  }
}

// Singleton instance
export const copilotCircuitBreaker = new CircuitBreaker();

// ============================================================
// Retry Utility — Exponential backoff with jitter
// ============================================================
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;  // ms
  maxDelay: number;      // ms
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * RxJS operator: retries with exponential backoff + jitter.
 * Useful for AI assistant requests, API calls, WebSocket reconnects.
 */
export function retryWithBackoff<T>(config: Partial<RetryConfig> = {}) {
  const { maxRetries, initialDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, attempt) => {
            if (attempt >= maxRetries) {
              return throwError(() => error);
            }
            const delay = Math.min(
              initialDelay * Math.pow(backoffFactor, attempt) + Math.random() * 500,
              maxDelay
            );
            console.warn(`[RetryWithBackoff] Attempt ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms`, error);
            return timer(delay);
          })
        )
      )
    );
}

/**
 * Creates a unique action ID for deduplication in offline queue.
 */
export function generateActionId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generates a short human-readable order number.
 */
export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

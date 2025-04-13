export interface RetryStrategy {
    getDelayMs(attemptNumber: number): number;
  }
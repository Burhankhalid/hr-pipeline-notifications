import { RetryStrategy } from './retry.strategy';

export class ExponentialBackoffStrategy implements RetryStrategy {
  private readonly baseDelayMs = 1000; // 1 second
  private readonly maxDelayMs = 3600000; // 1 hour
  private readonly factor = 2;
  
  getDelayMs(attemptNumber: number): number {
    // Exponential backoff: baseDelay * (factor ^ attemptNumber)
    const delay = this.baseDelayMs * Math.pow(this.factor, attemptNumber);
    
    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
    
    // Ensure we don't exceed max delay
    return Math.min(delay * jitter, this.maxDelayMs);
  }
}
/**
 * Utility functions for implementing retry logic with exponential backoff
 * Specifically designed to handle Render cold starts and network issues
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      return true;
    }
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    // Retry on specific Supabase errors that might indicate cold start
    if (error?.message?.includes('connection') || error?.message?.includes('timeout')) {
      return true;
    }
    return false;
  },
  onRetry: () => {}
};

/**
 * Executes a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt or if we shouldn't retry this error
      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );

      // Add some jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;


      opts.onRetry(attempt, error);

      await sleep(jitteredDelay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Specific retry configuration for Supabase operations
 */
export const SUPABASE_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 4,
  baseDelay: 2000, // Start with 2 seconds for cold starts
  maxDelay: 60000, // Max 1 minute
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    // More specific retry logic for Supabase
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code;
    
    // Network-related errors
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorCode === 'NETWORK_ERROR') {
      return true;
    }
    
    // Server errors (5xx)
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    
    // Don't retry on authentication or permission errors
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    
    return false;
  },
  onRetry: () => {}
};

/**
 * Specific retry configuration for Pokemon API operations
 */
export const POKEMON_API_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    const status = error?.status;
    // Retry on rate limits and server errors
    return status === 429 || (status >= 500 && status < 600);
  },
  onRetry: () => {}
};
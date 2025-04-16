
import { toast } from 'sonner';

interface ApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number; // in milliseconds
  skipErrorToast?: boolean;
  errorMessage?: string;
}

/**
 * A safe wrapper for API calls with error handling and retry logic
 */
export async function safeApiCall<T>(
  apiPromise: () => Promise<T>,
  options: ApiCallOptions<T> = {}
): Promise<{ data: T | null; error: Error | null }> {
  const {
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
    skipErrorToast = false,
    errorMessage = 'Operation failed'
  } = options;

  let lastError: Error | null = null;
  let attemptCount = 0;

  while (attemptCount <= retries) {
    try {
      const data = await apiPromise();
      onSuccess?.(data);
      return { data, error: null };
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(error?.message || 'Unknown error');
      
      // Call onError callback if this is the final attempt
      if (attemptCount === retries) {
        onError?.(lastError);
        
        // Show toast notification unless disabled
        if (!skipErrorToast) {
          toast.error(errorMessage, {
            description: lastError.message
          });
        }
      }
      
      // If we have retries left, wait before next attempt
      if (attemptCount < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      attemptCount++;
    }
  }

  return { data: null, error: lastError };
}

/**
 * Debounced function helper to prevent rapid successive calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

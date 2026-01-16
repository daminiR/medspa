/**
 * Retry a function on Prisma transaction conflicts (P2034)
 */
export async function retryOnConflict<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Only retry on transaction conflict
      if (error?.code !== 'P2034') {
        throw error;
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms...
        await new Promise(resolve =>
          setTimeout(resolve, 100 * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError;
}

/**
 * Generic retry with exponential backoff
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 100,
    maxDelay = 5000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

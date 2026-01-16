import Reactotron from '../config/ReactotronConfig';

/**
 * Enhanced logging utilities that work with Reactotron
 *
 * Usage:
 * import { logger } from '@/utils/logger';
 *
 * logger.log('User clicked button', { userId: 123 });
 * logger.error('API failed', error);
 * logger.display({ title: 'User Data', value: userData });
 */

export const logger = {
  /**
   * Log general information
   */
  log: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[LOG] ${message}`, data || '');
      Reactotron.log(message, data);
    }
  },

  /**
   * Log errors
   */
  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`, error || '');
      Reactotron.error(message, error);
    }
  },

  /**
   * Log warnings
   */
  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, data || '');
      Reactotron.warn(data ? `${message}: ${JSON.stringify(data)}` : message);
    }
  },

  /**
   * Display formatted data in Reactotron
   */
  display: ({ title, value, important = false }: { title: string; value: any; important?: boolean }) => {
    if (__DEV__) {
      Reactotron.display({
        name: title,
        value: value,
        important,
      });
    }
  },

  /**
   * Log API requests
   */
  apiRequest: (url: string, method: string, data?: any) => {
    if (__DEV__) {
      console.log(`[API ${method}] ${url}`, data || '');
      Reactotron.log(`API ${method}: ${url}`, data);
    }
  },

  /**
   * Log API responses
   */
  apiResponse: (url: string, status: number, data?: any) => {
    if (__DEV__) {
      console.log(`[API ${status}] ${url}`, data || '');
      Reactotron.log(`API Response ${status}: ${url}`, data);
    }
  },

  /**
   * Log component lifecycle events
   */
  component: (name: string, event: string, data?: any) => {
    if (__DEV__) {
      console.log(`[${name}] ${event}`, data || '');
      Reactotron.log(`[${name}] ${event}`, data);
    }
  },
};

export default logger;

import { getEnv, isDev } from '../utils/env';

// Performance monitoring and error tracking service
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorLogs: ErrorLog[] = [];
  private maxMetrics = 100;
  private maxErrors = 50;

  private constructor() {
    // Initialize monitoring
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Track performance metric
   */
  trackPerformance(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);

    // Keep only the most recent metrics
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics.shift();
    }

    // Log to console in development
    if (isDev()) {
      console.log(`[Performance] ${name}: ${duration}ms`, metadata || '');
    }

    // Send to monitoring service (e.g., Sentry, Vercel Analytics)
    this.sendMetric(metric);
  }

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: Date.now(),
      context,
    };

    this.errorLogs.push(errorLog);

    // Keep only the most recent errors
    if (this.errorLogs.length > this.maxErrors) {
      this.errorLogs.shift();
    }

    // In development, suppress API-related errors (they're expected when backend isn't ready)
    const isApiError = errorLog.message.includes('API') ||
                       errorLog.message.includes('endpoint not found') ||
                       errorLog.message.includes('Invalid JSON');

    if (!isDev() || !isApiError) {
      console.error('[Error]', errorLog.message, errorLog.context || '');
    }

    // Send to error tracking service
    this.sendError(errorLog);
  }

  /**
   * Measure async function performance
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.trackPerformance(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.trackPerformance(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get recent performance metrics
   */
  getRecentMetrics(limit: number = 10): PerformanceMetric[] {
    return this.performanceMetrics.slice(-limit);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errorLogs.slice(-limit);
  }

  /**
   * Get average performance for a metric
   */
  getAveragePerformance(name: string): number | null {
    const metrics = this.performanceMetrics.filter(m => m.name === name);
    if (metrics.length === 0) return null;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(total / metrics.length);
  }

  /**
   * Get performance percentile (P90, P95, P99)
   */
  getPerformancePercentile(name: string, percentile: number = 90): number | null {
    const metrics = this.performanceMetrics.filter(m => m.name === name);
    if (metrics.length === 0) return null;

    const sorted = metrics.map(m => m.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Clear all metrics and errors
   */
  clear(): void {
    this.performanceMetrics = [];
    this.errorLogs = [];
  }

  private handleGlobalError(event: ErrorEvent): void {
    // In development, ignore common API errors
    const errorMessage = event.error?.message || event.message || '';
    const isApiError = errorMessage.includes('API') ||
                       errorMessage.includes('endpoint not found') ||
                       errorMessage.includes('Invalid JSON') ||
                       errorMessage.includes('is not valid JSON');

    if (isDev() && isApiError) {
      event.preventDefault(); // Prevent default error reporting
      return;
    }

    this.trackError(event.error || event.message, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    // In development, ignore common API errors
    const reasonMessage = event.reason?.message || event.reason || '';
    const isApiError = typeof reasonMessage === 'string' &&
                       (reasonMessage.includes('API') ||
                        reasonMessage.includes('endpoint not found') ||
                        reasonMessage.includes('Invalid JSON') ||
                        reasonMessage.includes('is not valid JSON'));

    if (isDev() && isApiError) {
      event.preventDefault(); // Prevent default error reporting
      return;
    }

    this.trackError(event.reason, {
      type: 'unhandled_rejection',
    });
  }

  private sendMetric(metric: PerformanceMetric): void {
    // In production, send to monitoring service
    // For now, this is a placeholder for integration with:
    // - Vercel Analytics
    // - Sentry
    // - Custom monitoring endpoint

    if (typeof window !== 'undefined' && (window as any).gtag) {
      // Google Analytics
      (window as any).gtag('event', metric.name, {
        event_category: 'Performance',
        value: metric.duration,
      });
    }
  }

  private sendError(errorLog: ErrorLog): void {
    // In production, send to error tracking service
    // For now, this is a placeholder for integration with:
    // - Sentry
    // - Custom error tracking endpoint

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      // Sentry
      (window as any).Sentry.captureException(errorLog.message, {
        contexts: {
          custom: errorLog.context,
        },
      });
    }
  }
}

// Export singleton instance
export const monitoringService = MonitoringService.getInstance();

// Helper functions for easier access
export const captureError = (error: Error | string, context?: Record<string, any>) => 
  monitoringService.trackError(error, context);

export const addBreadcrumb = (category: string, message: string, data?: Record<string, any>) => 
  monitoringService.trackPerformance(`breadcrumb:${category}`, 0, { ...data, message });

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost', /^\//],
        routeHook: (route) => {
          // Add custom route naming
          return route;
        }
      })
    ],
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Configure which errors to ignore
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error exception captured',
      'Network request failed'
    ],

    // Before send hook for filtering
    beforeSend(event, hint) {
      // Filter out certain errors
      const error = hint.originalException;
      if (error && error.message && error.message.includes('Network request failed')) {
        return null; // Ignore network errors
      }
      return event;
    }
  });
}

// Error boundary component for React
export function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  if (!SENTRY_DSN) {
    return <>{children}</>;
  }

  return (
    <Sentry.ErrorBoundary fallback={fallback} showDialog>
      {children}
    </Sentry.ErrorBoundary>
  );
}

// Helper to capture手动错误
export function captureError(error: Error, context?: Record<string, any>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
  console.error('Error captured:', error, context);
}

// Helper to capture消息
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level as any);
  }
  console.log(`[${level}] ${message}`);
}

// Set user context for Sentry
export function setUserContext(userId: string, email?: string) {
  if (SENTRY_DSN) {
    Sentry.setUser({ id: userId, email });
  }
}

// Clear user context
export function clearUserContext() {
  if (SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

// Add breadcrumb for navigation
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>
) {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info'
    });
  }
}

export default Sentry;

import { useEffect } from "react";

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log slow components (> 100ms)
      if (duration > 100) {
        console.warn(`[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`);
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Send to analytics service
        // analytics.track('component_render', { componentName, duration });
      }
    };
  }, [componentName]);
}

export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 50) {
    console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }

  return duration;
}

// Web Vitals monitoring
export function useWebVitals() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('[Web Vitals] LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log('[Web Vitals] FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        console.log('[Web Vitals] CLS:', clsScore);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);
}

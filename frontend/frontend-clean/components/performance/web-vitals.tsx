'use client'

import { useReportWebVitals } from 'next/web-vitals'

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Only log in development and avoid excessive logging
    if (process.env.NODE_ENV === 'development') {
      // Throttle logging to prevent spam
      if (Math.random() < 0.1) { // Log only 10% of metrics
      }
    }

    // Send to analytics service (optional) with error handling
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          custom_parameter_1: metric.value,
          custom_parameter_2: metric.label,
          custom_parameter_3: metric.name,
        })
      }
    } catch (e) {
      // Ignore analytics errors
    }

    // Performance thresholds
    const thresholds = {
      CLS: 0.1,    // Cumulative Layout Shift
      FID: 100,    // First Input Delay (ms)
      FCP: 1800,   // First Contentful Paint (ms)
      LCP: 2500,   // Largest Contentful Paint (ms)
      TTFB: 800,   // Time to First Byte (ms)
    }

    // Check if metric exceeds threshold
    const threshold = thresholds[metric.name as keyof typeof thresholds]
    if (threshold && metric.value > threshold) {
      console.warn(`⚠️ ${metric.name} exceeded threshold:`, {
        value: metric.value,
        threshold,
        label: metric.label
      })
    }
  })

  return null
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Longtask API not supported
      }
    }
  }
}

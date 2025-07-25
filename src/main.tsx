import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Import i18n configuration
import "./i18n";

// Performance monitoring for production
if (import.meta.env.PROD) {
  // Dynamic import to avoid including web-vitals in development bundle
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    // Log Core Web Vitals metrics
    const logMetric = (metric: any) => {
      // In a real app, you'd send this to your analytics service
      console.log(`[Performance] ${metric.name}:`, metric.value, metric.rating);
      
      // Example: Send to analytics service
      // analytics.track('web-vital', {
      //   name: metric.name,
      //   value: metric.value,
      //   rating: metric.rating,
      //   id: metric.id,
      // });
    };

    getCLS(logMetric);
    getFID(logMetric);
    getFCP(logMetric);
    getLCP(logMetric);
    getTTFB(logMetric);
  }).catch(err => {
    console.warn('Failed to load web-vitals:', err);
  });

  // Log page load performance
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart,
      };
      
      console.log('[Performance] Page Load Metrics:', metrics);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

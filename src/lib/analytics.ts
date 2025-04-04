// This file handles Google Analytics integration

// Replace with your actual Google Analytics measurement ID
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your actual GA ID

// Initialize Google Analytics
export const initializeGA = () => {
  // Check if Google Analytics is already loaded
  if (window.gtag) return;

  // Create script elements for Google Analytics
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

  const inlineScript = document.createElement("script");
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { 'anonymize_ip': true });
  `;

  // Add scripts to document
  document.head.appendChild(gtagScript);
  document.head.appendChild(inlineScript);
};

// Remove Google Analytics
export const removeGA = () => {
  // Remove GA scripts
  const scripts = document.querySelectorAll(`script[src*="googletagmanager.com"]`);
  scripts.forEach((script) => script.remove());

  // Remove inline scripts that might have been added
  const inlineScripts = document.querySelectorAll("script");
  inlineScripts.forEach((script) => {
    if (script.innerHTML.includes("gtag") || script.innerHTML.includes("dataLayer")) {
      script.remove();
    }
  });

  // Remove cookies
  removeCookies();
};

// Track page view
export const trackPageView = (path: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: path,
      anonymize_ip: true,
    });
  }
};

// Track event
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Helper function to remove Google Analytics cookies
const removeCookies = () => {
  // Get all cookies
  const cookies = document.cookie.split(";");
  
  // Find and remove Google Analytics cookies
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const cookieName = cookie.split("=")[0];
    
    // Check if this is a Google Analytics cookie
    if (cookieName.startsWith("_ga") || cookieName.startsWith("_gid") || cookieName.startsWith("_gat")) {
      // Set expiration date to past date to remove the cookie
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      // Also try with domain
      const domain = window.location.hostname;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
    }
  }
  
  // Remove dataLayer if it exists
  if (window.dataLayer) {
    // @ts-ignore
    window.dataLayer = undefined;
  }
  
  // Remove gtag function if it exists
  if (window.gtag) {
    // @ts-ignore
    window.gtag = undefined;
  }
};

// Declare global window interface to include Google Analytics properties
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

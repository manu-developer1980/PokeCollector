import React, { createContext, useState, useEffect, ReactNode } from "react";

// Define the types of cookies we'll manage
export type CookieCategory = "necessary" | "analytics";

// Define the consent state
export interface ConsentState {
  necessary: boolean; // Always true, as necessary cookies are required
  analytics: boolean; // Google Analytics cookies
}

// Define the context interface
interface CookieConsentContextType {
  consentState: ConsentState;
  hasInteracted: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (category: CookieCategory, value: boolean) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  preferencesOpen: boolean;
}

// Create the context with default values
export const CookieConsentContext = createContext<CookieConsentContextType>({
  consentState: { necessary: true, analytics: false },
  hasInteracted: false,
  acceptAll: () => {},
  rejectAll: () => {},
  updateConsent: () => {},
  openPreferences: () => {},
  closePreferences: () => {},
  preferencesOpen: false,
});

// Local storage key for storing consent
const CONSENT_STORAGE_KEY = "cookie_consent_state";

// Props for the provider component
interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({
  children,
}) => {
  // Initialize state from localStorage or with defaults
  const [consentState, setConsentState] = useState<ConsentState>(() => {
    try {
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      return storedConsent
        ? JSON.parse(storedConsent)
        : { necessary: true, analytics: false };
    } catch (error) {
      console.error("Error reading consent from localStorage:", error);
      return { necessary: true, analytics: false };
    }
  });

  // Track if the user has interacted with the banner
  const [hasInteracted, setHasInteracted] = useState<boolean>(() => {
    return localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
  });

  // State for preferences dialog
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Save consent state to localStorage whenever it changes
  useEffect(() => {
    if (hasInteracted) {
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentState));
      } catch (error) {
        console.error("Error saving consent to localStorage:", error);
      }
    }
  }, [consentState, hasInteracted]);

  // Function to accept all cookies
  const acceptAll = () => {
    setConsentState({ necessary: true, analytics: true });
    setHasInteracted(true);
  };

  // Function to reject all non-necessary cookies
  const rejectAll = () => {
    setConsentState({ necessary: true, analytics: false });
    setHasInteracted(true);
  };

  // Function to update consent for a specific category
  const updateConsent = (category: CookieCategory, value: boolean) => {
    setConsentState((prev) => ({
      ...prev,
      [category]: value,
    }));
    setHasInteracted(true);
  };

  // Functions to open/close preferences dialog
  const openPreferences = () => setPreferencesOpen(true);
  const closePreferences = () => setPreferencesOpen(false);

  return (
    <CookieConsentContext.Provider
      value={{
        consentState,
        hasInteracted,
        acceptAll,
        rejectAll,
        updateConsent,
        openPreferences,
        closePreferences,
        preferencesOpen,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

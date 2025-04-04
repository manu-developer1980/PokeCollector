import { useContext } from "react";
import { CookieConsentContext } from "../contexts/CookieConsentContext";

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  
  return context;
};

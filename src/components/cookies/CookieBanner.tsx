import React, { useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { initializeGA, removeGA } from "@/lib/analytics";
import CookiePolicy from "./CookiePolicy";

const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const {
    consentState,
    hasInteracted,
    acceptAll,
    rejectAll,
    openPreferences,
    preferencesOpen,
  } = useCookieConsent();

  // Initialize or remove Google Analytics based on consent
  useEffect(() => {
    if (hasInteracted) {
      if (consentState.analytics) {
        initializeGA();
      } else {
        removeGA();
      }
    }
  }, [consentState.analytics, hasInteracted]);

  // Don't show the banner if the user has already interacted with it
  if (hasInteracted && !preferencesOpen) {
    return null;
  }

  // Show the preferences dialog if it's open
  if (preferencesOpen) {
    return <CookiePolicy />;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{t("cookies.title")}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {t("cookies.description")}
            </p>
            <Button
              variant="link"
              className="text-sm p-0 h-auto"
              onClick={openPreferences}
            >
              {t("cookies.learnMore")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="text-sm"
            >
              {t("cookies.rejectAll")}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={acceptAll}
              className="text-sm"
            >
              {t("cookies.acceptAll")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

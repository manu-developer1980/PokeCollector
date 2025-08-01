import React from "react";
import { useTranslation } from "react-i18next";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Button } from "@/components/ui/button";

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation();
  const { openPreferences } = useCookieConsent();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t("cookiePolicy.title")}</h1>
      
      <div className="prose prose-red max-w-none">
        <p className="text-lg mb-6">{t("cookiePolicy.introduction")}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.whatAreCookies.title")}</h2>
        <p>{t("cookiePolicy.whatAreCookies.description")}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.typesOfCookies.title")}</h2>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{t("cookies.preferences.necessary.title")}</h3>
        <p>{t("cookies.preferences.necessary.details")}</p>
        <p className="mt-2">{t("cookies.preferences.necessary.services")}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{t("cookies.preferences.analytics.title")}</h3>
        <p>{t("cookies.preferences.analytics.details")}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.howWeUse.title")}</h2>
        <p>{t("cookiePolicy.howWeUse.description")}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{t("cookiePolicy.googleAnalytics.title")}</h3>
        <p>{t("cookiePolicy.googleAnalytics.description")}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{t("cookiePolicy.stripe.title")}</h3>
        <p>{t("cookiePolicy.stripe.description")}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{t("cookiePolicy.supabase.title")}</h3>
        <p>{t("cookiePolicy.supabase.description")}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.managingCookies.title")}</h2>
        <p>{t("cookiePolicy.managingCookies.description")}</p>
        
        <div className="mt-6 mb-8">
          <Button onClick={openPreferences}>
            {t("cookiePolicy.manageCookies")}
          </Button>
        </div>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.browserSettings.title")}</h2>
        <p>{t("cookiePolicy.browserSettings.description")}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.updates.title")}</h2>
        <p>{t("cookiePolicy.updates.description")}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookiePolicy.contact.title")}</h2>
        <p>{t("cookiePolicy.contact.description")}</p>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>{t("cookiePolicy.lastUpdated")} {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;

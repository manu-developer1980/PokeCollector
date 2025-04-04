import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import privacyPolicyEs from "../../i18n/locales/privacyPolicy/es.json";
import privacyPolicyEn from "../../i18n/locales/privacyPolicy/en.json";

const PrivacyPolicy: React.FC = () => {
  const { i18n } = useTranslation();
  
  // Select translations based on current language
  const privacyTranslations = i18n.language === "es" ? privacyPolicyEs : privacyPolicyEn;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{privacyTranslations.title}</h1>
      
      <div className="prose prose-red max-w-none">
        <p className="text-lg mb-6">{privacyTranslations.lastUpdated} {new Date().toLocaleDateString()}</p>
        
        <p className="mb-6">{privacyTranslations.introduction}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.informationWeCollect.title}</h2>
        <p>{privacyTranslations.informationWeCollect.description}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{privacyTranslations.personalInformation.title}</h3>
        <p>{privacyTranslations.personalInformation.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{privacyTranslations.personalInformation.items.email}</li>
          <li>{privacyTranslations.personalInformation.items.name}</li>
          <li>{privacyTranslations.personalInformation.items.billingInfo}</li>
        </ul>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{privacyTranslations.usageData.title}</h3>
        <p>{privacyTranslations.usageData.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{privacyTranslations.usageData.items.ipAddress}</li>
          <li>{privacyTranslations.usageData.items.browserType}</li>
          <li>{privacyTranslations.usageData.items.pagesVisited}</li>
          <li>{privacyTranslations.usageData.items.timeSpent}</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.howWeUseInformation.title}</h2>
        <p>{privacyTranslations.howWeUseInformation.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{privacyTranslations.howWeUseInformation.items.provideService}</li>
          <li>{privacyTranslations.howWeUseInformation.items.improveService}</li>
          <li>{privacyTranslations.howWeUseInformation.items.communicate}</li>
          <li>{privacyTranslations.howWeUseInformation.items.processPayments}</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.dataStorage.title}</h2>
        <p>{privacyTranslations.dataStorage.description}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{privacyTranslations.supabase.title}</h3>
        <p>{privacyTranslations.supabase.description}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-3">{privacyTranslations.stripe.title}</h3>
        <p>{privacyTranslations.stripe.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.cookies.title}</h2>
        <p>{privacyTranslations.cookies.description}</p>
        <p className="mt-2">
          <Link to="/cookie-policy" className="text-red-600 hover:text-red-800 underline">
            {privacyTranslations.cookies.linkText}
          </Link>
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.dataSharing.title}</h2>
        <p>{privacyTranslations.dataSharing.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{privacyTranslations.dataSharing.items.serviceProviders}</li>
          <li>{privacyTranslations.dataSharing.items.legalRequirements}</li>
          <li>{privacyTranslations.dataSharing.items.businessTransfers}</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.dataRetention.title}</h2>
        <p>{privacyTranslations.dataRetention.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.yourRights.title}</h2>
        <p>{privacyTranslations.yourRights.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{privacyTranslations.yourRights.items.access}</li>
          <li>{privacyTranslations.yourRights.items.rectification}</li>
          <li>{privacyTranslations.yourRights.items.erasure}</li>
          <li>{privacyTranslations.yourRights.items.restriction}</li>
          <li>{privacyTranslations.yourRights.items.dataPortability}</li>
          <li>{privacyTranslations.yourRights.items.objection}</li>
        </ul>
        
        <p className="mt-4">{privacyTranslations.yourRights.exerciseRights}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.dataProtectionOfficer.title}</h2>
        <p>{privacyTranslations.dataProtectionOfficer.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.changes.title}</h2>
        <p>{privacyTranslations.changes.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{privacyTranslations.contact.title}</h2>
        <p>{privacyTranslations.contact.description}</p>
        <p className="mt-2">Email: support@pokecollector.com</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

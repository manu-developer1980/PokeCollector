import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import legalNoticeEs from "../../i18n/locales/legalNotice/es.json";
import legalNoticeEn from "../../i18n/locales/legalNotice/en.json";

const LegalNotice: React.FC = () => {
  const { i18n } = useTranslation();
  
  // Select translations based on current language
  const legalNoticeTranslations = i18n.language === "es" ? legalNoticeEs : legalNoticeEn;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{legalNoticeTranslations.title}</h1>
      
      <div className="prose prose-red max-w-none">
        <p className="text-lg mb-6">{legalNoticeTranslations.lastUpdated} {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.companyInfo.title}</h2>
        <p>{legalNoticeTranslations.companyInfo.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li><strong>{legalNoticeTranslations.companyInfo.items.name.label}:</strong> {legalNoticeTranslations.companyInfo.items.name.value}</li>
          <li><strong>{legalNoticeTranslations.companyInfo.items.nif.label}:</strong> {legalNoticeTranslations.companyInfo.items.nif.value}</li>
          <li><strong>{legalNoticeTranslations.companyInfo.items.address.label}:</strong> {legalNoticeTranslations.companyInfo.items.address.value}</li>
          <li><strong>{legalNoticeTranslations.companyInfo.items.email.label}:</strong> {legalNoticeTranslations.companyInfo.items.email.value}</li>
          <li><strong>{legalNoticeTranslations.companyInfo.items.website.label}:</strong> {legalNoticeTranslations.companyInfo.items.website.value}</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.purpose.title}</h2>
        <p>{legalNoticeTranslations.purpose.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.termsOfUse.title}</h2>
        <p>{legalNoticeTranslations.termsOfUse.description}</p>
        <p className="mt-2">
          <Link to="/terms-of-service" className="text-red-600 hover:text-red-800 underline">
            {legalNoticeTranslations.termsOfUse.linkText}
          </Link>
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.intellectualProperty.title}</h2>
        <p>{legalNoticeTranslations.intellectualProperty.description}</p>
        <p className="mt-2">{legalNoticeTranslations.intellectualProperty.additionalInfo}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.userObligations.title}</h2>
        <p>{legalNoticeTranslations.userObligations.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{legalNoticeTranslations.userObligations.items.legalUse}</li>
          <li>{legalNoticeTranslations.userObligations.items.noHarmfulContent}</li>
          <li>{legalNoticeTranslations.userObligations.items.respectRights}</li>
          <li>{legalNoticeTranslations.userObligations.items.noImpersonation}</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.dataProtection.title}</h2>
        <p>{legalNoticeTranslations.dataProtection.description}</p>
        <p className="mt-2">
          <Link to="/privacy-policy" className="text-red-600 hover:text-red-800 underline">
            {legalNoticeTranslations.dataProtection.privacyPolicyLink}
          </Link>
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.cookies.title}</h2>
        <p>{legalNoticeTranslations.cookies.description}</p>
        <p className="mt-2">
          <Link to="/cookie-policy" className="text-red-600 hover:text-red-800 underline">
            {legalNoticeTranslations.cookies.cookiePolicyLink}
          </Link>
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.liability.title}</h2>
        <p>{legalNoticeTranslations.liability.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.applicable.title}</h2>
        <p>{legalNoticeTranslations.applicable.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.modifications.title}</h2>
        <p>{legalNoticeTranslations.modifications.description}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">{legalNoticeTranslations.contact.title}</h2>
        <p>{legalNoticeTranslations.contact.description}</p>
        <p className="mt-2">Email: support@pokecollector.com</p>
        
        <div className="mt-8 border-t pt-6">
          <p>{legalNoticeTranslations.relatedDocuments}</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <Link to="/privacy-policy" className="text-red-600 hover:text-red-800 underline">
                {legalNoticeTranslations.privacyPolicyLink}
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" className="text-red-600 hover:text-red-800 underline">
                {legalNoticeTranslations.cookiePolicyLink}
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="text-red-600 hover:text-red-800 underline">
                {legalNoticeTranslations.termsOfServiceLink}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;

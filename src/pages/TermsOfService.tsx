import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import termsOfServiceEs from "../i18n/locales/termsOfService/es.json";
import termsOfServiceEn from "../i18n/locales/termsOfService/en.json";

const TermsOfService: React.FC = () => {
  const { i18n } = useTranslation();

  // Select translations based on current language
  const termsTranslations =
    i18n.language === "es" ? termsOfServiceEs : termsOfServiceEn;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{termsTranslations.title}</h1>

      <div className="prose prose-red max-w-none">
        <p className="text-lg mb-6">
          {termsTranslations.lastUpdated} {new Date().toLocaleDateString()}
        </p>

        <p className="mb-6">{termsTranslations.introduction}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.definitions.title}
        </h2>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>
            <strong>{termsTranslations.definitions.items.service.term}:</strong>{" "}
            {termsTranslations.definitions.items.service.definition}
          </li>
          <li>
            <strong>{termsTranslations.definitions.items.user.term}:</strong>{" "}
            {termsTranslations.definitions.items.user.definition}
          </li>
          <li>
            <strong>{termsTranslations.definitions.items.account.term}:</strong>{" "}
            {termsTranslations.definitions.items.account.definition}
          </li>
          <li>
            <strong>
              {termsTranslations.definitions.items.subscription.term}:
            </strong>{" "}
            {termsTranslations.definitions.items.subscription.definition}
          </li>
          <li>
            <strong>{termsTranslations.definitions.items.company.term}:</strong>{" "}
            {termsTranslations.definitions.items.company.definition}
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.acceptance.title}
        </h2>
        <p>{termsTranslations.acceptance.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.userAccounts.title}
        </h2>
        <p>{termsTranslations.userAccounts.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{termsTranslations.userAccounts.items.accuracy}</li>
          <li>{termsTranslations.userAccounts.items.security}</li>
          <li>{termsTranslations.userAccounts.items.unauthorized}</li>
          <li>{termsTranslations.userAccounts.items.termination}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.subscriptions.title}
        </h2>
        <p>{termsTranslations.subscriptions.description}</p>
        <p className="mt-2">{termsTranslations.subscriptions.billing}</p>
        <p className="mt-2">{termsTranslations.subscriptions.cancellation}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.intellectualProperty.title}
        </h2>
        <p>{termsTranslations.intellectualProperty.description}</p>
        <p className="mt-2">
          {termsTranslations.intellectualProperty.userContent}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.prohibitedUses.title}
        </h2>
        <p>{termsTranslations.prohibitedUses.description}</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>{termsTranslations.prohibitedUses.items.illegal}</li>
          <li>{termsTranslations.prohibitedUses.items.harmful}</li>
          <li>{termsTranslations.prohibitedUses.items.impersonation}</li>
          <li>{termsTranslations.prohibitedUses.items.infringement}</li>
          <li>{termsTranslations.prohibitedUses.items.automation}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.disclaimer.title}
        </h2>
        <p>{termsTranslations.disclaimer.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.limitation.title}
        </h2>
        <p>{termsTranslations.limitation.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.indemnification.title}
        </h2>
        <p>{termsTranslations.indemnification.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.termination.title}
        </h2>
        <p>{termsTranslations.termination.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.governing.title}
        </h2>
        <p>{termsTranslations.governing.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.changes.title}
        </h2>
        <p>{termsTranslations.changes.description}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {termsTranslations.contact.title}
        </h2>
        <p>{termsTranslations.contact.description}</p>
        <p className="mt-2">Email: support@pokecollector.com</p>

        <div className="mt-8 border-t pt-6">
          <p>{termsTranslations.relatedPolicies}</p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <Link
                to="/privacy-policy"
                className="text-red-600 hover:text-red-800 underline"
              >
                {termsTranslations.privacyPolicyLink}
              </Link>
            </li>
            <li>
              <Link
                to="/cookie-policy"
                className="text-red-600 hover:text-red-800 underline"
              >
                {termsTranslations.cookiePolicyLink}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

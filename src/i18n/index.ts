import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./locales/en.json";
import esTranslation from "./locales/es.json";

// Configure i18next with language detection and returnObjects option
i18next
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
    },
    fallbackLng: "en", // Default language if detection fails
    detection: {
      order: ["navigator", "htmlTag", "localStorage"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true, // Add this line to enable returning objects
  });

export default i18next;

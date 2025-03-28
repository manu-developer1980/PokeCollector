import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en.json";
import esTranslation from "./locales/es.json";

// Verificar que los archivos de traducción se estén importando correctamente
console.log("Translations loaded:", {
  en: Object.keys(enTranslation),
  es: Object.keys(esTranslation),
});

i18n
  .use(LanguageDetector)
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
    fallbackLng: "en",
    debug: true, // Activar modo debug para ver más información
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

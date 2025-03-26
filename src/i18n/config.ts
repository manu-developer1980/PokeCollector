import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en.json";
import esTranslation from "./locales/es.json";

// Configuración de i18next
i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
    },
    fallbackLng: "es", // Idioma por defecto si no se detecta ninguno
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // No es necesario para React
    },
  });

export default i18n;

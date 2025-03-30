import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importamos los archivos de traducción para páginas
import homeEN from "../locales/pages/Home/en.json";
import homeES from "../locales/pages/Home/es.json";
import dashboardEN from "../locales/pages/Dashboard/en.json";
import dashboardES from "../locales/pages/Dashboard/es.json";
import searchEN from "../locales/pages/Search/en.json";
import searchES from "../locales/pages/Search/es.json";
import pricingEN from "../locales/pages/Pricing/en.json";
import pricingES from "../locales/pages/Pricing/es.json";
import accountEN from "../locales/pages/Account/en.json";
import accountES from "../locales/pages/Account/es.json";

// Importamos los archivos de traducción para componentes
import headerEN from "../locales/components/Header/en.json";
import headerES from "../locales/components/Header/es.json";
import footerEN from "../locales/components/Footer/en.json";
import footerES from "../locales/components/Footer/es.json";
import cardDetailEN from "../locales/components/CardDetail/en.json";
import cardDetailES from "../locales/components/CardDetail/es.json";
import collectionListEN from "../locales/components/CollectionList/en.json";
import collectionListES from "../locales/components/CollectionList/es.json";
import wishlistEN from "../locales/components/Wishlist/en.json";
import wishlistES from "../locales/components/Wishlist/es.json";

// Importamos los archivos de traducción para elementos comunes
import commonEN from "../locales/common/en.json";
import commonES from "../locales/common/es.json";
import authEN from "../locales/auth/en.json";
import authES from "../locales/auth/es.json";
import navigationEN from "../locales/navigation/en.json";
import navigationES from "../locales/navigation/es.json";
import errorsEN from "../locales/errors/en.json";
import errorsES from "../locales/errors/es.json";

// Recursos de traducción organizados por namespace
const resources = {
  en: {
    // Páginas
    home: homeEN,
    dashboard: dashboardEN,
    search: searchEN,
    pricing: pricingEN,
    account: accountEN,

    // Componentes
    header: headerEN,
    footer: footerEN,
    cardDetail: cardDetailEN,
    collectionList: collectionListEN,
    wishlist: wishlistEN,

    // Elementos comunes
    common: commonEN,
    auth: authEN,
    navigation: navigationEN,
    errors: errorsEN,
  },
  es: {
    // Páginas
    home: homeES,
    dashboard: dashboardES,
    search: searchES,
    pricing: pricingES,
    account: accountES,

    // Componentes
    header: headerES,
    footer: footerES,
    cardDetail: cardDetailES,
    collectionList: collectionListES,
    wishlist: wishlistES,

    // Elementos comunes
    common: commonES,
    auth: authES,
    navigation: navigationES,
    errors: errorsES,
  },
};

// Imprimir los recursos para verificar
console.log("Recursos de i18next configurados:", resources);

// Configuración de i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      resources,
      fallbackLng: "es", // Idioma por defecto si no se detecta ninguno
      debug: process.env.NODE_ENV === "development", // Solo activar debug en desarrollo
      interpolation: {
        escapeValue: false, // No es necesario para React
      },
      // Definimos todos los namespaces que vamos a usar
      ns: [
        // Páginas
        "home",
        "dashboard",
        "search",
        "pricing",
        "account",
        // Componentes
        "header",
        "footer",
        "cardDetail",
        "collectionList",
        "wishlist",
        // Elementos comunes
        "common",
        "auth",
        "navigation",
        "errors",
      ],
      defaultNS: "common", // Namespace por defecto
    },
    (err, t) => {
      if (err) {
        console.error("Error al inicializar i18next:", err);
      } else {
        console.log("i18next inicializado correctamente");
        console.log("Idioma actual:", i18n.language);

        // Probar algunas traducciones
        console.log(
          "Test traducción home:hero.badge:",
          t("hero.badge", { ns: "home" })
        );
        console.log(
          "Test traducción navigation:collection:",
          t("collection", { ns: "navigation" })
        );
        console.log("Test traducción auth:login:", t("login", { ns: "auth" }));
      }
    }
  );

// Evento para detectar cambios de idioma
i18n.on("languageChanged", (lng) => {
  console.log("Idioma cambiado a:", lng);
});

export default i18n;

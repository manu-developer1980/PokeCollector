// Busca la configuración de i18next y añade la opción returnObjects
i18next.use(initReactI18next).init({
  resources,
  lng: "es", // idioma por defecto
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true, // Añadir esta línea
});

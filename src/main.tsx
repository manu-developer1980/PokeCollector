import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Importar la configuración de i18n
import "./i18n/config";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import { NavigateFunction } from "react-router-dom";

export const navigateToSearch = (navigate: NavigateFunction) => {
  navigate("/dashboard", {
    replace: true,
    state: {
      activeSection: "Search Cards",
      forceUpdate: Date.now(), // Incluimos esto para forzar la actualización si es necesario
    },
  });
};

// Podemos añadir más funciones de navegación comunes aquí
export const navigateToCollection = (navigate: NavigateFunction) => {
  navigate("/dashboard", {
    replace: true,
    state: { activeSection: "My Collection" },
  });
};

export const navigateToWishlist = (navigate: NavigateFunction) => {
  navigate("/dashboard", {
    replace: true,
    state: { activeSection: "Wishlist" },
  });
};

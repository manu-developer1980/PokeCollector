import { useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
// Importamos useAuth en lugar de useSupabaseClient
import { useAuth } from "../../../supabase/auth";

export default function GoodbyePage() {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  // Ya no necesitamos verificar el acceso aquí, lo hace ProtectedGoodbyeRoute
  useEffect(() => {
    console.log("GoodbyePage: Página de despedida cargada");

    // Limpiamos el token cuando el componente se desmonte
    return () => {
      console.log("GoodbyePage: Limpiando tokens de acceso");
      sessionStorage.removeItem("goodbyeAccessToken");
      localStorage.removeItem("goodbyeAccessGranted");
    };
  }, []);

  // Mostrar el mensaje de despedida (solo se mostrará si el usuario tiene permiso)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-16 px-4">
      {/* Logo en la parte superior */}
      <div className="mb-8 font-bold text-xl flex items-center justify-center text-red-600">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
          alt="Pokeball"
          className="h-8 w-8 mr-2"
        />
        PokéCollector
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-auto">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-2xl font-bold">{t("account.goodbye")}</h1>
        </div>

        <p className="mb-4">{t("account.accountDeletedMessage")}</p>

        <p className="text-sm text-gray-500 mb-6">
          {t("account.welcomeBackMessage")}
        </p>

        {/* Implementamos dos opciones para volver al inicio */}
        <div className="space-y-4">
          {/* Opción 1: Botón con onClick */}
          <Button
            onClick={async () => {
              try {
                console.log("Botón 'Volver al inicio' clickeado");

                // Limpiar los tokens de acceso
                console.log("Limpiando tokens de acceso...");
                sessionStorage.removeItem("goodbyeAccessToken");
                localStorage.removeItem("goodbyeAccessGranted");

                // Cerrar la sesión antes de navegar a la página principal
                console.log("Cerrando sesión...");
                try {
                  // Usar la función signOut del hook useAuth
                  await signOut();
                  console.log("Sesión cerrada correctamente");
                } catch (signOutError) {
                  console.error(
                    "Error al intentar cerrar sesión:",
                    signOutError
                  );
                  // No lanzamos el error, simplemente continuamos
                }

                console.log("Navegando a la página principal...");
                // Usar window.location.href en lugar de navigate para asegurar que funcione
                window.location.href = "/";
              } catch (error) {
                console.error("Error en el botón 'Volver al inicio':", error);
                // Si hay un error, intentamos navegar de todos modos usando window.location
                console.log("Intentando navegar con window.location.href...");
                window.location.href = "/";
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {t("account.backToHome")}
          </Button>

          {/* Opción 2: Enlace directo */}
          <div className="text-sm">
            <p>
              Si el botón no funciona,{" "}
              <a
                href="/"
                className="text-red-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  sessionStorage.removeItem("goodbyeAccessToken");
                  localStorage.removeItem("goodbyeAccessGranted");

                  // Usar la función signOut del hook useAuth
                  signOut()
                    .then(() => {
                      console.log("Sesión cerrada correctamente");
                      window.location.href = "/";
                    })
                    .catch((error) => {
                      console.error("Error al cerrar sesión:", error);
                      // Navegar de todos modos
                      window.location.href = "/";
                    });
                }}
              >
                haz clic aquí
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} PokéCollector.{" "}
          {t("footer.copyright")}
        </p>
      </div>
    </div>
  );
}

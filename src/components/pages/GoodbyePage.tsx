import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function GoodbyePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Verificar si el usuario tiene permiso para acceder a esta página
  useEffect(() => {
    const accessToken = sessionStorage.getItem("goodbyeAccessToken");

    if (!accessToken) {
      console.log(
        "Acceso no autorizado a la página de despedida, redirigiendo..."
      );
      navigate("/", { replace: true });
    } else {
      console.log("Acceso autorizado a la página de despedida");
      // Limpiar el token después de usarlo para evitar accesos repetidos
      sessionStorage.removeItem("goodbyeAccessToken");
    }
  }, [navigate]);

  // Mostrar el mensaje de despedida (solo se mostrará si el usuario tiene permiso)
  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-2xl font-bold">{t("account.goodbye")}</h1>
        </div>

        <p className="mb-4">{t("account.accountDeletedMessage")}</p>

        <p className="text-sm text-gray-500 mb-6">
          {t("account.welcomeBackMessage")}
        </p>

        <Button
          onClick={() => navigate("/", { replace: true })}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {t("account.backToHome")}
        </Button>
      </div>
    </div>
  );
}

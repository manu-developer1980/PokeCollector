import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedGoodbyeRoute({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const accessToken = sessionStorage.getItem("goodbyeAccessToken");
    
    if (accessToken) {
      console.log("ProtectedGoodbyeRoute: Acceso autorizado");
      setHasAccess(true);
    } else {
      console.log("ProtectedGoodbyeRoute: Acceso no autorizado");
      setHasAccess(false);
    }
  }, []);
  
  // Mientras verificamos, no mostramos nada
  if (hasAccess === null) {
    return null;
  }
  
  // Si no tiene acceso, redirigir a la página principal
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }
  
  // Si tiene acceso, mostrar el contenido
  return <>{children}</>;
}

export const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://poke-collector.netlify.app",
];

export const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("Origin") || "";
  
  console.log("🔍 CORS Debug - Origin recibido:", origin);
  console.log("🔍 CORS Debug - Orígenes permitidos:", ALLOWED_ORIGINS);

  // Headers base que siempre incluimos
  const baseHeaders = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, prefer, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // Si estamos en desarrollo (localhost), permitir cualquier puerto localhost
  if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
    console.log("✅ CORS - Permitiendo origen localhost:", origin);
    return {
      ...baseHeaders,
      "Access-Control-Allow-Origin": origin,
    };
  }

  // Para producción, verificar contra la lista de orígenes permitidos
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  
  if (isAllowedOrigin) {
    console.log("✅ CORS - Origen permitido encontrado:", origin);
    return {
      ...baseHeaders,
      "Access-Control-Allow-Origin": origin,
    };
  }

  // Fallback: usar el origen de producción
  console.log("⚠️ CORS - Usando fallback para origen:", origin);
  return {
    ...baseHeaders,
    "Access-Control-Allow-Origin": "https://poke-collector.netlify.app",
  };
};

// Export a simple CORS headers object for functions that don't need dynamic origin handling
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const allowedOrigins = [
  "https://poke-collector.netlify.app",
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Vite dev server alternativo
];

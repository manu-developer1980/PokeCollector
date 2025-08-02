export const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://poke-collector.netlify.app",
];

export const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get("Origin") || "";

  // Si estamos en desarrollo, permitir cualquier origen localhost
  if (origin.includes("localhost")) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, prefer, Authorization",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    };
  }

  // Para producción, verificar contra la lista de orígenes permitidos
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin
      ? origin
      : "https://poke-collector.netlify.app", // Fallback to production URL instead of localhost
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, prefer, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
};

// Export a simple CORS headers object for functions that don't need dynamic origin handling
export const corsHeaders = {
  "Access-Control-Allow-Origin": "https://poke-collector.netlify.app",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, prefer, Authorization",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

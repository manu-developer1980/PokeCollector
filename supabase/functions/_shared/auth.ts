// Helpers de autenticación compartidos por las edge functions.
// Derivan SIEMPRE el usuario del token JWT de la petición; nunca hay que
// confiar en un user_id enviado en el body.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  isAdmin: boolean;
}

/**
 * Valida el JWT de la cabecera Authorization y devuelve el usuario.
 * Devuelve null si el token falta o no es válido (el anon key no cuenta
 * como usuario: getUser lo rechaza al no ser un token de sesión).
 */
export async function getAuthenticatedUser(
  req: Request
): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createServiceClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    isAdmin: userData?.is_admin === true,
  };
}

export function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

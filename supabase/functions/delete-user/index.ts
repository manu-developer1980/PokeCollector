import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Manejar preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar que sea POST
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Obtener y validar el body
    const { user_id } = await req.json();
    if (!user_id) {
      throw new Error("user_id is required");
    }

    // Crear cliente de Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Eliminar datos relacionados
    const { error: rpcError } = await supabase.rpc("delete_user_data", {
      user_id_param: user_id,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw rpcError;
    }

    // Eliminar el usuario
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

    if (authError) {
      console.error("Auth Error:", authError);
      throw authError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during the delete process",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { user_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Primero eliminar datos relacionados usando la función RPC
    const { error: rpcError } = await supabase.rpc("delete_user_data", {
      user_id_param: user_id,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw rpcError;
    }

    // Verificar que el usuario se eliminó de public.users
    const { data: userData, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("User check error:", userCheckError);
      throw userCheckError;
    }

    if (userData) {
      console.error("User still exists in public.users");
      throw new Error("Failed to delete user from public.users");
    }

    // Finalmente eliminar el usuario de auth.users
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
    console.error("Delete user error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al eliminar usuario" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

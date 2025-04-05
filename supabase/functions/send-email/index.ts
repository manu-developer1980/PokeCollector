import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// Configuración del webhook
const hookSecret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string)?.replace(
  "v1,whsec_",
  ""
);

// Función principal
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    // Verificar y extraer datos del webhook
    const wh = new Webhook(hookSecret);
    const { user, email_data } = wh.verify(payload, headers) as {
      user: {
        id: string;
        email: string;
        user_metadata: Record<string, any>;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    // Let Supabase handle the email sending
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-email hook:", error);

    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

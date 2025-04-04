import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

// Configuración del webhook
const hookSecret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string)?.replace("v1,whsec_", "");

// Función para leer las plantillas HTML
async function readEmailTemplate(language: string, type: string): Promise<string> {
  try {
    // Ruta relativa a la ubicación del script
    const filePath = `../../../src/emails/${language}/${type}.html`;
    const fileContent = await Deno.readTextFile(filePath);
    return fileContent;
  } catch (error) {
    console.error(`Error reading template: ${error.message}`);
    // Fallback a inglés si el idioma solicitado no está disponible
    if (language !== 'en') {
      return readEmailTemplate('en', type);
    }
    throw error;
  }
}

// Función para enviar email
async function sendEmail(to: string, subject: string, htmlContent: string) {
  // Aquí puedes integrar con tu proveedor de email preferido
  // Por ejemplo, usando Resend, SendGrid, etc.
  
  // Ejemplo con Resend:
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "noreply@pokecollector.com",
      to: [to],
      subject: subject,
      html: htmlContent,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
  }
  
  return await response.json();
}

// Función para reemplazar variables en la plantilla
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{\\s*\\.${key}\\s*}}`, 'g'), value);
  }
  return result;
}

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
    
    // Determinar el idioma del usuario
    const userLang = user.user_metadata?.preferred_lang || 'es'; // Español por defecto
    
    // Mapear el tipo de acción de email a la estructura de carpetas
    let emailType = '';
    let emailSubject = '';
    
    switch (email_data.email_action_type) {
      case 'signup':
        emailType = 'registration';
        emailSubject = userLang === 'es' ? 'Confirma tu email - PokéCollector' : 'Confirm your email - PokéCollector';
        break;
      case 'recovery':
        emailType = 'password';
        emailSubject = userLang === 'es' ? 'Recupera tu contraseña - PokéCollector' : 'Reset your password - PokéCollector';
        break;
      case 'magiclink':
        emailType = 'magic-link';
        emailSubject = userLang === 'es' ? 'Tu enlace de acceso - PokéCollector' : 'Your magic link - PokéCollector';
        break;
      case 'invite':
        emailType = 'invite';
        emailSubject = userLang === 'es' ? 'Invitación a PokéCollector' : 'Invitation to PokéCollector';
        break;
      default:
        emailType = 'general';
        emailSubject = userLang === 'es' ? 'Notificación de PokéCollector' : 'PokéCollector Notification';
    }
    
    // Leer la plantilla HTML
    const template = await readEmailTemplate(userLang, emailType);
    
    // Reemplazar variables en la plantilla
    const htmlContent = replaceTemplateVariables(template, {
      'Email': user.email,
      'Token': email_data.token,
      'TokenHash': email_data.token_hash,
      'ConfirmationURL': `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`,
      'SiteURL': email_data.site_url,
      'RedirectTo': email_data.redirect_to,
    });
    
    // Enviar el email
    await sendEmail(user.email, emailSubject, htmlContent);
    
    // Responder con éxito
    return new Response(JSON.stringify({}), {
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
      },
    );
  }
});

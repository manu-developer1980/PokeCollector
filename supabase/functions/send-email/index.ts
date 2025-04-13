import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Brevo API key
const BREVO_API_KEY =
  "xsmtpsib-e764ca591da82dc6249c90e297fb47297db179e6e8e0714cf527009815ade21e-2EqOspLPW0wIRdQJ";

// Function to send email using Brevo API
async function sendEmailWithBrevo(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "PokéCollector",
        email: "8a53db001@smtp-brevo.com", // This is the default Brevo sender email
      },
      to: [
        {
          email: to,
          name: to,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

// This is the main function that will handle the email sending
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    // Log the request
    console.log("Received email request");

    // Verify the request is coming from Supabase Auth
    const hookSecret =
      Deno.env.get("SEND_EMAIL_HOOK_SECRET") ||
      "v1,whsec_kqH09qIqKoqjm3oIvEuu4DVkienv4afd0YMeQngZSOFNXbk9yZZ8ZxdRVcpVd9MV7/9o/Ps0yRfCGFrd";
    const authHeader = req.headers.get("Authorization");
    const webhookSecret = req.headers.get("x-webhook-secret");

    console.log("Auth headers received:", {
      authorization: authHeader ? "[PRESENT]" : "[MISSING]",
      webhookSecret: webhookSecret ? "[PRESENT]" : "[MISSING]",
    });

    // Check both possible auth methods
    const isAuthorized =
      (authHeader && authHeader === `Bearer ${hookSecret}`) ||
      (webhookSecret && webhookSecret === hookSecret);

    // Temporarily disable auth check for debugging
    const skipAuthCheck = true; // Set to false in production

    if (!skipAuthCheck && !isAuthorized) {
      console.error("Unauthorized request: webhook secret mismatch");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
      });
    }

    // Parse the request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Extract user data and email type
    const { email, template, data } = body;

    // Determine language preference from user metadata or data passed in request
    let userLanguage = "en"; // Default to English

    // Log all available data for debugging
    console.log("User metadata:", data?.user_metadata);
    console.log("Data object:", data);

    // Check all possible locations for language preference
    if (data?.user_metadata?.preferred_lang) {
      userLanguage = data.user_metadata.preferred_lang;
      console.log(
        "Using language from user_metadata.preferred_lang:",
        userLanguage
      );
    } else if (data?.preferred_lang) {
      userLanguage = data.preferred_lang;
      console.log("Using language from data.preferred_lang:", userLanguage);
    } else if (data?.user?.user_metadata?.preferred_lang) {
      userLanguage = data.user.user_metadata.preferred_lang;
      console.log(
        "Using language from data.user.user_metadata.preferred_lang:",
        userLanguage
      );
    } else if (body?.user?.user_metadata?.preferred_lang) {
      userLanguage = body.user.user_metadata.preferred_lang;
      console.log(
        "Using language from body.user.user_metadata.preferred_lang:",
        userLanguage
      );
    }

    // As a fallback, check if the email domain suggests a language preference
    if (
      userLanguage === "en" &&
      email &&
      (email.endsWith(".es") || email.includes("spain"))
    ) {
      userLanguage = "es";
      console.log("Detected Spanish from email domain");
    }

    // Force Spanish for testing if needed
    // userLanguage = "es";
    // console.log("Forced language to Spanish for testing");

    console.log("Final language selection:", userLanguage);

    // Log the email sending attempt
    console.log(
      `Processing ${template} email to ${email} in language: ${userLanguage}`
    );

    // Generate email content based on template and language
    let subject = "";
    let htmlContent = "";
    let textContent = "";

    // Set subject based on template and language
    if (template === "confirmation") {
      subject =
        userLanguage === "es"
          ? "Confirma tu email - PokéCollector"
          : "Confirm your email - PokéCollector";
    } else if (template === "recovery") {
      subject =
        userLanguage === "es"
          ? "Restablece tu contraseña - PokéCollector"
          : "Reset your password - PokéCollector";
    } else if (template === "magic_link") {
      subject =
        userLanguage === "es"
          ? "Tu enlace mágico - PokéCollector"
          : "Your magic link - PokéCollector";
    } else {
      subject = "PokéCollector - " + template;
    }

    // Generate HTML content
    if (userLanguage === "es") {
      // Spanish content
      if (template === "confirmation") {
        htmlContent = `
          <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
            <h1>¡Bienvenido a PokéCollector!</h1>
            <p>Hola ${email},</p>
            <p>¡Gracias por unirte a nuestra comunidad de coleccionistas Pokémon! Solo necesitamos verificar tu dirección de email para comenzar tu aventura.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.confirmation_url}" style="background-color: #ff5350; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirmar mi email</a>
            </div>
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
            <p style="color: #666;">El enlace expirará en 24 horas.</p>
          </div>
        `;
        textContent = `¡Bienvenido a PokéCollector!\n\nHola ${email},\n\n¡Gracias por unirte a nuestra comunidad de coleccionistas Pokémon! Solo necesitamos verificar tu dirección de email para comenzar tu aventura.\n\nConfirma tu email siguiendo este enlace: ${data.confirmation_url}\n\nSi no creaste esta cuenta, puedes ignorar este email.\n\nEl enlace expirará en 24 horas.`;
      } else if (template === "recovery") {
        htmlContent = `
          <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
            <h1>Recuperación de Contraseña</h1>
            <p>Hola ${email},</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no realizaste esta solicitud, puedes ignorar este email.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.confirmation_url}" style="background-color: #ff5350; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
            </div>
            <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${data.confirmation_url}</p>
          </div>
        `;
        textContent = `Recuperación de Contraseña\n\nHola ${email},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no realizaste esta solicitud, puedes ignorar este email.\n\nRestablece tu contraseña siguiendo este enlace: ${data.confirmation_url}\n\nEste enlace expirará en 24 horas por razones de seguridad.`;
      }
    } else {
      // English content
      if (template === "confirmation") {
        htmlContent = `
          <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
            <h1>Welcome to PokéCollector!</h1>
            <p>Hello ${email},</p>
            <p>Thank you for joining our Pokémon collector community! We just need to verify your email address to start your adventure.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.confirmation_url}" style="background-color: #ff5350; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirm my email</a>
            </div>
            <p>If you didn't create this account, you can ignore this email.</p>
            <p style="color: #666;">This link will expire in 24 hours.</p>
          </div>
        `;
        textContent = `Welcome to PokéCollector!\n\nHello ${email},\n\nThank you for joining our Pokémon collector community! We just need to verify your email address to start your adventure.\n\nConfirm your email by following this link: ${data.confirmation_url}\n\nIf you didn't create this account, you can ignore this email.\n\nThis link will expire in 24 hours.`;
      } else if (template === "recovery") {
        htmlContent = `
          <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
            <h1>Password Recovery</h1>
            <p>Hello ${email},</p>
            <p>We received a request to reset your account password. If you didn't make this request, you can ignore this email.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.confirmation_url}" style="background-color: #ff5350; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you're having trouble with the button, copy and paste this link in your browser:</p>
            <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${data.confirmation_url}</p>
          </div>
        `;
        textContent = `Password Recovery\n\nHello ${email},\n\nWe received a request to reset your account password. If you didn't make this request, you can ignore this email.\n\nReset your password by following this link: ${data.confirmation_url}\n\nThis link will expire in 24 hours for security reasons.`;
      }
    }

    // Send email using Brevo
    console.log(`Sending ${template} email to ${email} using Brevo API`);
    let emailData;
    try {
      emailData = await sendEmailWithBrevo(
        email,
        subject,
        htmlContent,
        textContent
      );
      console.log("Email sent successfully:", emailData);
    } catch (error) {
      console.error("Error sending email with Brevo:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${email} in ${userLanguage}`,
        id: emailData.id,
      }),
      {
        status: 200,
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json",
      },
    });
  }
});

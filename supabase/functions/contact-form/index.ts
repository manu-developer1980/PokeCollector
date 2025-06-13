import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const CONTACT_EMAIL =
  Deno.env.get("CONTACT_EMAIL") || "contact@pokecollector.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@pokecollector.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "PokéCollector";

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return false;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}

async function sendContactEmailWithBrevo(
  data: ContactFormData
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY not configured");
    return false;
  }

  try {
    const emailData = {
      sender: {
        name: FROM_NAME,
        email: FROM_EMAIL,
      },
      to: [
        {
          email: CONTACT_EMAIL,
          name: "PokéCollector Support",
        },
      ],
      replyTo: {
        email: data.email,
        name: data.name,
      },
      subject: `[Contacto] ${data.subject}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PokéCollector</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Nuevo mensaje de contacto</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea;">
              <h2 style="color: #495057; margin: 0 0 20px 0; font-size: 20px;">📋 Información del contacto</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">👤 Nombre:</td>
                  <td style="padding: 8px 0; color: #6c757d;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">📧 Email:</td>
                  <td style="padding: 8px 0; color: #6c757d;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">📝 Asunto:</td>
                  <td style="padding: 8px 0; color: #6c757d;">${
                    data.subject
                  }</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #ffffff; padding: 25px; border: 2px solid #e9ecef; border-radius: 8px; border-left: 4px solid #28a745;">
              <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">💬 Mensaje</h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; line-height: 1.6; white-space: pre-wrap; color: #495057; font-size: 15px;">${
                data.message
              }</div>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p style="margin: 0 0 5px 0;">🕒 Enviado el ${new Date().toLocaleString(
                "es-ES",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}</p>
              <p style="margin: 0;">Este mensaje fue enviado desde el formulario de contacto de PokéCollector</p>
            </div>
          </div>
        </div>
      `,
      textContent: `
Nuevo mensaje de contacto - PokéCollector

Información del contacto:
- Nombre: ${data.name}
- Email: ${data.email}
- Asunto: ${data.subject}

Mensaje:
${data.message}

---
Enviado el ${new Date().toLocaleString("es-ES")}
Este mensaje fue enviado desde el formulario de contacto de PokéCollector.
      `.trim(),
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Error sending email with Brevo:",
        response.status,
        errorText
      );
      return false;
    }

    const result = await response.json();
    console.log("Email sent successfully with Brevo:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending contact email with Brevo:", error);
    return false;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: ContactFormData = await req.json();

    if (
      !data.name ||
      !data.email ||
      !data.subject ||
      !data.message ||
      !data.recaptchaToken
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaToken);
    if (!isRecaptchaValid) {
      return new Response(JSON.stringify({ error: "Invalid reCAPTCHA" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailSent = await sendContactEmailWithBrevo(data);
    if (!emailSent) {
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contact form submitted successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

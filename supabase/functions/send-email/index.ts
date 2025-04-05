import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";

// This is the main function that will handle the email sending
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    // Verify the request is coming from Supabase Auth
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${hookSecret}`) {
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

    // Extract user data and email type
    const { email, template, data } = body;

    // Get user metadata to determine language preference
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine language preference from user metadata or data passed in request
    let userLanguage = "en"; // Default to English

    // First check if language is passed directly in the request data
    if (data && data.preferred_lang) {
      userLanguage = data.preferred_lang;
      console.log("Using language from request data:", userLanguage);
    }
    // Then check if we can get it from user metadata
    else {
      try {
        // Get user by email using the admin API
        const { data: userData, error: userError } =
          await supabase.auth.admin.getUserByEmail(email);

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userData && userData.user) {
          // Check if preferred_lang exists in user metadata
          userLanguage = userData.user.user_metadata?.preferred_lang || "en";
          console.log("User metadata:", userData.user.user_metadata);
          console.log("Using language from user metadata:", userLanguage);
        }
      } catch (error) {
        console.error("Error accessing user metadata:", error);
      }
    }

    // As a fallback, check if the email domain suggests a language preference
    if (
      userLanguage === "en" &&
      (email.endsWith(".es") || email.includes("spain"))
    ) {
      userLanguage = "es";
      console.log("Detected Spanish from email domain");
    }

    // Log the email sending attempt
    console.log(
      `Sending ${template} email to ${email} in language: ${userLanguage}`
    );
    console.log("Email data:", data);

    // Initialize Resend with API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const resend = new Resend(resendApiKey);

    // Prepare email content
    // Note: In a real implementation, you would load the appropriate template
    // based on the template type and user language
    const emailContent = {
      from: "PokéCollector <noreply@pokecollector.com>",
      to: email,
      subject:
        template === "confirmation"
          ? userLanguage === "es"
            ? "Confirma tu email - PokéCollector"
            : "Confirm your email - PokéCollector"
          : template === "recovery"
          ? userLanguage === "es"
            ? "Restablece tu contraseña - PokéCollector"
            : "Reset your password - PokéCollector"
          : template === "magic_link"
          ? userLanguage === "es"
            ? "Tu Enlace Mágico - PokéCollector"
            : "Your Magic Link - PokéCollector"
          : "PokéCollector",
      html: data.html || "<p>Email content not provided</p>",
    };

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send(
      emailContent
    );

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${email} in ${userLanguage}`,
        id: emailData?.id,
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

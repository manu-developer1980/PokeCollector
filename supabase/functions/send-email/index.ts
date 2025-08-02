import { getCorsHeaders } from "../_shared/cors.ts";

// Simplified email function for testing
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { email, template, data } = await req.json();
    
    console.log('📧 Email request received:', {
      email,
      template,
      data
    });

    // Check if we're in local development
    const isLocal = Deno.env.get("ENVIRONMENT") === "local" || 
                    Deno.env.get("SUPABASE_URL")?.includes("127.0.0.1");
    
    if (isLocal) {
      console.log('🏠 Local environment detected - simulating email send');
      console.log(`📨 Would send email to: ${email}`);
      console.log(`📋 Template: ${template}`);
      console.log(`📄 Data:`, JSON.stringify(data, null, 2));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email simulated successfully in local environment',
          email,
          template
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // For production, we would use Brevo API here
    console.log('🌐 Production environment - would use Brevo API');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email function executed successfully',
        environment: 'production'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('❌ Error in email function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

import { createClient } from "@supabase/supabase-js";

export async function handler(req: Request) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("user_id is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .single();

    // Only create profile if it doesn't exist
    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user_id)
      .single();

    // Only create subscription if it doesn't exist
    if (!existingSubscription) {
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user_id,
          plan_type: "aprendiz",
          created_at: new Date().toISOString(),
        });

      if (subscriptionError) throw subscriptionError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      }
    );
  }
}

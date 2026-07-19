// Comprobación diaria de price_alerts: para cada carta con una alerta
// activa, mira el precio actual de mercado (Cardmarket, vía Pokemon TCG API)
// y manda un email si ha bajado del umbral. La llama un workflow de GitHub
// Actions una vez al día (ver .github/workflows/price-alerts-cron.yml);
// sin JWT, la seguridad es el header X-Cron-Secret (mismo patrón que
// stripe-webhook, que se protege con la firma de Stripe en vez de JWT).

import { createServiceClient, jsonResponse } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

// No renotificar la misma alerta hasta que pase esta ventana.
const RENOTIFY_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const DELAY_BETWEEN_CARDS_MS = 150;

interface PriceAlertRow {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  card_image_url: string | null;
  target_price: number;
  last_notified_at: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCardMarketPrice(
  cardId: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards/${cardId}`,
      {
        headers: {
          "X-Api-Key": Deno.env.get("POKEMON_TCG_API_KEY") ?? "",
        },
      }
    );

    if (!response.ok) return null;

    const { data } = await response.json();
    const price = data?.cardmarket?.prices?.averageSellPrice;
    return typeof price === "number" ? price : null;
  } catch (error) {
    console.error(`Error fetching price for ${cardId}:`, error);
    return null;
  }
}

function buildEmail(
  lang: string,
  alert: PriceAlertRow,
  currentPrice: number
) {
  const isEs = lang !== "en";
  const subject = isEs
    ? `¡Bajó de precio! ${alert.card_name}`
    : `Price drop! ${alert.card_name}`;

  const body = isEs
    ? `<p>La carta <strong>${alert.card_name}</strong> ha bajado a <strong>${currentPrice.toFixed(
        2
      )} €</strong> (tu objetivo era ${alert.target_price.toFixed(2)} €).</p>`
    : `<p>The card <strong>${alert.card_name}</strong> dropped to <strong>${currentPrice.toFixed(
        2
      )} €</strong> (your target was ${alert.target_price.toFixed(2)} €).</p>`;

  const image = alert.card_image_url
    ? `<img src="${alert.card_image_url}" alt="" style="max-width:200px;display:block;margin:16px 0;" />`
    : "";

  return {
    subject,
    htmlContent: `<div style="font-family:sans-serif;">${body}${image}</div>`,
  };
}

async function sendAlertEmail(
  to: string,
  lang: string,
  alert: PriceAlertRow,
  currentPrice: number
) {
  const { subject, htmlContent } = buildEmail(lang, alert, currentPrice);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": Deno.env.get("BREVO_API_KEY") ?? "",
    },
    body: JSON.stringify({
      sender: { name: "PokéCollector", email: "manu.developer1980@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Error sending alert email to ${to}:`, text);
    return false;
  }

  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cronSecret = req.headers.get("X-Cron-Secret");
  if (!cronSecret || cronSecret !== Deno.env.get("CRON_SECRET")) {
    return jsonResponse({ error: "No autorizado" }, 401, corsHeaders);
  }

  try {
    const supabase = createServiceClient();

    const { data: alerts, error } = await supabase
      .from("price_alerts")
      .select(
        "id, user_id, card_id, card_name, card_image_url, target_price, last_notified_at"
      )
      .eq("is_active", true);

    if (error) throw error;

    const alertRows = (alerts ?? []) as PriceAlertRow[];
    const uniqueCardIds = Array.from(
      new Set(alertRows.map((alert) => alert.card_id))
    );

    const priceByCardId = new Map<string, number | null>();
    for (const cardId of uniqueCardIds) {
      priceByCardId.set(cardId, await fetchCardMarketPrice(cardId));
      await sleep(DELAY_BETWEEN_CARDS_MS);
    }

    let checked = 0;
    let notified = 0;
    const now = new Date();

    for (const alert of alertRows) {
      const currentPrice = priceByCardId.get(alert.card_id);
      checked++;

      if (currentPrice == null) {
        await supabase
          .from("price_alerts")
          .update({ last_checked_at: now.toISOString() })
          .eq("id", alert.id);
        continue;
      }

      const alreadyNotifiedRecently =
        alert.last_notified_at != null &&
        now.getTime() - new Date(alert.last_notified_at).getTime() <
          RENOTIFY_AFTER_MS;

      const shouldNotify =
        currentPrice <= alert.target_price && !alreadyNotifiedRecently;

      const updates: Record<string, string> = {
        last_checked_at: now.toISOString(),
      };

      if (shouldNotify) {
        const { data: userData } = await supabase
          .from("users")
          .select("email, preferred_lang")
          .eq("id", alert.user_id)
          .single();

        if (userData?.email) {
          const sent = await sendAlertEmail(
            userData.email,
            userData.preferred_lang ?? "es",
            alert,
            currentPrice
          );
          if (sent) {
            updates.last_notified_at = now.toISOString();
            notified++;
          }
        }
      }

      await supabase.from("price_alerts").update(updates).eq("id", alert.id);
    }

    return jsonResponse({ checked, notified }, 200, corsHeaders);
  } catch (error) {
    console.error("Error in check-price-alerts:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      500,
      corsHeaders
    );
  }
});

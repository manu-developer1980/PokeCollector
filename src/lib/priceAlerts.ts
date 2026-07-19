import { supabase } from "../../supabase/supabase";
import type { PokemonCard } from "@/types/pokemon";
import type { PriceAlert } from "@/types/pokemon";

export async function createPriceAlert(
  card: PokemonCard,
  targetPrice: number,
  userId: string
): Promise<PriceAlert> {
  const { data, error } = await supabase
    .from("price_alerts")
    .insert({
      user_id: userId,
      card_id: card.id,
      card_name: card.name,
      card_image_url: card.images?.small ?? null,
      target_price: targetPrice,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PriceAlert;
}

export async function getUserPriceAlerts(): Promise<PriceAlert[]> {
  const { data, error } = await supabase
    .from("price_alerts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PriceAlert[];
}

export async function deletePriceAlert(id: string): Promise<void> {
  const { error } = await supabase.from("price_alerts").delete().eq("id", id);
  if (error) throw error;
}

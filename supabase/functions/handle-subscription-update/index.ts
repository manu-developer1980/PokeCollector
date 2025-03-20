export async function handlePlanDowngrade(
  userId: string,
  newPlan: SubscriptionPlan
) {
  const { maxCards, maxCollections, maxWishlist } = PLAN_FEATURES[newPlan];

  // Mantener solo las cartas más recientes según el límite del nuevo plan
  await supabase.rpc('trim_collection_cards', {
    p_user_id: userId,
    p_limit: maxCards
  });

  // Mantener solo las colecciones más recientes según el límite del nuevo plan
  await supabase.rpc('trim_collections', {
    p_user_id: userId,
    p_limit: maxCollections
  });

  // Mantener solo los items de wishlist más recientes según el límite del nuevo plan
  await supabase.rpc('trim_wishlist', {
    p_user_id: userId,
    p_limit: maxWishlist
  });
}
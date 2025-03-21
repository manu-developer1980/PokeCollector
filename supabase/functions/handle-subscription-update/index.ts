export async function handlePlanDowngrade(
  userId: string,
  newPlan: SubscriptionPlan
) {
  console.log(`Processing downgrade for user ${userId} to plan ${newPlan}`);

  try {
    const { maxCards, maxCollections, maxWishlist } = PLAN_FEATURES[newPlan];

    // Trim cards
    const { error: cardsError } = await supabase.rpc("trim_collection_cards", {
      p_user_id: userId,
      p_limit: maxCards,
    });
    if (cardsError) {
      console.error("Error trimming cards:", cardsError);
      throw cardsError;
    }

    // Trim collections
    const { error: collectionsError } = await supabase.rpc("trim_collections", {
      p_user_id: userId,
      p_limit: maxCollections,
    });
    if (collectionsError) {
      console.error("Error trimming collections:", collectionsError);
      throw collectionsError;
    }

    // Trim wishlist
    const { error: wishlistError } = await supabase.rpc("trim_wishlist", {
      p_user_id: userId,
      p_limit: maxWishlist,
    });
    if (wishlistError) {
      console.error("Error trimming wishlist:", wishlistError);
      throw wishlistError;
    }

    console.log(`Downgrade processed successfully for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in handlePlanDowngrade:", error);
    throw error;
  }
}

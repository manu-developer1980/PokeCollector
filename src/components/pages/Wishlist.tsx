import React, { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { getCardById } from "@/lib/api";
import { PokemonCard } from "@/types/pokemon";
import { useToast } from "@/components/ui/use-toast";
import CardGrid from "../pokemon/CardGrid";
import CardDetail from "../pokemon/CardDetail";
import LoadingSpinner from "../ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

interface WishlistProps {
  onSectionChange: (section: string) => void;
}

export default function Wishlist({ onSectionChange }: WishlistProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistCards, setWishlistCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const { data: wishlistData, error } = await supabase
        .from("wishlist_cards")
        .select(
          `
          id,
          card_id,
          user_id,
          date_added
        `
        )
        .eq("user_id", user?.id);

      if (error) throw error;

      if (!wishlistData || wishlistData.length === 0) {
        setWishlistCards([]);
        setIsLoading(false);
        return;
      }

      const cardsWithDetails = await Promise.all(
        wishlistData.map(async (item) => {
          try {
            const cardDetails = await getCardById(item.card_id);
            if (!cardDetails) return null;
            return {
              ...cardDetails,
              wishlist_id: item.id,
              date_added: item.date_added,
            };
          } catch (error) {
            console.error(
              `Error fetching details for card ${item.card_id}:`,
              error
            );
            return null;
          }
        })
      );

      const validCards = cardsWithDetails.filter(
        (
          card
        ): card is PokemonCard & {
          wishlist_id: string;
          date_added: string;
        } => card !== null
      );

      setWishlistCards(validCards);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: t("common.error"),
        description: t("wishlist.errors.loadFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (card: PokemonCard) => {
    try {
      if (!card.wishlist_id) {
        throw new Error(t("wishlist.errors.idNotFound"));
      }

      const { error } = await supabase
        .from("wishlist_cards")
        .delete()
        .eq("id", card.wishlist_id);

      if (error) throw error;

      setWishlistCards((prev) =>
        prev.filter((c) => c.wishlist_id !== card.wishlist_id)
      );

      toast({
        title: t("wishlist.cardRemoved"),
        description: t("wishlist.removeSuccess"),
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: t("common.error"),
        description: t("wishlist.errors.removeFailed"),
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
    setIsCardDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{t("wishlist.title")}</h2>
      </div>

      {isLoading ? (
        <LoadingSpinner message={t("wishlist.loading")} />
      ) : wishlistCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {t("wishlist.empty")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("wishlist.emptyDescription")}
          </p>
          <div className="mt-6">
            <button
              onClick={() => onSectionChange("Search Cards")} // ID de sección usado en toda la aplicación
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t("wishlist.searchCards")}
            </button>
          </div>
        </div>
      ) : (
        <CardGrid
          cards={wishlistCards}
          onCardClick={handleCardClick}
          onRemove={(cardId) => {
            // Find the card by ID and pass it to handleRemoveFromWishlist
            const card = wishlistCards.find(c => c.id === cardId);
            if (card) {
              handleRemoveFromWishlist(card);
            }
          }}
          actions="wishlist"
        />
      )}

      <CardDetail
        card={selectedCard}
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        mode="wishlist"
      />
    </div>
  );
}

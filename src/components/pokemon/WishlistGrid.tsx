import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PokemonCard } from "@/types/pokemon";
import CardGrid from "./CardGrid";
import CardDetailDialog from "./CardDetailDialog";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onRemove: (card: PokemonCard) => void;
  onQuickAdd: (card: PokemonCard) => void;
  isLoading?: boolean;
}

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center py-12">
    <div className="flex flex-col items-center">
      <div className="pokeball mb-4" />
      <p className="text-lg font-bold text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  </div>
);

const WishlistGrid = ({
  cards,
  onCardClick,
  onRemove,
  onQuickAdd,
  isLoading = false,
}: WishlistGridProps) => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="mt-8 space-y-6 w-full">
        <CardGrid
          cards={cards}
          onCardClick={handleCardClick}
          onQuickAdd={onQuickAdd}
          onRemove={onRemove}
          actions="wishlist"
        />
      </div>

      {selectedCard && (
        <CardDetailDialog
          card={selectedCard}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedCard(null);
          }}
          onAddToCollection={onQuickAdd}
          onRemoveFromWishlist={onRemove}
          mode="wishlist"
        />
      )}
    </div>
  );
};

export default WishlistGrid;

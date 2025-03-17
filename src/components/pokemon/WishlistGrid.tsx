import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import CardItem from "./CardItem";
import { PokemonCard } from "@/types/pokemon";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
}

const WishlistGrid = ({ cards, onCardClick }: WishlistGridProps) => {
  if (cards.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            Tu lista de deseos está vacía. ¡Comienza a añadir las cartas que
            deseas conseguir!
          </p>
          <Link
            to="/dashboard"
            state={{ activeSection: "Search Cards" }}
          >
            <Button className="bg-red-600 hover:bg-red-700">
              <Search className="h-4 w-4 mr-1" /> Buscar Cartas
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
          actions="wishlist"
        />
      ))}
    </div>
  );
};

export default WishlistGrid;

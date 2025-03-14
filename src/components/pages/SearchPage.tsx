import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import SearchFilters from "../pokemon/SearchFilters";
import CardGrid from "../pokemon/CardGrid";
import CardDetail from "../pokemon/CardDetail";
import AuthDialog from "../auth/AuthDialog";
import { PokemonCard, PokemonCardSearchParams } from "@/types/pokemon";
import { searchCards } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirigir al dashboard con la pestaña de búsqueda activa
      navigate("/dashboard", { state: { activeSection: "Search Cards" } });
    }
  }, [user, navigate]);

  // Si el usuario está autenticado, no renderizamos nada mientras se realiza la redirección
  if (user) return null;

  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [lastAction, setLastAction] = useState<{
    type: "collection" | "wishlist";
    card: PokemonCard | null;
  }>({ type: "collection", card: null });

  const handleSearch = async (params: PokemonCardSearchParams) => {
    setIsSearching(true);
    try {
      const response = await searchCards({
        ...params,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      });
      setSearchResults(response.data);
      setTotalCount(response.totalCount);
      setCurrentPage(params.page || 1);
    } catch (error) {
      console.error("Error searching cards:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCollection = (card: PokemonCard) => {
    if (!user) {
      setLastAction({ type: "collection", card });
      setIsAuthDialogOpen(true);
      toast({
        title: "Inicio de sesión requerido",
        description:
          "Necesitas iniciar sesión para añadir cartas a tu colección",
      });
      return;
    }
    // Aquí iría la lógica para añadir a la colección cuando el usuario está autenticado
  };

  const handleAddToWishlist = (card: PokemonCard) => {
    if (!user) {
      setLastAction({ type: "wishlist", card });
      setIsAuthDialogOpen(true);
      toast({
        title: "Inicio de sesión requerido",
        description:
          "Necesitas iniciar sesión para añadir cartas a tu lista de deseos",
      });
      return;
    }
    // Aquí iría la lógica para añadir a la lista de deseos cuando el usuario está autenticado
  };

  const handleAuthDialogClose = () => {
    setIsAuthDialogOpen(false);
    setLastAction({ type: "collection", card: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-red-50">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="font-bold text-xl flex items-center text-red-600"
            >
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                alt="Pokeball"
                className="h-6 w-6 mr-2"
              />
              PokéCollector
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-red-600 hover:bg-red-700">
                  Mi Colección
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-red-600"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Comenzar
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explorar Cartas Pokémon</h1>
          <p className="text-gray-600">
            Busca entre miles de cartas y encuentra las que necesitas para tu
            colección
          </p>
        </div>

        <div className="space-y-6">
          <SearchFilters
            onSearch={handleSearch}
            isLoading={isSearching}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onAddToCollection={handleAddToCollection}
            onAddToWishlist={handleAddToWishlist}
          >
            {isSearching ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <CardGrid
                cards={searchResults}
                onCardClick={(card) => {
                  setSelectedCard(card);
                  setIsCardDetailOpen(true);
                }}
                onAddToCollection={handleAddToCollection}
                onAddToWishlist={handleAddToWishlist}
              />
            )}
          </SearchFilters>
        </div>
      </main>

      <CardDetail
        card={selectedCard}
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        onAddToCollection={handleAddToCollection}
        onAddToWishlist={handleAddToWishlist}
      />

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={handleAuthDialogClose}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import SearchFilters from "../pokemon/SearchFilters";
import CardGrid from "../pokemon/CardGrid";
import CardDetail from "../pokemon/CardDetail";
import AuthDialog from "../auth/AuthDialog";
import { PokemonCard, PokemonCardSearchParams } from "@/types/pokemon";
import { searchCards, getSets, getTypes, getRarities } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { supabase } from "../../../supabase/supabase";
import { normalizeCardId } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { errorHandler } from "@/lib/error-handler";

export default function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      // Solo especificamos la sección de búsqueda si realmente queremos ir a ella
      navigate("/dashboard");
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

  const [sets, setSets] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);

  // Cargar los datos de filtros al montar el componente
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [setsData, typesData, raritiesData] = await Promise.all([
          getSets().catch(() => []),
          getTypes().catch(() => []),
          getRarities().catch(() => []),
        ]);

        setSets(setsData || []);
        setTypes(typesData || []);
        setRarities(raritiesData || []);
      } catch (error) {
        errorHandler.handleError(error, "loadFilterData", toast, t);
      }
    };

    loadFilterData();
  }, []);

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
      errorHandler.handleError(error, "handleSearch", toast, t);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCollection = (card: PokemonCard) => {
    if (!user) {
      setLastAction({ type: "collection", card });
      setIsAuthDialogOpen(true);
      toast({
        title: t("auth.login"),
        description: t("auth.dialog.description"),
      });
      return;
    }
    // Aquí iría la lógica para añadir a la colección cuando el usuario está autenticado
  };

  const handleAddToWishlist = async (card: PokemonCard) => {
    if (!user) {
      setLastAction({ type: "wishlist", card });
      setIsAuthDialogOpen(true);
      return;
    }

    try {
      const normalizedCardId = normalizeCardId(card.id);

      const { data: existingCard } = await supabase
        .from("wishlist_cards")
        .select("id")
        .eq("user_id", user.id)
        .eq("card_id", normalizedCardId)
        .maybeSingle();

      if (existingCard) {
        toast({
          title: t("wishlist.cardAlreadyExists"),
          description: t("wishlist.cardAlreadyExistsDescription"),
        });
        return;
      }

      const { error } = await supabase.from("wishlist_cards").insert({
        user_id: user.id,
        card_id: normalizedCardId,
        date_added: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: t("common.success"),
        description: t("wishlist.cardAdded"),
      });
    } catch (error) {
      errorHandler.handleError(error, "handleAddToWishlist", toast, t);
    }
  };

  const handleAuthDialogClose = () => {
    setIsAuthDialogOpen(false);
    setLastAction({ type: "collection", card: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-red-50">
      <div className="container pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("search.title")}</h1>
          <p className="text-gray-600">
            {t(
              "search.description",
              "Busca entre miles de cartas y encuentra las que necesitas para tu colección"
            )}
          </p>
        </div>

        <div className="space-y-6">
          <SearchFilters
            sets={sets}
            types={types}
            rarities={rarities}
            onSearch={handleSearch}
            isSearching={isSearching}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onAddToCollection={handleAddToCollection}
            onAddToWishlist={handleAddToWishlist}
          >
            {isSearching ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
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
      </div>

      <CardDetail
        card={selectedCard}
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        onAddToCollection={handleAddToCollection}
        onAddToWishlist={handleAddToWishlist}
        mode="search"
      />

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={handleAuthDialogClose}
      />
    </div>
  );
}

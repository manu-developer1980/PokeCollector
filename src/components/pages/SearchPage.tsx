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

  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
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

        setSets(setsData?.map((set: any) => ({ id: set.id, name: set.name })) || []);
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

  const handleAddToCollection = async (card: PokemonCard) => {
    if (!user) {
      setLastAction({ type: "collection", card });
      setIsAuthDialogOpen(true);
      toast({
        title: t("auth.login"),
        description: t("auth.dialog.description"),
      });
      return;
    }

    try {
      // Obtener la colección por defecto del usuario
      const { data: defaultCollections, error: collectionsError } =
        await supabase
          .from("collections")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .limit(1);

      if (collectionsError) throw collectionsError;

      // Verificar si existe una colección por defecto
      if (!defaultCollections || defaultCollections.length === 0) {
        toast({
          title: t("collection.noDefaultCollection"),
          description: t("collection.pleaseCreateDefault"),
          variant: "destructive",
        });
        return;
      }

      const defaultCollection = defaultCollections[0];
      const normalizedCardId = normalizeCardId(card.id);

      // Verificar si la carta ya existe en la colección
      const { data: existingCards, error: checkError } = await supabase
        .from("collection_cards")
        .select("id, quantity")
        .eq("collection_id", defaultCollection.id)
        .eq("card_id", normalizedCardId);

      if (checkError) throw checkError;

      if (existingCards && existingCards.length > 0) {
        // Si la carta ya existe, incrementar la cantidad
        const existingCard = existingCards[0];
        const { error: updateError } = await supabase
          .from("collection_cards")
          .update({
            quantity: existingCard.quantity + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingCard.id);

        if (updateError) throw updateError;
      } else {
        // Si la carta no existe, añadirla a la colección
        const { error: insertError } = await supabase
          .from("collection_cards")
          .insert({
            collection_id: defaultCollection.id,
            card_id: normalizedCardId,
            quantity: 1,
            condition: "Near Mint",
            is_foil: false,
            is_first_edition: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      // Toast removido - la acción es visible en la UI
    } catch (error) {
      errorHandler.handleError(error, "handleAddToCollection", toast, t);
    }
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

      // Toast removido - la acción es visible en la UI
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
                onQuickAdd={handleAddToCollection}
                actions="search"
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

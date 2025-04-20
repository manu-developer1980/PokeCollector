import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import {
  searchCards,
  getSets,
  getTypes,
  getRarities,
  getCardById,
} from "@/lib/api";
import Sidebar from "../../components/dashboard/layout/Sidebar";
import SearchFilters from "../pokemon/SearchFilters";
import CardGrid from "../pokemon/CardGrid";
import CardDetail from "../pokemon/CardDetail";
import AddToCollectionDialog from "../pokemon/AddToCollectionDialog";
import CollectionList from "../pokemon/CollectionList";
import CollectionDetail from "../pokemon/CollectionDetail";
import CollectionDialog from "../pokemon/CollectionDialog";
import OnboardingModal from "../onboarding/OnboardingModal";
import WishlistGrid from "../pokemon/WishlistGrid";
import Footer from "../pages/Footer";
import {
  Collection,
  CollectionCard,
  PokemonCard,
  PokemonCardSearchParams,
} from "@/types/pokemon";
import { Database, Heart, Search, User } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import MainHeader from "../layout/MainHeader";
import AccountSection from "../dashboard/AccountSection"; // Cambiar esta línea
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { NoDefaultCollectionDialog } from "../pokemon/NoDefaultCollectionDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";
import { PlanChangeDialog } from "@/components/subscription/PlanChangeDialog";
import { SubscriptionLimitModal } from "@/components/subscription/SubscriptionLimitModal";
import { NoActiveSubscriptionModal } from "@/components/subscription/NoActiveSubscriptionModal";
import PricingPage from "./pricing";
import { normalizeCardId } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// Eliminar esta línea que está causando el error
// const { t } = useTranslation();

// Interfaz eliminada: PolarSubscription

export default function PokemonDashboard() {
  // Mover la llamada a useTranslation dentro del componente
  const { t } = useTranslation();
  // 1. Context Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  // const location = useLocation(); // No se utiliza

  // Definir los elementos de navegación dentro del componente
  const defaultNavItems = [
    {
      icon: <Database size={18} />,
      label: t("navigation.collection"),
      id: "My Collection",
    },
    {
      icon: <Heart size={18} />,
      label: t("navigation.wishlist"),
      id: "Wishlist",
    },
    {
      icon: <Search size={18} />,
      label: t("navigation.search"),
      id: "Search Cards",
    },
    { icon: <User size={18} />, label: t("navigation.account"), id: "Account" },
  ];

  // 2. ALL State declarations
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [isNoDefaultCollectionDialogOpen, setIsNoDefaultCollectionDialogOpen] =
    useState(false);
  const [deleteConfirmationState, setDeleteConfirmationState] = useState({
    isOpen: false,
    collectionId: "",
    collectionName: "",
  });
  const [searchParams, setSearchParams] = useState<PokemonCardSearchParams>({
    name: "",
    set: "",
    types: "", // Cambiado de type a types para que coincida con PokemonCardSearchParams
    rarity: "",
    page: 1,
    pageSize: 20,
  });
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
  // Variable eliminada: selectedCollectionCard
  const [pendingQuickAddCard, setPendingQuickAddCard] =
    useState<PokemonCard | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistCards, setWishlistCards] = useState<PokemonCard[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("My Collection");
  // Variable eliminada: subscriptionStatus
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isNoSubscriptionModalOpen, setIsNoSubscriptionModalOpen] =
    useState(false);
  const [lastAttemptedAction, setLastAttemptedAction] = useState("");
  const [limitError, setLimitError] = useState<{
    message: string;
    type: "cards" | "collections" | "wishlist" | string;
  }>({ message: "", type: "" });
  // Variable eliminada: isPlanChangeDialogOpen
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  // 3. Define getCollectionCards first
  const getCollectionCards = useCallback(
    async (collectionId: string): Promise<CollectionCard[]> => {
      try {
        const { data, error } = await supabase
          .from("collection_cards")
          .select(
            `
            id,
            card_id,
            quantity,
            condition,
            is_foil,
            is_first_edition,
            notes,
            created_at
          `
          )
          .eq("collection_id", collectionId);

        if (error) throw error;

        if (!data || data.length === 0) return [];

        const cardsWithDetails = await Promise.all(
          data.map(async (collectionCard) => {
            try {
              // Normalizar el ID de la carta antes de buscarla
              const normalizedCardId = normalizeCardId(collectionCard.card_id);
              const cardDetails = await getCardById(normalizedCardId);

              if (!cardDetails) {
                console.warn(
                  `Card details not found for ID: ${normalizedCardId}`
                );
                return null;
              }

              return {
                ...cardDetails,
                id: collectionCard.id,
                card_id: normalizedCardId, // Usar el ID normalizado
                quantity: collectionCard.quantity,
                condition: collectionCard.condition,
                is_foil: collectionCard.is_foil,
                is_first_edition: collectionCard.is_first_edition,
                notes: collectionCard.notes,
                created_at: collectionCard.created_at,
              };
            } catch (error) {
              console.error(
                `Error fetching card details for ${collectionCard.card_id}:`,
                error
              );
              return null;
            }
          })
        );

        // Convertir el tipo de retorno para que coincida con CollectionCard
        return cardsWithDetails.filter(
          (card): card is any => card !== null
        ) as CollectionCard[];
      } catch (error) {
        console.error("Error in getCollectionCards:", error);
        throw error;
      }
    },
    []
  );

  // 4. Then define getCollections which uses getCollectionCards
  const getCollections = useCallback(async () => {
    setIsCollectionLoading(true);
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setCollections([]);
        return;
      }

      const collectionsWithCards = await Promise.all(
        data.map(async (collection) => {
          const cards = await getCollectionCards(collection.id);
          return {
            ...collection,
            cards: cards || [],
          };
        })
      );

      setCollections(collectionsWithCards);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: t("common.error"),
        description: t("collection.errors.loadFailed"),
        variant: "destructive",
      });
    } finally {
      setIsCollectionLoading(false);
    }
  }, [user?.id, toast, getCollectionCards]);

  // 4. Helper functions and other callbacks
  // Función eliminada: getSubscriptionStatus

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No se encontró el usuario, vamos a crearlo
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || "Usuario",
              has_seen_onboarding: false,
              preferred_lang: user.user_metadata?.preferred_lang || "es",
            },
          ]);

          if (insertError) {
            console.error("Error inserting user:", insertError);
            return;
          }

          setShowOnboarding(true);
          return;
        }
        throw error;
      }
      setShowOnboarding(!data?.has_seen_onboarding);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  }, [user]);

  // 5. All useCallback declarations
  const validateResourceLimit = useCallback(
    async (
      resourceType: "wishlist" | "collection_cards" | "collections",
      userId: string,
      quantity: number = 1
    ) => {
      try {
        if (isSubscriptionLoading) {
          return {
            valid: false,
            error: t(
              "subscription.verifyingStatus",
              "Verifying subscription status..."
            ),
          };
        }

        if (!subscription || subscription.status !== "active") {
          const actionMap = {
            wishlist: t("subscription.actions.addToWishlist"),
            collection_cards: t("subscription.actions.addToCollection"),
            collections: t("subscription.actions.createCollections"),
          };
          setLastAttemptedAction(actionMap[resourceType]);
          setIsNoSubscriptionModalOpen(true);
          return {
            valid: false,
            error: t("subscription.requiredTitle", "Subscription required"),
          };
        }

        const planType = subscription?.plan_type || "APRENDIZ";
        // Seleccionar la tabla correcta según el tipo de recurso
        const tableName =
          resourceType === "wishlist"
            ? "wishlist_cards"
            : resourceType === "collections"
            ? "collections"
            : "collection_cards";

        // Obtener el conteo actual
        let count = 0;
        let error = null;

        if (resourceType === "collection_cards") {
          // Para collection_cards, necesitamos primero obtener las colecciones del usuario
          // y luego contar las cartas en esas colecciones
          console.log(`Obteniendo colecciones para el usuario ${userId}`);
          const { data: userCollections, error: collectionsError } =
            await supabase
              .from("collections")
              .select("id")
              .eq("user_id", userId);

          if (collectionsError) {
            console.error(
              `Error al obtener colecciones del usuario:`,
              collectionsError
            );
            throw collectionsError;
          }

          console.log(`Colecciones encontradas:`, userCollections);

          if (userCollections && userCollections.length > 0) {
            const collectionIds = userCollections.map((c) => c.id);
            console.log(`IDs de colecciones a consultar:`, collectionIds);

            const { count: cardsCount, error: cardsError } = await supabase
              .from("collection_cards")
              .select("*", { count: "exact", head: true })
              .in("collection_id", collectionIds);

            console.log(`Resultado del conteo de cartas:`, {
              cardsCount,
              cardsError,
            });
            count = cardsCount || 0;
            error = cardsError;
          } else {
            console.log(
              `No se encontraron colecciones para el usuario ${userId}`
            );
          }
        } else {
          // Para wishlist_cards y collections, podemos filtrar directamente por user_id
          console.log(
            `Consultando tabla ${tableName} para el usuario ${userId}`
          );
          const { count: itemCount, error: itemError } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

          console.log(`Resultado del conteo en ${tableName}:`, {
            itemCount,
            itemError,
          });
          count = itemCount || 0;
          error = itemError;
        }

        if (error) {
          console.error(`Error al contar ${resourceType}:`, error);
          throw error;
        }

        const currentCount = count || 0;

        // Registros de depuración detallados para entender qué está pasando
        const maxValue =
          resourceType === "collections"
            ? PLAN_FEATURES[planType.toUpperCase()]?.maxCollections
            : resourceType === "wishlist"
            ? PLAN_FEATURES[planType.toUpperCase()]?.maxWishlist
            : PLAN_FEATURES[planType.toUpperCase()]?.maxCards;

        console.log(`validateResourceLimit - ${resourceType}:`, {
          currentCount,
          quantity,
          planType,
          planTypeUpperCase: planType.toUpperCase(),
          maxValue,
          planFeatures: PLAN_FEATURES[planType.toUpperCase()],
          allPlanFeatures: PLAN_FEATURES,
          willExceedLimit: currentCount + quantity > maxValue,
          calculation: `${currentCount} + ${quantity} ${
            currentCount + quantity > maxValue ? ">" : "<="
          } ${maxValue}`,
        });

        // Verificar directamente si estamos en el límite o lo superamos

        // Corregir el problema con el límite de colecciones
        // Si currentCount + quantity es mayor que maxValue, no es válido
        // Para colecciones, verificamos si currentCount >= maxValue (sin sumar quantity)
        // porque estamos verificando antes de crear una nueva colección
        const willExceedLimit =
          resourceType === "collections"
            ? currentCount >= maxValue
            : currentCount + quantity > maxValue;

        console.log(`validateResourceLimit - Verificación final:`, {
          resourceType,
          currentCount,
          maxValue,
          willExceedLimit,
          calculation:
            resourceType === "collections"
              ? `${currentCount} >= ${maxValue} = ${currentCount >= maxValue}`
              : `${currentCount} + ${quantity} > ${maxValue} = ${
                  currentCount + quantity > maxValue
                }`,
        });

        if (willExceedLimit) {
          // Obtener el nombre del plan traducido
          const planName = t(`plans.${planType.toLowerCase()}`);

          // Obtener el tipo de recurso traducido
          const resourceTypeText =
            resourceType === "collections"
              ? t("limits.collections")
              : resourceType === "wishlist"
              ? t("limits.wishlist")
              : t("limits.cards");

          // Crear el mensaje de error usando traducciones
          const errorMessage = t("subscription.limitReachedMessage", {
            limit: maxValue,
            type: resourceTypeText,
            plan: planName,
          });

          return {
            valid: false,
            error: errorMessage,
            limitType:
              resourceType === "collections"
                ? "collections"
                : resourceType === "wishlist"
                ? "wishlist"
                : "cards",
          };
        }

        return { valid: true, error: null, limitType: null };
      } catch (error) {
        console.error("Error validating limit:", error);
        return {
          valid: false,
          error: t(
            "subscription.errors.validationFailed",
            "Error validating subscription limits"
          ),
        };
      }
    },
    [subscription, isSubscriptionLoading]
  );

  const fetchWishlist = useCallback(async () => {
    setIsWishlistLoading(true);
    try {
      const { data: wishlistData, error } = await supabase
        .from("wishlist_cards") // Nombre correcto de la tabla
        .select(
          `
          id,
          card_id,
          user_id,
          date_added
        `
        )
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
      }

      if (!wishlistData || wishlistData.length === 0) {
        setWishlistCards([]);
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
      setIsWishlistLoading(false);
    }
  }, [user?.id, toast]);

  const handleAddToWishlist = useCallback(
    async (card: PokemonCard) => {
      try {
        if (!user?.id) {
          setLimitError({
            message: t("auth.loginRequiredForWishlist"),
            type: "wishlist",
          });
          setIsLimitModalOpen(true);
          return;
        }

        const { valid, error: limitError } = await validateResourceLimit(
          "wishlist",
          user.id
        );

        if (!valid) {
          setLimitError({
            message: limitError || "",
            type: "wishlist",
          });
          setIsLimitModalOpen(true);
          return;
        }

        const { data: existingCard } = await supabase
          .from("wishlist_cards")
          .select("*")
          .eq("user_id", user.id)
          .eq("card_id", card.id)
          .maybeSingle();

        if (existingCard) {
          toast({
            title: t("wishlist.alreadyInWishlist"),
            description: t("wishlist.cardAlreadyExists"),
          });
          return;
        }

        await supabase.from("wishlist_cards").insert({
          user_id: user.id,
          card_id: card.id,
          date_added: new Date().toISOString(),
        });

        toast({
          title: t("toasts.wishlistAdded"),
          description: t("wishlist.cardAdded"),
        });

        // Refrescar la lista de deseos inmediatamente
        await fetchWishlist();
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        toast({
          title: t("common.error"),
          description: t("wishlist.errors.addFailed"),
          variant: "destructive",
        });
      }
    },
    [user, toast, navigate, validateResourceLimit, fetchWishlist]
  );

  // 6. Effects
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        await Promise.all([getCollections(), checkOnboardingStatus()]);

        // Verificar si el usuario necesita ver el onboarding (guardado en localStorage por LoginForm)
        const needsOnboarding = localStorage.getItem("needs_onboarding");
        if (needsOnboarding === "true") {
          // Mostrar el onboarding
          setShowOnboarding(true);
          // Eliminar la marca de localStorage para que no se muestre de nuevo
          localStorage.removeItem("needs_onboarding");
        }
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [user, navigate, getCollections, checkOnboardingStatus]);

  // Efecto eliminado: actualización de subscriptionStatus

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [setsData, typesData, raritiesData] = await Promise.all([
          getSets().catch((error) => {
            console.error(
              t("search.errors.setsFailed", "Error loading sets:"),
              error
            );
            return [];
          }),
          getTypes().catch((error) => {
            console.error(
              t("search.errors.typesFailed", "Error loading types:"),
              error
            );
            return [];
          }),
          getRarities().catch((error) => {
            console.error(
              t("search.errors.raritiesFailed", "Error loading rarities:"),
              error
            );
            return [];
          }),
        ]);

        setSets(
          setsData?.map((set: { id: string; name: string }) => ({
            id: set.id,
            name: set.name,
          })) || []
        );
        setTypes(typesData || []);
        setRarities(raritiesData || []);
      } catch (error) {
        console.error(
          t("search.errors.filterDataFailed", "Error loading filter data:"),
          error
        );
        toast({
          title: "Error",
          description: t(
            "search.errors.filtersFailed",
            "Could not load filters. Please try again."
          ),
          variant: "destructive",
        });
      }
    };

    loadFilterData();
  }, [toast]);

  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
    setIsCardDetailOpen(true);
  };

  const handleAddToCollection = (card: PokemonCard) => {
    if (!user) {
      toast({
        title: t("common.error"),
        description: t(
          "auth.loginRequiredForCollection",
          "You must be logged in to add cards to your collection."
        ),
        variant: "destructive",
      });
      return;
    }

    // Asegurarse de que la carta tenga la propiedad wishlist_id si viene de la lista de deseos
    const cardWithWishlistId = {
      ...card,
      wishlist_id: (card as any).wishlist_id,
    };
    setSelectedCard(cardWithWishlistId);
    setIsAddToCollectionOpen(true);
    setIsCardDetailOpen(false); // Close the detail modal if it's open
  };

  const handleSaveToCollection = async (cardData: {
    card: PokemonCard;
    collectionId: string;
    quantity: number;
    condition?: string;
    isFoil?: boolean;
    isFirstEdition?: boolean;
    notes?: string;
  }) => {
    if (!subscription) return;

    // Guardar el estado actual de la sección para poder volver a él después de actualizar
    const currentSection = activeSection;

    try {
      // Verificar límites de cartas si es una nueva carta (no actualización)
      if (!user?.id) {
        throw new Error(t("auth.loginRequiredForCollection"));
      }

      const normalizedCardId = normalizeCardId(cardData.card.id);

      // Verificar si la carta existe en la colección
      const { data: existingCard, error: checkError } = await supabase
        .from("collection_cards")
        .select("*")
        .eq("collection_id", cardData.collectionId)
        .eq("card_id", normalizedCardId)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      // Si no existe la carta, verificar límites antes de añadirla
      if (!existingCard) {
        const { valid, error: limitError } = await validateResourceLimit(
          "collection_cards",
          user.id,
          cardData.quantity
        );

        if (!valid) {
          setLimitError({
            message: limitError || "",
            type: "cards",
          });
          setIsLimitModalOpen(true);
          return;
        }
      }

      if (existingCard) {
        // Actualizar carta existente
        const { error: updateError } = await supabase
          .from("collection_cards")
          .update({
            quantity: existingCard.quantity + cardData.quantity,
            condition: cardData.condition || existingCard.condition,
            is_foil: cardData.isFoil ?? existingCard.is_foil,
            is_first_edition:
              cardData.isFirstEdition ?? existingCard.is_first_edition,
            notes: cardData.notes || existingCard.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingCard.id);

        if (updateError) throw updateError;
      } else {
        // Insertar nueva carta
        const { error: insertError } = await supabase
          .from("collection_cards")
          .insert({
            collection_id: cardData.collectionId,
            card_id: normalizedCardId,
            quantity: cardData.quantity,
            condition: cardData.condition,
            is_foil: cardData.isFoil,
            is_first_edition: cardData.isFirstEdition,
            notes: cardData.notes,
            name: cardData.card.name,
            set_name: cardData.card.set?.name,
            image_url:
              cardData.card.images?.small || cardData.card.images?.large,
          });

        if (insertError) throw insertError;
      }

      // Close the dialog
      setIsAddToCollectionOpen(false);

      // Show toast notification
      toast({
        title: t("toasts.cardAdded"),
        description: t("collection.cardAdded"),
      });

      // No need to call getCollections() here as it will be triggered by the real-time subscription

      if (cardData.card.wishlist_id) {
        try {
          const { error: removeError } = await supabase
            .from("wishlist_cards")
            .delete()
            .eq("id", cardData.card.wishlist_id);

          if (removeError) throw removeError;

          setWishlistCards((prev) => {
            const filtered = prev.filter(
              (c) => c.wishlist_id !== cardData.card.wishlist_id
            );

            return filtered;
          });

          toast({
            title: t("wishlist.cardRemoved"),
            description: t("wishlist.removedAfterAdding"),
          });
        } catch (error) {
          console.error("Error removing card from wishlist:", error);
        }
      }
    } catch (error) {
      console.error("Error saving to collection:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la carta en la colección.",
        variant: "destructive",
      });
    } finally {
      // Si estábamos en la sección de lista de deseos, volvemos a cargar la lista de deseos
      if (currentSection === "Wishlist") {
        await fetchWishlist();
      }
    }
  };

  const handleCreateCollection = async () => {
    if (!subscription) return;
    if (!user?.id) return;

    try {
      // 1. Obtener el número actual de colecciones
      const { count, error: countError } = await supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) {
        console.error("Error al contar colecciones:", countError);
        throw countError;
      }

      // 2. Obtener el límite máximo de colecciones para el plan
      const currentCount = count || 0;
      const maxCollections =
        PLAN_FEATURES[subscription.plan_type.toUpperCase()]?.maxCollections ||
        0;

      console.log("Verificación de límite de colecciones:", {
        currentCount,
        maxCollections,
        planType: subscription.plan_type,
        comparacion: `${currentCount} < ${maxCollections} = ${
          currentCount < maxCollections
        }`,
      });

      // 3. Comparar directamente si el número actual es menor que el límite
      if (currentCount < maxCollections) {
        // Si no se ha alcanzado el límite, permitir crear la colección
        setEditingCollection(null);
        setIsCollectionDialogOpen(true);
      } else {
        // Si se ha alcanzado el límite, mostrar error usando traducciones
        const planName = t(`plans.${subscription.plan_type.toLowerCase()}`);
        const resourceTypeText = t("limits.collections");

        const errorMessage = t("subscription.limitReachedMessage", {
          limit: maxCollections,
          type: resourceTypeText,
          plan: planName,
        });

        setLimitError({
          message: errorMessage,
          type: "collections",
        });
        setIsLimitModalOpen(true);
      }
    } catch (error) {
      console.error("Error al crear colección:", error);
      toast({
        title: t("common.error"),
        description: t("collection.errors.createFailed"),
        variant: "destructive",
      });
    }
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setIsCollectionDialogOpen(true);
  };

  const handleSaveCollection = async (collectionData: Partial<Collection>) => {
    try {
      if (collectionData.id) {
        // Si estamos marcando como predeterminada, primero desmarcamos la actual
        if (collectionData.is_default) {
          const { error: updateError } = await supabase
            .from("collections")
            .update({ is_default: false })
            .eq("user_id", user?.id)
            .neq("id", collectionData.id) // No actualizar la colección actual
            .eq("is_default", true);

          if (updateError) throw updateError;
        }

        // Actualizar la colección actual
        const { error } = await supabase
          .from("collections")
          .update({
            name: collectionData.name,
            description: collectionData.description,
            is_default: collectionData.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq("id", collectionData.id);

        if (error) throw error;

        // Usar interpolación directa para asegurarnos de que el nombre se muestre correctamente
        const successMessage = t("collection.saveSuccess").replace(
          "{name}",
          collectionData.name || ""
        );
        toast({
          title: t("collection.updated"),
          description: successMessage,
        });
      } else {
        // Para nueva colección
        if (collectionData.is_default) {
          // Primero desmarcamos cualquier colección predeterminada existente
          const { error: updateError } = await supabase
            .from("collections")
            .update({ is_default: false })
            .eq("user_id", user?.id)
            .eq("is_default", true);

          if (updateError) throw updateError;
        }

        // Crear la nueva colección
        const { error } = await supabase.from("collections").insert({
          name: collectionData.name,
          description: collectionData.description,
          user_id: user?.id,
          is_default: collectionData.is_default,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        // Usar interpolación directa para asegurarnos de que el nombre se muestre correctamente
        const successMessage = t("collection.saveSuccess").replace(
          "{name}",
          collectionData.name || ""
        );
        toast({
          title: t("collection.created"),
          description: successMessage,
        });
      }

      // Actualizar el estado local
      await getCollections(); // Cambiamos fetchCollections por getCollections

      // Cerrar el diálogo
      setIsCollectionDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving collection:", error);
      toast({
        title: t("common.error"),
        description: t("collection.errors.saveFailed"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    setDeleteConfirmationState({
      isOpen: true,
      collectionId,
      collectionName: collection.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmationState.collectionId) return;

    try {
      const { error: cardsError } = await supabase
        .from("collection_cards")
        .delete()
        .eq("collection_id", deleteConfirmationState.collectionId);

      if (cardsError) throw cardsError;

      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", deleteConfirmationState.collectionId);

      if (error) throw error;

      setCollections((prevCollections) =>
        prevCollections.filter(
          (collection) => collection.id !== deleteConfirmationState.collectionId
        )
      );

      if (selectedCollection?.id === deleteConfirmationState.collectionId) {
        setSelectedCollection(null);
      }

      toast({
        title: t("collection.deleted"),
        description: t("collection.deleteSuccess"),
      });
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: t("common.error"),
        description: t("collection.errors.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmationState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!selectedCollection) return;

    try {
      const { error } = await supabase
        .from("collection_cards")
        .delete()
        .eq("id", cardId)
        .eq("collection_id", selectedCollection.id);

      if (error) throw error;

      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (collection.id === selectedCollection.id) {
            return {
              ...collection,
              cards: collection.cards.filter((card) => card.id !== cardId),
            };
          }
          return collection;
        })
      );

      setSelectedCollection((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.filter((card) => card.id !== cardId),
        };
      });

      toast({
        title: t("card.removed"),
        description: t("card.removeSuccess"),
      });
    } catch (error) {
      console.error("Error removing card:", error);
      toast({
        title: t("common.error"),
        description: t("wishlist.errors.removeFailed"),
        variant: "destructive",
      });
    }
  };

  const handleUpdateCard = async (cardData: {
    id: string;
    quantity: number;
    condition?: string;
    is_foil?: boolean;
    is_first_edition?: boolean;
    notes?: string;
  }) => {
    if (!selectedCollection) {
      throw new Error(t("collection.errors.noSelectedCollection"));
    }

    try {
      const updateData = {
        quantity: cardData.quantity,
        condition: cardData.condition,
        is_foil: cardData.is_foil,
        is_first_edition: cardData.is_first_edition,
        notes: cardData.notes,
        updated_at: new Date().toISOString(),
      };

      // Obtener el card_id y actualizar en un solo paso
      const { data: updatedCard, error: updateError } = await supabase
        .from("collection_cards")
        .update(updateData)
        .eq("id", cardData.id)
        .select("*")
        .single();

      if (updateError) {
        if (updateError.code === "PGRST116") {
          // La carta no existe
          throw new Error("La carta no existe o ha sido eliminada");
        }
        throw updateError;
      }

      // Si la actualización fue exitosa pero no tenemos los datos, al menos actualizamos los campos básicos
      if (!updatedCard) {
        // Actualizar el estado local con los datos que tenemos
        setCollections((prevCollections) =>
          prevCollections.map((collection) => {
            if (collection.id === selectedCollection.id) {
              return {
                ...collection,
                cards: collection.cards.map((card) =>
                  card.id === cardData.id ? { ...card, ...updateData } : card
                ),
              };
            }
            return collection;
          })
        );

        if (selectedCollection) {
          setSelectedCollection((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              cards: prev.cards.map((card) =>
                card.id === cardData.id ? { ...card, ...updateData } : card
              ),
            };
          });
        }

        toast({
          title: t("card.updated"),
          description: t("card.updateSuccess"),
        });

        return { ...cardData, ...updateData };
      }

      // Si tenemos los datos completos, actualizamos con toda la información
      const cardDetails = await getCardById(updatedCard.card_id);
      const completeUpdatedCard = cardDetails
        ? {
            ...cardDetails,
            id: updatedCard.id,
            collection_id: updatedCard.collection_id,
            quantity: updatedCard.quantity,
            condition: updatedCard.condition,
            is_foil: updatedCard.is_foil,
            is_first_edition: updatedCard.is_first_edition,
            notes: updatedCard.notes,
            created_at: updatedCard.created_at,
            updated_at: updatedCard.updated_at,
          }
        : { ...updatedCard };

      // Actualizar el estado local
      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (collection.id === selectedCollection.id) {
            return {
              ...collection,
              cards: collection.cards.map((card) =>
                card.id === cardData.id ? completeUpdatedCard : card
              ),
            };
          }
          return collection;
        })
      );

      if (selectedCollection) {
        setSelectedCollection((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: prev.cards.map((card) =>
              card.id === cardData.id ? completeUpdatedCard : card
            ),
          };
        });
      }

      toast({
        title: t("card.updated"),
        description: t("card.updateSuccess"),
      });

      return completeUpdatedCard;
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: t("common.error"),
        description: t("card.errors.updateFailed"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleQuickAddToCollection = async (card: PokemonCard) => {
    // Encontrar la colección por defecto
    const defaultCollection = collections.find((c) => c.is_default);

    if (!defaultCollection) {
      setPendingQuickAddCard(card);
      setIsNoDefaultCollectionDialogOpen(true);
      return;
    }

    try {
      // handleSaveToCollection already handles everything including:
      // - Adding the card to the collection
      // - Removing from wishlist if needed
      // - Showing toast notifications
      // - Updating the collections state
      await handleSaveToCollection({
        card,
        collectionId: defaultCollection.id,
        quantity: 1,
        condition: "Near Mint",
        isFoil: false,
        isFirstEdition: false,
        notes: "",
      });

      // No need for additional toast or wishlist operations here
      // as they are already handled in handleSaveToCollection
    } catch (error) {
      console.error(
        t("collection.errors.addFailed", "Error adding card to collection:"),
        error
      );
      toast({
        title: t("common.error"),
        description: t("collection.errors.loadFailed"),
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultCollection = async (collection: Collection) => {
    try {
      // Primero actualizamos la colección actual como predeterminada
      await handleSaveCollection({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        is_default: true, // Cambiado de isDefault a is_default para que coincida con el tipo Collection
      });

      // Si hay una carta pendiente, la añadimos
      if (pendingQuickAddCard) {
        await handleQuickAddToCollection(pendingQuickAddCard);
      }

      setIsNoDefaultCollectionDialogOpen(false);
      setPendingQuickAddCard(null);
    } catch (error) {
      console.error("Error al establecer colección predeterminada:", error);
      toast({
        title: t("common.error"),
        description: t("collection.errors.setDefaultFailed"),
        variant: "destructive",
      });
    }
  };

  const handleCreateNewFromNoDefault = () => {
    setIsNoDefaultCollectionDialogOpen(false);
    // Abrimos el diálogo de creación de colección pero sin marcar la opción de colección por defecto
    // El usuario tendrá que marcar manualmente la opción si quiere que sea la colección por defecto
    setIsCollectionDialogOpen(true);
  };

  // Función eliminada: calculateRange

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    if (!user) return;

    let collectionsChannel: RealtimeChannel;
    let cardsChannel: RealtimeChannel;
    let updateTimeoutId: NodeJS.Timeout | null = null;

    const setupSubscriptions = () => {
      // Suscripción para cambios en las colecciones
      collectionsChannel = supabase
        .channel("collections-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "collections",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await getCollections(); // Actualizar todas las colecciones
          }
        )
        .subscribe();

      // Suscripción para cambios en las cartas de la colección
      cardsChannel = supabase
        .channel("collection-cards-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "collection_cards",
          },
          async () => {
            // Debounce the collection update to prevent multiple calls
            if (updateTimeoutId) {
              clearTimeout(updateTimeoutId);
            }

            updateTimeoutId = setTimeout(async () => {
              await getCollections(); // Actualizar todas las colecciones

              // Si hay una colección seleccionada, actualizar sus cartas
              if (selectedCollection) {
                const updatedCollection = await getCollectionWithCards(
                  selectedCollection.id
                );
                if (updatedCollection) {
                  setSelectedCollection(updatedCollection);
                }
              }
            }, 300); // Add a small delay to debounce multiple rapid updates
          }
        )
        .subscribe();
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
      if (updateTimeoutId) clearTimeout(updateTimeoutId);
      if (collectionsChannel) collectionsChannel.unsubscribe();
      if (cardsChannel) cardsChannel.unsubscribe();
    };
  }, [user, selectedCollection]);

  // Añadir función auxiliar para obtener una colección con sus cartas
  const getCollectionWithCards = async (collectionId: string) => {
    try {
      const { data: collectionData, error: collectionError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (collectionError) {
        if (collectionError.code === "PGRST116") {
          // La colección no existe
          return null;
        }
        throw collectionError;
      }
      if (!collectionData) return null;

      const cards = await getCollectionCards(collectionId);
      return {
        ...collectionData,
        cards: cards || [],
      };
    } catch (error) {
      console.error("Error fetching collection with cards:", error);
      return null;
    }
  };

  // Asegurarnos de que fetchWishlist se llama cuando se cambia a la pestaña de Lista de Deseos
  useEffect(() => {
    if (activeSection === "Wishlist" && user) {
      fetchWishlist();
    }
  }, [activeSection, user, fetchWishlist]);

  const handleRemoveFromWishlist = async (card: PokemonCard) => {
    try {
      if (!card.wishlist_id) {
        throw new Error(
          t("wishlist.errors.idNotFound", "Wishlist ID not found")
        );
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

  const handleSearchParamsChange = useCallback(
    (newParams: Partial<PokemonCardSearchParams>) => {
      setSearchParams((prevParams) => ({
        ...prevParams,
        ...newParams,
      }));

      // Si se cambia la página, realizar la búsqueda inmediatamente
      if ("page" in newParams) {
        handleSearch({
          ...searchParams,
          ...newParams,
        });
      } else {
        // Para otros cambios, usar un debounce
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          handleSearch({
            ...searchParams,
            ...newParams,
          });
        }, 500);
      }
    },
    [searchParams]
  );

  const handleSearch = useCallback(
    async (params: PokemonCardSearchParams) => {
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
        toast({
          title: t("common.error"),
          description: t("search.errors.loadFailed"),
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    },
    [toast]
  );

  const renderSearchContent = () => (
    <>
      <SearchFilters
        sets={sets}
        types={types}
        rarities={rarities}
        searchParams={searchParams}
        onSearchParamsChange={handleSearchParamsChange}
        onSearch={handleSearch}
        isLoading={isSearching}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={searchParams.pageSize}
      >
        <CardGrid
          cards={searchResults}
          onCardClick={handleCardClick}
          onQuickAdd={handleQuickAddToCollection}
          onAddToWishlist={handleAddToWishlist}
        />
      </SearchFilters>
    </>
  );

  const renderWishlistContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{t("wishlist.title")}</h2>
      </div>
      <WishlistGrid
        cards={wishlistCards}
        onCardClick={(card) => {
          setSelectedCard(card);
          setIsCardDetailOpen(true);
        }}
        onQuickAdd={handleQuickAddToCollection}
        onRemove={handleRemoveFromWishlist}
        isLoading={isWishlistLoading}
        onSectionChange={(section: string) => {
          setActiveSection(section);
        }}
      />
    </div>
  );

  const renderAccountContent = () => {
    return <AccountSection onSectionChange={setActiveSection} />;
  };

  const renderCollectionContent = () => {
    if (selectedCollection) {
      return (
        <CollectionDetail
          collection={selectedCollection}
          onBack={() => setSelectedCollection(null)}
          onEdit={handleEditCollection}
          onRemove={handleRemoveCard}
          onCardClick={(card) => {
            // Convertir CollectionCard a PokemonCard para setSelectedCard
            setSelectedCard(card as unknown as PokemonCard);
            setIsCardDetailOpen(true);
          }}
          onSectionChange={setActiveSection}
        />
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">
            {t("collection.myCollections")}
          </h2>
        </div>

        <CollectionList
          collections={collections}
          selectedCollection={selectedCollection}
          onCollectionSelect={setSelectedCollection}
          onCreateCollection={handleCreateCollection}
          onEditCollection={handleEditCollection}
          onDeleteCollection={handleDeleteCollection}
          isLoading={isCollectionLoading}
        />
      </>
    );
  };

  // Efecto para cargar la lista de deseos cuando se cambia a la sección Wishlist
  useEffect(() => {
    if (activeSection === "Wishlist") {
      fetchWishlist();
    }
  }, [activeSection, fetchWishlist]);

  const renderSection = () => {
    switch (activeSection) {
      case "My Collection":
        return renderCollectionContent();
      case "Search Cards":
        return renderSearchContent();
      case "Wishlist":
        return renderWishlistContent();
      case "Account":
        return renderAccountContent();

      case "Pricing":
        return <PricingPage />;
      default:
        return renderSearchContent();
    }
  };

  // Función eliminada: handleUpgradePlan

  const planType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as SubscriptionPlan;

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader showNavigation={false} />
        <div className="flex-1 flex w-full max-w-screen-xl mx-auto bg-gradient-to-b from-yellow-50 to-red-50">
          {/* Sidebar solo visible en desktop */}
          <Sidebar
            items={defaultNavItems}
            activeItem={activeSection}
            onItemClick={setActiveSection}
          />

          <main className="flex-1 min-h-0">
            <div className="container mx-auto p-6">{renderSection()}</div>
          </main>
        </div>
        <Footer />
      </div>
      {/* Dialogs */}
      <CardDetail
        card={selectedCard}
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        onAddToCollection={handleAddToCollection}
        onAddToWishlist={handleAddToWishlist}
        onRemoveFromWishlist={(card) => {
          if (card) {
            handleRemoveFromWishlist(card);
          }
        }}
        onUpdate={handleUpdateCard}
        onRemove={handleRemoveCard}
        mode={
          activeSection === "My Collection"
            ? "collection"
            : activeSection === "Wishlist"
            ? "wishlist"
            : "search"
        }
        userPlan={planType.toLowerCase()}
      />
      <AddToCollectionDialog
        card={selectedCard}
        collections={collections}
        isOpen={isAddToCollectionOpen}
        onClose={() => setIsAddToCollectionOpen(false)}
        onAddToCollection={handleSaveToCollection}
      />
      {/* Pasamos las colecciones existentes para que el usuario pueda decidir si quiere crear una colección por defecto */}
      <CollectionDialog
        collection={editingCollection}
        isOpen={isCollectionDialogOpen}
        onClose={() => setIsCollectionDialogOpen(false)}
        onSave={handleSaveCollection}
        collections={collections}
      />
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          // El OnboardingModal ya actualiza la base de datos cuando se cierra
        }}
      />
      <Toaster />
      <DeleteConfirmationDialog
        isOpen={deleteConfirmationState.isOpen}
        onClose={() =>
          setDeleteConfirmationState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmDelete}
        title={t("collection.delete")}
        description={`${t("collection.confirmDelete")} "${
          deleteConfirmationState.collectionName
        }" ${t("collection.deleteWarning")}`}
      />
      <NoDefaultCollectionDialog
        isOpen={isNoDefaultCollectionDialogOpen}
        onClose={() => {
          setIsNoDefaultCollectionDialogOpen(false);
          setPendingQuickAddCard(null);
        }}
        onCreateNew={handleCreateNewFromNoDefault}
        onSetDefault={handleSetDefaultCollection}
        existingCollections={collections.filter((c) => !c.is_default)}
      />
      {!isLoading && (
        <PlanChangeDialog
          isOpen={isPlanDialogOpen}
          onClose={() => setIsPlanDialogOpen(false)}
          currentPlan={subscription?.plan_type || "aprendiz"}
        />
      )}
      <SubscriptionLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        limitType={
          limitError.type as "cards" | "collections" | "wishlist" | null
        }
        currentPlan={subscription?.plan_type || "aprendiz"}
        errorMessage={limitError.message}
        onViewPlans={() => setActiveSection("Pricing")}
      />
      <NoActiveSubscriptionModal
        isOpen={isNoSubscriptionModalOpen}
        onClose={() => setIsNoSubscriptionModalOpen(false)}
        onViewPlans={() => {
          setIsNoSubscriptionModalOpen(false);
          setActiveSection("Pricing");
        }}
        action={lastAttemptedAction}
      />
    </>
  );
}

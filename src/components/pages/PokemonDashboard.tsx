import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
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
import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";
import MainHeader from "../layout/MainHeader";
import AccountSection from "../dashboard/AccountSection"; // Cambiar esta línea
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { NoDefaultCollectionDialog } from "../pokemon/NoDefaultCollectionDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { validateSubscriptionLimits } from "@/lib/subscription-utils";
import { useNavigate } from "react-router-dom";
import { PlanChangeDialog } from "@/components/subscription/PlanChangeDialog";
import { SubscriptionLimitModal } from "@/components/subscription/SubscriptionLimitModal";
import { NoActiveSubscriptionModal } from "@/components/subscription/NoActiveSubscriptionModal";
import PricingPage from "./pricing";
import { useUser } from "@/hooks/useUser";
import { normalizeCardId } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// Eliminar esta línea que está causando el error
// const { t } = useTranslation();

interface PolarSubscription {
  status: string;
  polar_price_id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export default function PokemonDashboard() {
  // Mover la llamada a useTranslation dentro del componente
  const { t } = useTranslation();
  // 1. Context Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const location = useLocation();

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
    type: "",
    rarity: "",
    page: 1,
    pageSize: 20,
  });
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
  const [selectedCollectionCard, setSelectedCollectionCard] =
    useState<CollectionCard | null>(null);
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
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isNoSubscriptionModalOpen, setIsNoSubscriptionModalOpen] =
    useState(false);
  const [lastAttemptedAction, setLastAttemptedAction] = useState("");
  const [limitError, setLimitError] = useState({ message: "", type: "" });
  const [isPlanChangeDialogOpen, setIsPlanChangeDialogOpen] = useState(false);
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

        return cardsWithDetails.filter(
          (card): card is CollectionCard => card !== null
        );
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
  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) return "free";
    return subscription.status === "active" ? subscription.plan_type : "free";
  }, [subscription]);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("id", user.id)
        .single();

      if (error) throw error;
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
            error: "Verificando estado de suscripción...",
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
            error: "Suscripción requerida",
          };
        }

        const planType = subscription?.plan_type || "APRENDIZ";
        const { count } = await supabase
          .from(
            resourceType === "wishlist" ? "wishlist_cards" : "collection_cards"
          )
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        const currentCount = count || 0;
        const validation = validateSubscriptionLimits(
          planType,
          resourceType === "collection_cards" ? currentCount + quantity : 0,
          resourceType === "collections" ? currentCount + quantity : 0,
          resourceType === "wishlist" ? currentCount + quantity : 0
        );

        if (!validation.valid) {
          setLimitError({
            message: validation.error || "",
            type: validation.limitType,
          });
          setIsLimitModalOpen(true);
        }

        return validation;
      } catch (error) {
        console.error("Error validating limit:", error);
        return {
          valid: false,
          error: "Error al validar los límites de la suscripción",
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

  useEffect(() => {
    setSubscriptionStatus(getSubscriptionStatus());
  }, [subscription, getSubscriptionStatus]);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [setsData, typesData, raritiesData] = await Promise.all([
          getSets().catch((error) => {
            console.error("Error al cargar sets:", error);
            return [];
          }),
          getTypes().catch((error) => {
            console.error("Error al cargar tipos:", error);
            return [];
          }),
          getRarities().catch((error) => {
            console.error("Error al cargar rarezas:", error);
            return [];
          }),
        ]);

        setSets(setsData?.map((set) => ({ id: set.id, name: set.name })) || []);
        setTypes(typesData || []);
        setRarities(raritiesData || []);
      } catch (error) {
        console.error("Error al cargar datos de filtros:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar los filtros. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      }
    };

    loadFilterData();
  }, [toast]);

  const handleCardClick = (card: PokemonCard) => {
    console.log("Card clicked in PokemonDashboard:", card);
    console.log("Card wishlist_id:", (card as any).wishlist_id);
    setSelectedCard(card);
    setIsCardDetailOpen(true);
  };

  const handleAddToCollection = (card: PokemonCard) => {
    console.log("handleAddToCollection called with card:", card);
    console.log(
      "Card wishlist_id in handleAddToCollection:",
      (card as any).wishlist_id
    );
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para añadir cartas a tu colección.",
        variant: "destructive",
      });
      return;
    }

    // Asegurarse de que la carta tenga la propiedad wishlist_id si viene de la lista de deseos
    const cardWithWishlistId = {
      ...card,
      wishlist_id: (card as any).wishlist_id,
    };
    console.log("Setting selectedCard with wishlist_id:", cardWithWishlistId);
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
    console.log(
      "handleSaveToCollection called with cardData:",
      JSON.stringify(cardData)
    );
    if (!subscription) return;

    // Guardar el estado actual de la sección para poder volver a él después de actualizar
    const currentSection = activeSection;

    try {
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

      // Actualizar la interfaz
      await getCollections();
      setIsAddToCollectionOpen(false);
      toast({
        title: t("toasts.cardAdded"),
        description: t("collection.cardAdded"),
      });

      // Si la carta proviene de la lista de deseos (tiene wishlist_id), eliminarla de la lista de deseos
      console.log("Card data in handleSaveToCollection:", cardData);
      console.log("Wishlist ID:", cardData.card.wishlist_id);
      console.log("Card data type:", typeof cardData.card.wishlist_id);

      // Forzar la actualización de la lista de deseos después de añadir la carta a la colección
      // Esto se hace independientemente de si la carta tiene wishlist_id o no
      await fetchWishlist();

      if (cardData.card.wishlist_id) {
        try {
          console.log(
            "Deleting wishlist card with ID:",
            cardData.card.wishlist_id
          );
          const { error: removeError } = await supabase
            .from("wishlist_cards")
            .delete()
            .eq("id", cardData.card.wishlist_id);
          console.log("Delete result:", removeError ? "Error" : "Success");

          if (removeError) throw removeError;

          // Actualizar la lista de deseos en la interfaz
          console.log(
            "Updating wishlist cards, removing card with wishlist_id:",
            cardData.card.wishlist_id
          );
          console.log("Current wishlist cards:", wishlistCards);

          // Ya hemos actualizado la lista de deseos antes, pero actualizamos el estado local para una respuesta más rápida
          setWishlistCards((prev) => {
            const filtered = prev.filter(
              (c) => c.wishlist_id !== cardData.card.wishlist_id
            );
            console.log("Filtered wishlist cards:", filtered);
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

    try {
      // Obtener el conteo actual de colecciones
      const { count } = await supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      const currentCollectionCount = count || 0;

      // Validar límites
      const validation = validateSubscriptionLimits(
        subscription.plan_type,
        0, // No validamos cartas aquí
        currentCollectionCount + 1
      );

      if (!validation.valid) {
        setLimitError({
          message: validation.error || "",
          type: "collections",
        });
        setIsLimitModalOpen(true);
        return;
      }

      setEditingCollection(null);
      setIsCollectionDialogOpen(true);
    } catch (error) {
      console.error("Error validando límites de colección:", error);
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
        if (collectionData.isDefault) {
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
            is_default: collectionData.isDefault,
            updated_at: new Date().toISOString(),
          })
          .eq("id", collectionData.id);

        if (error) throw error;

        toast({
          title: t("collection.updated"),
          description: t("collection.saveSuccess", {
            name: collectionData.name,
          }),
        });
      } else {
        // Para nueva colección
        if (collectionData.isDefault) {
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
          is_default: collectionData.isDefault,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: t("collection.created"),
          description: t("collection.saveSuccess", {
            name: collectionData.name,
          }),
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
      console.log("Attempting to remove card:", cardId);
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

      if (updateError) throw updateError;

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
      await handleSaveToCollection({
        card,
        collectionId: defaultCollection.id,
        quantity: 1,
        condition: "Near Mint",
        isFoil: false,
        isFirstEdition: false,
        notes: "",
      });

      toast({
        title: t("toasts.cardAdded"),
        description: t("collection.cardAddedToDefault"),
      });

      // Si la carta proviene de la lista de deseos (tiene wishlist_id), eliminarla de la lista de deseos
      if (card.wishlist_id) {
        try {
          const { error: removeError } = await supabase
            .from("wishlist_cards")
            .delete()
            .eq("id", card.wishlist_id);

          if (removeError) throw removeError;

          // Actualizar la lista de deseos en la interfaz
          setWishlistCards((prev) =>
            prev.filter((c) => c.wishlist_id !== card.wishlist_id)
          );

          toast({
            title: t("wishlist.cardRemoved"),
            description: t("wishlist.removedAfterAdding"),
          });
        } catch (error) {
          console.error("Error removing card from wishlist:", error);
        }
      }
    } catch (error) {
      console.error("Error al añadir carta a la colección:", error);
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
        isDefault: true,
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
    setIsCollectionDialogOpen(true);
  };

  const calculateRange = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return `${start} - ${end} de ${totalCount} resultados`;
  };

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    if (!user) return;

    let collectionsChannel: RealtimeChannel;
    let cardsChannel: RealtimeChannel;

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
          async (payload) => {
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
          async (payload) => {
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
          }
        )
        .subscribe();
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
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

      if (collectionError) throw collectionError;
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
        throw new Error("Wishlist ID not found");
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
            setSelectedCollectionCard(card);
            setSelectedCard(card);
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

  const handleUpgradePlan = () => {
    setActiveSection("Pricing");
  };

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
      <CollectionDialog
        collection={editingCollection}
        isOpen={isCollectionDialogOpen}
        onClose={() => setIsCollectionDialogOpen(false)}
        onSave={handleSaveCollection}
        isDefault={collections.length === 0}
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
          currentPlan={subscription?.plan_type || "APRENDIZ"}
        />
      )}
      <SubscriptionLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        limitType={limitError.type}
        currentPlan={subscription?.plan_type || "APRENDIZ"}
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

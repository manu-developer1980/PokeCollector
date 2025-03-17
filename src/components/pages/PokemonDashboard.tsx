import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import SearchFilters from "../pokemon/SearchFilters";
import CardGrid from "../pokemon/CardGrid";
import CardDetail from "../pokemon/CardDetail";
import AddToCollectionDialog from "../pokemon/AddToCollectionDialog";
import CollectionList from "../pokemon/CollectionList";
import CollectionDetail from "../pokemon/CollectionDetail";
import CollectionDialog from "../pokemon/CollectionDialog";
import CardDetailDialog from "../pokemon/CardDetailDialog";
import OnboardingModal from "../onboarding/OnboardingModal";
import WishlistGrid from "../pokemon/WishlistGrid";
import {
  Collection,
  CollectionCard,
  PokemonCard,
  PokemonCardSearchParams,
} from "@/types/pokemon";
import {
  Database,
  Heart,
  Search,
  Grid3X3,
  Plus,
  Loader2,
  User,
} from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import SubscriptionPage from "../subscription/SubscriptionPage";
import MainHeader from "../layout/MainHeader";
import AccountPage from "./AccountPage";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";

interface PolarSubscription {
  status: string;
  polar_price_id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

const defaultNavItems = [
  { icon: <Search size={18} />, label: "Buscar Cartas", id: "Search Cards" },
  { icon: <Database size={18} />, label: "Colecciones", id: "My Collection" },
  { icon: <Heart size={18} />, label: "Lista de Deseos", id: "Wishlist" },
  { icon: <User size={18} />, label: "Mi Cuenta", id: "Account" },
];

const PokemonDashboard = () => {
  const location = useLocation();
  const initialSection = location.state?.activeSection || "My Collection";
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);

  // State for active tab/section
  const [activeSection, setActiveSection] = useState(initialSection);

  // Actualizar la sección activa cuando cambie el estado de la ubicación
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);

  // Collection state
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [selectedCollectionCard, setSelectedCollectionCard] = useState<CollectionCard | null>(null);
  const [isCardDetailDialogOpen, setIsCardDetailDialogOpen] = useState(false);

  // Filter data
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Realtime channel state
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Añadir nuevo estado para la lista de deseos
  const [wishlistCards, setWishlistCards] = useState<WishlistCardType[]>([]);

  // Estado para el modal de confirmación de borrado
  const [deleteConfirmationState, setDeleteConfirmationState] = useState({
    isOpen: false,
    collectionId: null as string | null,
    collectionName: "",
  });

  // Añadir el estado searchParams
  const [searchParams, setSearchParams] = useState<PokemonCardSearchParams>({
    q: "",
    page: 1,
    pageSize: 20,
    orderBy: "name",
  });

  // Añadir el manejador de cambios de searchParams
  const handleSearchParamsChange = (
    newParams: Partial<PokemonCardSearchParams>
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      ...newParams,
      page: 1, // Reset page when filters change
    }));
    handleSearch({
      ...searchParams,
      ...newParams,
      page: 1,
    });
  };

  // Load filter data on mount
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

  // Load collections on mount
  useEffect(() => {
    if (user) {
      getCollections();
    }
  }, [user]);

  const getCollections = async () => {
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
        title: "Error",
        description: "No se pudieron cargar las colecciones. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsCollectionLoading(false);
    }
  };

  const getCollectionCards = async (collectionId: string) => {
    try {
      const { data: cardsData, error: cardsError } = await supabase
        .from("collection_cards")
        .select(`
          id,
          card_id,
          quantity,
          condition,
          is_foil,
          is_first_edition,
          notes,
          date_added
        `)
        .eq("collection_id", collectionId);

      if (cardsError) throw cardsError;

      const cardsWithDetails = await Promise.all(
        cardsData.map(async (collectionCard) => {
          const cardData = await getCardById(collectionCard.card_id);
          return {
            ...collectionCard,
            name: cardData.name,
            images: cardData.images,
            set: cardData.set,
            rarity: cardData.rarity,
            types: cardData.types,
            number: cardData.number,
            cardmarket: cardData.cardmarket,
          };
        })
      );

      return cardsWithDetails;
    } catch (error) {
      console.error("Error fetching collection cards:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cartas de la colección",
        variant: "destructive",
      });
      return [];
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      // Solo mostramos el onboarding si el usuario no lo ha visto antes
      if (!data?.has_seen_onboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const handleSearch = async (params: PokemonCardSearchParams) => {
    setIsSearching(true);
    try {
      const response = await searchCards({
        ...params,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      });

      if (response.data) {
        setSearchResults(response.data);
        setTotalCount(response.totalCount || 0);
        setCurrentPage(response.page || 1);
      } else {
        setSearchResults([]);
        setTotalCount(0);
        setCurrentPage(1);
        toast({
          title: "No Results",
          description: "No cards found matching your search criteria.",
        });
      }
    } catch (error) {
      console.error("Error searching cards:", error);
      toast({
        title: "Error",
        description: "Failed to search cards. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
      setTotalCount(0);
      setCurrentPage(1);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
    setIsCardDetailOpen(true);
  };

  const handleAddToCollection = (card: PokemonCard) => {
    setSelectedCard(card);
    setIsAddToCollectionOpen(true);
    setIsCardDetailOpen(false); // Cerrar el modal de detalle
  };

  const handleAddToWishlist = async (card: PokemonCard) => {
    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description:
            "Debes iniciar sesión para añadir cartas a tu lista de deseos.",
          variant: "destructive",
        });
        return;
      }

      // Verificar duplicados usando single() con comillas
      const { data: existingCard, error: checkError } = await supabase
        .from("wishlist_cards")
        .select("*")
        .eq("user_id", user.id)
        .eq("card_id", card.id)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingCard) {
        toast({
          title: "Ya en Lista de Deseos",
          description: "Esta carta ya está en tu lista de deseos.",
        });
        return;
      }

      // Insertar nueva carta
      const { data, error } = await supabase
        .from("wishlist_cards")
        .insert({
          user_id: user.id,
          card_id: card.id,
        })
        .select()
        .single();

      if (error) throw error;

      const cardWithDetails = {
        ...card,
        wishlist_id: data.id,
        date_added: data.date_added,
      };

      setWishlistCards((prev) => [...prev, cardWithDetails]);

      setIsCardDetailOpen(false); // Cerrar el modal de detalle
      toast({
        title: "Añadido a Lista de Deseos",
        description: `${card.name} ha sido añadido a tu lista de deseos.`,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir la carta a la lista de deseos.",
        variant: "destructive",
      });
    }
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
    try {
      // Primero insertamos la carta en la colección
      const { data: insertedCard, error } = await supabase
        .from("collection_cards")
        .insert({
          card_id: cardData.card.id,
          collection_id: cardData.collectionId,
          quantity: cardData.quantity,
          condition: cardData.condition,
          is_foil: cardData.isFoil,
          is_first_edition: cardData.isFirstEdition,
          notes: cardData.notes,
          date_added: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Crear el objeto de carta completo con los detalles de Pokemon
      const newCard = {
        ...insertedCard,
        name: cardData.card.name,
        images: cardData.card.images,
        set: cardData.card.set,
      };

      // Actualizar el estado local de collections
      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (collection.id === cardData.collectionId) {
            return {
              ...collection,
              cards: [...collection.cards, newCard],
            };
          }
          return collection;
        })
      );

      // Actualizar selectedCollection si es la colección actual
      if (selectedCollection?.id === cardData.collectionId) {
        setSelectedCollection((prev) => ({
          ...prev!,
          cards: [...prev!.cards, newCard],
        }));
      }

      // Verificar y eliminar de la lista de deseos si es necesario
      const { data: wishlistCard, error: wishlistError } = await supabase
        .from("wishlist_cards")
        .select("id")
        .eq("user_id", user?.id)
        .eq("card_id", cardData.card.id)
        .maybeSingle();

      if (wishlistError) {
        console.error("Error checking wishlist:", wishlistError);
      } else if (wishlistCard) {
        await supabase
          .from("wishlist_cards")
          .delete()
          .eq("id", wishlistCard.id);

        setWishlistCards((prev) =>
          prev.filter((card) => card.id !== cardData.card.id)
        );
      }

      setIsAddToCollectionOpen(false);
      toast({
        title: "Carta Añadida",
        description: "La carta ha sido añadida a tu colección.",
      });
    } catch (error) {
      console.error("Error al añadir carta a la colección:", error);
      toast({
        title: "Error",
        description:
          "No se pudo añadir la carta a la colección. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setIsCollectionDialogOpen(true);
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
          title: "Colección Actualizada",
          description: `La colección "${collectionData.name}" ha sido actualizada.`,
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
          title: "Colección Creada",
          description: `La colección "${collectionData.name}" ha sido creada.`,
        });
      }

      // Actualizar el estado local
      await getCollections(); // Cambiamos fetchCollections por getCollections

      // Cerrar el diálogo
      setIsCollectionDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving collection:", error);
      toast({
        title: "Error",
        description:
          "No se pudo guardar la colección. Por favor, intenta de nuevo.",
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
        title: "Colección Eliminada",
        description: "La colección ha sido eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la colección. Por favor, intenta de nuevo.",
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

      // Actualizar el estado local inmediatamente
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

      // Actualizar selectedCollection también
      setSelectedCollection((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.filter((card) => card.id !== cardId),
        };
      });

      setIsCardDetailDialogOpen(false);

      toast({
        title: "Carta Eliminada",
        description: "La carta ha sido eliminada de tu colección.",
      });
    } catch (error) {
      console.error("Error removing card:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la carta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCard = async (cardData: {
    id: string;
    quantity: number;
    condition?: string;
    isFoil?: boolean;
    isFirstEdition?: boolean;
    notes?: string;
  }) => {
    if (!selectedCollection) return;

    try {
      console.log("Received card data for update:", cardData);

      // 1. Actualizar en Supabase
      const updateData = {
        quantity: cardData.quantity,
        condition: cardData.condition,
        is_foil: cardData.isFoil,
        is_first_edition: cardData.isFirstEdition,
        notes: cardData.notes,
      };

      console.log("Sending to Supabase:", updateData);

      const { data: updatedCard, error } = await supabase
        .from("collection_cards")
        .update(updateData)
        .eq("id", cardData.id)
        .select("*")
        .single();

      if (error) throw error;

      console.log("Response from Supabase:", updatedCard);

      // 2. Actualizar el estado local con los datos exactos de Supabase
      const updatedCardData = {
        ...updatedCard,
        isFoil: updatedCard.is_foil,
        isFirstEdition: updatedCard.is_first_edition,
      };

      // 3. Actualizar collections de manera inmutable
      setCollections((prevCollections) => {
        const newCollections = prevCollections.map((collection) => {
          if (collection.id === selectedCollection.id) {
            return {
              ...collection,
              cards: collection.cards.map((card) =>
                card.id === cardData.id ? { ...card, ...updatedCardData } : card
              ),
            };
          }
          return collection;
        });
        console.log("Updated collections:", newCollections);
        return newCollections;
      });

      // 4. Actualizar selectedCollection si es necesario
      if (selectedCollection) {
        setSelectedCollection((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            cards: prev.cards.map((card) =>
              card.id === cardData.id ? { ...card, ...updatedCardData } : card
            ),
          };
        });
      }

      // 5. Actualizar selectedCollectionCard
      setSelectedCollectionCard((prev) =>
        prev?.id === cardData.id ? { ...prev, ...updatedCardData } : prev
      );

      toast({
        title: "Carta Actualizada",
        description: "La carta ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar la carta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAddToCollection = async (card: PokemonCard) => {
    // Encontrar la colección por defecto
    const defaultCollection = collections.find((c) => c.is_default);

    if (!defaultCollection) {
      toast({
        title: "Error",
        description:
          "No se encontró la colección por defecto. Por favor, crea una colección primero.",
        variant: "destructive",
      });
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
        title: "Carta Añadida",
        description: "La carta ha sido añadida a tu colección por defecto.",
      });
    } catch (error) {
      console.error("Error al añadir carta a la colección:", error);
      toast({
        title: "Error",
        description:
          "No se pudo añadir la carta a la colección. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const calculateRange = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return `${start} - ${end} de ${totalCount} resultados`;
  };

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    if (!user) return;

    // Suscripción para cambios en las colecciones
    const collectionsChannel = supabase
      .channel('collections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Collections realtime event received:', payload);

          switch (payload.eventType) {
            case 'UPDATE': {
              const updatedCollection = payload.new as Collection;
              setCollections((prevCollections) =>
                prevCollections.map((collection) =>
                  collection.id === updatedCollection.id
                    ? { ...collection, ...updatedCollection }
                    : collection
                )
              );

              // Actualizar también selectedCollection si es necesario
              if (selectedCollection?.id === updatedCollection.id) {
                setSelectedCollection((prev) =>
                  prev ? { ...prev, ...updatedCollection } : prev
                );
              }
              break;
            }
            case 'INSERT': {
              const newCollection = payload.new as Collection;
              setCollections((prev) => [...prev, { ...newCollection, cards: [] }]);
              break;
            }
            case 'DELETE': {
              const deletedCollection = payload.old as Collection;
              setCollections((prev) =>
                prev.filter((collection) => collection.id !== deletedCollection.id)
              );
              if (selectedCollection?.id === deletedCollection.id) {
                setSelectedCollection(null);
              }
              break;
            }
          }
        }
      )
      .subscribe();

    // Suscripción existente para collection_cards
    const cardsChannel = selectedCollection
      ? supabase
          .channel(`collection-${selectedCollection.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'collection_cards',
              filter: `collection_id=eq.${selectedCollection.id}`,
            },
            async (payload) => {
              // ... código existente para collection_cards ...
            }
          )
          .subscribe()
      : null;

    // Cleanup
    return () => {
      collectionsChannel.unsubscribe();
      if (cardsChannel) {
        cardsChannel.unsubscribe();
      }
    };
  }, [user, selectedCollection?.id]); // Dependencias actualizadas

  // Añadir función para cargar la lista de deseos
  const fetchWishlist = async () => {
    try {
      // Obtener las cartas de la lista de deseos
      const { data: wishlistData, error } = await supabase
        .from("wishlist_cards")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      console.log("Wishlist data from DB:", wishlistData); // Para debugging

      // Obtener detalles de las cartas
      const cardsWithDetails = await Promise.all(
        (wishlistData || []).map(async (item) => {
          try {
            const cardDetails = await getCardById(item.card_id);
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

      // Filtrar cualquier carta null (en caso de error) y actualizar el estado
      const validCards = cardsWithDetails.filter((card) => card !== null);
      console.log("Cards with details:", validCards); // Para debugging

      setWishlistCards(validCards);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de deseos.",
        variant: "destructive",
      });
    }
  };

  // Asegurarnos de que fetchWishlist se llama cuando se cambia a la pestaña de Lista de Deseos
  useEffect(() => {
    if (activeSection === "Wishlist" && user) {
      fetchWishlist();
    }
  }, [activeSection, user]);

  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select(
            "status, polar_price_id, current_period_end, cancel_at_period_end"
          )
          .eq("user_id", user?.id)
          .maybeSingle();

        if (error) throw error;

        // Si no hay datos o la suscripción no está activa, el usuario es free
        if (!data || data.status !== "active") {
          setSubscriptionStatus("free");
          return;
        }

        // Verificar si la suscripción ha expirado
        const hasExpired =
          data.current_period_end && Date.now() > data.current_period_end;

        setSubscriptionStatus(hasExpired ? "free" : "premium");
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscriptionStatus("free");
      }
    };

    if (user) {
      fetchSubscriptionInfo();
    }
  }, [user]);

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
        title: "Carta Eliminada",
        description: "La carta ha sido eliminada de tu lista de deseos.",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la carta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Search Cards":
        return (
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
            />
            <CardGrid
              cards={searchResults}
              onCardClick={handleCardClick}
              onQuickAdd={handleQuickAddToCollection}
              onAddToWishlist={handleAddToWishlist}
              isLoading={isSearching}
              actions="search"
            />
          </>
        );
      case "My Collection":
        return (
          <div className="space-y-6">
            {selectedCollection ? (
              <CollectionDetail
                collection={selectedCollection}
                onBack={() => setSelectedCollection(null)}
                onEditCollection={handleEditCollection}
                onRemoveCard={handleRemoveCard}
                onCardClick={(card) => {
                  setSelectedCollectionCard(card);
                  setIsCardDetailDialogOpen(true);
                }}
                isLoading={isCollectionLoading}
              />
            ) : (
              <CollectionList
                collections={collections}
                selectedCollection={selectedCollection}
                onCollectionSelect={setSelectedCollection}
                onCreateCollection={handleCreateCollection}
                onEditCollection={handleEditCollection}
                onDeleteCollection={handleDeleteCollection}
                isLoading={isCollectionLoading}
              />
            )}
          </div>
        );
      case "Wishlist":
        return (
          <div className="space-y-6">
            <WishlistGrid
              cards={wishlistCards}
              onCardClick={(card) => {
                setSelectedCard(card);
                setIsCardDetailOpen(true);
              }}
              onRemove={handleRemoveFromWishlist}
              onQuickAdd={handleQuickAddToCollection}
            />
          </div>
        );
      case "Account":
        return <AccountPage />;
      case "subscription":
        return <SubscriptionPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainHeader showNavigation={false} />
      <div className="flex">
        <Sidebar
          items={defaultNavItems}
          activeItem={activeSection}
          onItemClick={(item) => setActiveSection(item)}
          subscriptionTier={
            subscriptionStatus === "premium" ? "Premium" : "Free"
          }
        />

        <main className="flex-1 md:ml-64 p-6 pt-24">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeSection === "Search Cards" && "Buscar Cartas Pokémon"}
              {activeSection === "My Collection" && "Mi Colección de Pokémon"}
              {activeSection === "Wishlist" && "Mi Lista de Deseos"}
              {activeSection === "Account" && "Mi Cuenta"}
            </h1>
            <p className="text-gray-600">
              {activeSection === "Search Cards" &&
                "Busca y explora miles de cartas Pokémon"}
              {activeSection === "My Collection" &&
                "Gestiona tu colección de cartas Pokémon"}
              {activeSection === "Wishlist" &&
                "Cartas que deseas añadir a tu colección"}
              {activeSection === "Account" &&
                "Gestiona tu información personal y configuración"}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>

      {/* Dialogs */}
      <CardDetail
        card={selectedCard}
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        onAddToCollection={handleAddToCollection}
        onAddToWishlist={handleAddToWishlist}
        onRemoveFromWishlist={(card) => {
          // Pasamos la carta completa en lugar de solo el ID
          if (card) {
            handleRemoveFromWishlist(card);
          }
        }}
        mode={
          activeSection === "Wishlist"
            ? "wishlist"
            : activeSection === "My Collection"
            ? "collection"
            : "search"
        }
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

      <CardDetail
        card={selectedCollectionCard}
        isOpen={isCardDetailDialogOpen}
        onClose={() => setIsCardDetailDialogOpen(false)}
        onUpdate={handleUpdateCard}
        onRemove={handleRemoveCard}
        mode="collection"
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <Toaster />
      <DeleteConfirmationDialog
        isOpen={deleteConfirmationState.isOpen}
        onClose={() =>
          setDeleteConfirmationState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmDelete}
        title="Eliminar Colección"
        description={`¿Estás seguro de que deseas eliminar la colección "${deleteConfirmationState.collectionName}"? Esta acción no se puede deshacer y se eliminarán todas las cartas asociadas.`}
      />
    </div>
  );
};

export default PokemonDashboard;

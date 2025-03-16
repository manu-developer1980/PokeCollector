import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { getPokemonCard } from "@/lib/pokemon-api";
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
import { searchCards, getSets, getTypes, getRarities } from "@/lib/api";
import { Database, Heart, Search, Grid3X3, Plus, Loader2 } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import SubscriptionPage from "../subscription/SubscriptionPage";
import MainHeader from "../layout/MainHeader";

interface PolarSubscription {
  status: string;
  polar_price_id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

const defaultNavItems = [
  { icon: <Search size={18} />, label: "Buscar Cartas", id: "Search Cards" },
  { icon: <Database size={18} />, label: "Mi Colección", id: "My Collection" },
  { icon: <Heart size={18} />, label: "Lista de Deseos", id: "Wishlist" },
];

const PokemonDashboard = () => {
  const location = useLocation();
  const initialSection = location.state?.activeSection || "My Collection";
  const { user } = useAuth();
  const { toast } = useToast();

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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [selectedCollectionCard, setSelectedCollectionCard] =
    useState<CollectionCard | null>(null);
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
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  // Añadir nuevo estado para la lista de deseos
  const [wishlistCards, setWishlistCards] = useState<WishlistCardType[]>([]);

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
      fetchCollections();
      checkOnboardingStatus();
    }
  }, [user]);

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

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      // Para cada colección, obtener sus cartas y la información de la API de Pokemon
      const collectionsWithCards = await Promise.all(
        data.map(async (collection) => {
          const { data: cardsData, error: cardsError } = await supabase
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
              date_added
            `
            )
            .eq("collection_id", collection.id);

          if (cardsError) throw cardsError;

          // Aquí deberías hacer una llamada a la API de Pokemon TCG para obtener los detalles de cada carta
          const cardsWithDetails = await Promise.all(
            (cardsData || []).map(async (card) => {
              try {
                // Asume que tienes una función para obtener los detalles de la carta de la API de Pokemon
                const pokemonCard = await getPokemonCard(card.card_id);
                return {
                  ...card,
                  name: pokemonCard.name,
                  images: pokemonCard.images,
                  set: pokemonCard.set?.name,
                };
              } catch (error) {
                console.error(
                  `Error fetching card details for ${card.card_id}:`,
                  error
                );
                return card;
              }
            })
          );

          return {
            ...collection,
            cards: cardsWithDetails,
          };
        })
      );

      setCollections(collectionsWithCards);

      if (collectionsWithCards.length === 0) {
        createDefaultCollection();
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to load your collections. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createDefaultCollection = async () => {
    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name: "Mi Colección",
          description: "Mi colección de cartas Pokémon",
          user_id: user?.id,
          is_default: true,
        })
        .select();

      if (error) throw error;

      setCollections([{ ...data[0], cards: [] }]);
    } catch (error) {
      console.error("Error al crear colección por defecto:", error);
      toast({
        title: "Error",
        description:
          "No se pudo crear la colección por defecto. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
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
        // Update existing collection
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
          title: "Collection Updated",
          description: `${collectionData.name} has been updated.`,
        });
      } else {
        // Create new collection
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
          title: "Collection Created",
          description: `${collectionData.name} has been created.`,
        });
      }

      // Refresh collections
      fetchCollections();
    } catch (error) {
      console.error("Error saving collection:", error);
      toast({
        title: "Error",
        description: "Failed to save collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      // First delete all cards in the collection
      const { error: cardsError } = await supabase
        .from("collection_cards")
        .delete()
        .eq("collection_id", collectionId);

      if (cardsError) throw cardsError;

      // Then delete the collection
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;

      toast({
        title: "Colección Eliminada",
        description: "La colección ha sido eliminada correctamente.",
      });

      // Refresh collections
      fetchCollections();
      setSelectedCollection(null);
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la colección. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
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

  // Función para obtener las cartas de una colección específica
  const fetchCollectionCards = async (collectionId: string) => {
    const { data: cardsData, error: cardsError } = await supabase
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
        date_added
      `
      )
      .eq("collection_id", collectionId);

    if (cardsError) {
      console.error("Error fetching cards:", cardsError);
      return [];
    }

    // Obtener detalles de las cartas
    const cardsWithDetails = await Promise.all(
      (cardsData || []).map(async (card) => {
        try {
          const pokemonCard = await getPokemonCard(card.card_id);
          return {
            ...card,
            name: pokemonCard.name,
            images: pokemonCard.images,
            set: pokemonCard.set?.name,
          };
        } catch (error) {
          console.error(
            `Error fetching card details for ${card.card_id}:`,
            error
          );
          return card;
        }
      })
    );

    return cardsWithDetails;
  };

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    if (!user || !selectedCollection) return;

    const channel = supabase
      .channel(`collection-${selectedCollection.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchar todos los eventos
          schema: "public",
          table: "collection_cards",
          filter: `collection_id=eq.${selectedCollection.id}`,
        },
        async (payload) => {
          console.log("Realtime event received:", payload);

          try {
            switch (payload.eventType) {
              case "INSERT": {
                const newCard = payload.new as any;
                const pokemonCard = await getPokemonCard(newCard.card_id);
                const fullNewCard = {
                  ...newCard,
                  name: pokemonCard.name,
                  images: pokemonCard.images,
                  set: pokemonCard.set?.name,
                };

                setCollections((prevCollections) =>
                  prevCollections.map((collection) => {
                    if (collection.id === selectedCollection.id) {
                      return {
                        ...collection,
                        cards: [...collection.cards, fullNewCard],
                      };
                    }
                    return collection;
                  })
                );
                break;
              }

              case "UPDATE": {
                const updatedCard = payload.new as any;
                const pokemonCard = await getPokemonCard(updatedCard.card_id);
                const fullUpdatedCard = {
                  ...updatedCard,
                  name: pokemonCard.name,
                  images: pokemonCard.images,
                  set: pokemonCard.set?.name,
                };

                setCollections((prevCollections) =>
                  prevCollections.map((collection) => {
                    if (collection.id === selectedCollection.id) {
                      return {
                        ...collection,
                        cards: collection.cards.map((card) =>
                          card.id === updatedCard.id ? fullUpdatedCard : card
                        ),
                      };
                    }
                    return collection;
                  })
                );
                break;
              }

              case "DELETE": {
                const deletedCard = payload.old as any;
                setCollections((prevCollections) =>
                  prevCollections.map((collection) => {
                    if (collection.id === selectedCollection.id) {
                      return {
                        ...collection,
                        cards: collection.cards.filter(
                          (card) => card.id !== deletedCard.id
                        ),
                      };
                    }
                    return collection;
                  })
                );
                break;
              }
            }
          } catch (error) {
            console.error("Error handling realtime update:", error);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when selectedCollection changes
    return () => {
      console.log("Unsubscribing from realtime channel");
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedCollection?.id]); // Dependencias actualizadas

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
            const cardDetails = await getPokemonCard(item.card_id);
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

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_cards")
        .delete()
        .eq("id", wishlistId);

      if (error) throw error;

      setWishlistCards((prev) =>
        prev.filter((card) => card.wishlist_id !== wishlistId)
      );

      toast({
        title: "Carta Eliminada",
        description: "La carta ha sido eliminada de tu lista de deseos.",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la carta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Search Cards":
        return <SearchSection /* ... props ... */ />;
      case "My Collection":
        return <CollectionSection /* ... props ... */ />;
      case "Wishlist":
        return <WishlistSection /* ... props ... */ />;
      case "subscription":
        return <SubscriptionPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

        <main className="flex-1 md:ml-64 p-6 pt-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeSection === "Search Cards" && "Buscar Cartas Pokémon"}
              {activeSection === "My Collection" && "Mi Colección de Pokémon"}
              {activeSection === "Wishlist" && "Mi Lista de Deseos"}
            </h1>
            <p className="text-gray-600">
              {activeSection === "Search Cards" &&
                "Busca y explora miles de cartas Pokémon"}
              {activeSection === "My Collection" &&
                "Gestiona tu colección de cartas Pokémon"}
              {activeSection === "Wishlist" &&
                "Cartas que deseas añadir a tu colección"}
            </p>
          </div>

          {activeSection === "Search Cards" && (
            <div className="space-y-6">
              <SearchFilters
                onSearch={handleSearch}
                isLoading={isSearching}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onQuickAdd={handleQuickAddToCollection}
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
                    onQuickAdd={handleQuickAddToCollection}
                    onAddToWishlist={handleAddToWishlist}
                    actions="search"
                  />
                )}
              </SearchFilters>
            </div>
          )}

          {activeSection === "My Collection" && (
            <div>
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
                />
              ) : (
                <CollectionList
                  collections={collections}
                  onSelectCollection={setSelectedCollection}
                  onCreateCollection={handleCreateCollection}
                  onEditCollection={handleEditCollection}
                  onDeleteCollection={handleDeleteCollection}
                />
              )}
            </div>
          )}

          {activeSection === "Wishlist" && (
            <div>
              {wishlistCards.length > 0 ? (
                <WishlistGrid
                  cards={wishlistCards}
                  onCardClick={(card) => {
                    setSelectedCard(card);
                    setIsCardDetailOpen(true);
                  }}
                  onRemoveFromWishlist={(card) => {
                    if (card.wishlist_id) {
                      handleRemoveFromWishlist(card.wishlist_id);
                    }
                  }}
                  onAddToCollection={handleAddToCollection}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                  <Heart className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    Tu Lista de Deseos está Vacía
                  </h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    Añade cartas a tu lista de deseos mientras exploras el
                    catálogo.
                  </p>
                  <Button
                    onClick={() => setActiveSection("Search Cards")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Cartas
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <CardDetail
        card={selectedCard}
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        onAddToCollection={handleAddToCollection}
        onAddToWishlist={handleAddToWishlist}
        onRemoveFromWishlist={(cardId) => {
          const card = wishlistCards.find((c) => c.id === cardId);
          if (card && card.wishlist_id) {
            handleRemoveFromWishlist(card.wishlist_id);
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

      <CardDetailDialog
        card={selectedCollectionCard}
        isOpen={isCardDetailDialogOpen}
        onClose={() => setIsCardDetailDialogOpen(false)}
        onUpdate={handleUpdateCard}
        onRemove={handleRemoveCard}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <Toaster />
    </div>
  );
};

export default PokemonDashboard;

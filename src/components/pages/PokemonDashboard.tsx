import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
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
import {
  Collection,
  CollectionCard,
  PokemonCard,
  PokemonCardSearchParams,
} from "@/types/pokemon";
import { searchCards, getSets, getTypes, getRarities } from "@/lib/api";
import { Database, Heart, Search, Grid3X3, Plus, Loader2 } from "lucide-react";

const defaultNavItems = [
  { icon: <Search size={18} />, label: "Search Cards" },
  { icon: <Database size={18} />, label: "My Collection", isActive: true },
  { icon: <Heart size={18} />, label: "Wishlist" },
];

const PokemonDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for active tab/section
  const [activeSection, setActiveSection] = useState("My Collection");

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

  // Load filter data on mount
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [setsData, typesData, raritiesData] = await Promise.all([
          getSets(),
          getTypes(),
          getRarities(),
        ]);

        setSets(setsData.map((set) => ({ id: set.id, name: set.name })));
        setTypes(typesData);
        setRarities(raritiesData);
      } catch (error) {
        console.error("Error loading filter data:", error);
        toast({
          title: "Error",
          description: "Failed to load filter data. Please try again.",
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

      // If user has not seen onboarding or the field doesn't exist, show onboarding
      if (!data || data.has_seen_onboarding !== true) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // Default to showing onboarding if there's an error
      setShowOnboarding(true);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      // For each collection, fetch its cards
      const collectionsWithCards = await Promise.all(
        data.map(async (collection) => {
          const { data: cardsData, error: cardsError } = await supabase
            .from("collection_cards")
            .select("*")
            .eq("collection_id", collection.id);

          if (cardsError) throw cardsError;

          // This is a simplified version - in a real app, you'd fetch the actual card data
          // from your database or the Pokemon TCG API
          return {
            ...collection,
            cards: cardsData || [],
          };
        })
      );

      setCollections(collectionsWithCards);

      // If no collections exist, create a default one
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
          name: "My Collection",
          description: "My default Pokemon card collection",
          user_id: user?.id,
          is_default: true,
        })
        .select();

      if (error) throw error;

      setCollections([{ ...data[0], cards: [] }]);
    } catch (error) {
      console.error("Error creating default collection:", error);
      toast({
        title: "Error",
        description: "Failed to create default collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (params: PokemonCardSearchParams) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/pokemon/cards?${new URLSearchParams(params as any)}`
      );
      const data = await response.json();
      setSearchResults(data.data);
      setTotalCount(data.totalCount);
      setCurrentPage(params.page || 1);
    } catch (error) {
      console.error("Error searching cards:", error);
      toast({
        title: "Error",
        description: "Failed to search cards. Please try again.",
        variant: "destructive",
      });
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

  const handleAddToWishlist = (card: PokemonCard) => {
    // Implement wishlist functionality
    toast({
      title: "Added to Wishlist",
      description: `${card.name} has been added to your wishlist.`,
    });
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
      const { data, error } = await supabase.from("collection_cards").insert({
        card_id: cardData.card.id,
        collection_id: cardData.collectionId,
        quantity: cardData.quantity,
        condition: cardData.condition,
        is_foil: cardData.isFoil,
        is_first_edition: cardData.isFirstEdition,
        notes: cardData.notes,
        date_added: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Card Added",
        description: `${cardData.card.name} has been added to your collection.`,
      });

      // Refresh collections
      fetchCollections();
    } catch (error) {
      console.error("Error adding card to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add card to collection. Please try again.",
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
        title: "Collection Deleted",
        description: "The collection has been deleted.",
      });

      // Refresh collections
      fetchCollections();
      setSelectedCollection(null);
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
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
        .eq("card_id", cardId)
        .eq("collection_id", selectedCollection.id);

      if (error) throw error;

      toast({
        title: "Card Removed",
        description: "The card has been removed from your collection.",
      });

      // Refresh collections
      fetchCollections();
      setIsCardDetailDialogOpen(false);
    } catch (error) {
      console.error("Error removing card:", error);
      toast({
        title: "Error",
        description: "Failed to remove card. Please try again.",
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
      const { error } = await supabase
        .from("collection_cards")
        .update({
          quantity: cardData.quantity,
          condition: cardData.condition,
          is_foil: cardData.isFoil,
          is_first_edition: cardData.isFirstEdition,
          notes: cardData.notes,
        })
        .eq("card_id", cardData.id)
        .eq("collection_id", selectedCollection.id);

      if (error) throw error;

      toast({
        title: "Card Updated",
        description: "The card has been updated in your collection.",
      });

      // Refresh collections
      fetchCollections();
      setIsCardDetailDialogOpen(false);
    } catch (error) {
      console.error("Error updating card:", error);
      toast({
        title: "Error",
        description: "Failed to update card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAddToCollection = async (card: PokemonCard) => {
    const defaultCollection = collections.find((c) => c.isDefault);
    if (!defaultCollection) {
      toast({
        title: "Error",
        description:
          "Default collection not found. Please create a collection first.",
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
        title: "Card Added",
        description: `${card.name} has been added to your default collection.`,
      });
    } catch (error) {
      console.error("Error adding card to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add card to collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <div className="flex pt-16">
        <Sidebar
          items={defaultNavItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeSection === "Search Cards" && "Search Pokémon Cards"}
              {activeSection === "My Collection" && "My Pokémon Collection"}
              {activeSection === "Wishlist" && "My Wishlist"}
            </h1>
            <p className="text-gray-600">
              {activeSection === "Search Cards" &&
                "Search and browse through thousands of Pokémon cards"}
              {activeSection === "My Collection" &&
                "Manage your Pokémon card collection"}
              {activeSection === "Wishlist" &&
                "Cards you want to add to your collection"}
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
                onAddToCollection={handleQuickAddToCollection}
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
                    onAddToCollection={handleQuickAddToCollection}
                    onAddToWishlist={handleAddToWishlist}
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
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
              <Heart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Wishlist Coming Soon
              </h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                We're working on the wishlist feature. Soon you'll be able to
                keep track of cards you want to add to your collection.
              </p>
              <Button
                onClick={() => setActiveSection("Search Cards")}
                className="bg-red-600 hover:bg-red-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Cards
              </Button>
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

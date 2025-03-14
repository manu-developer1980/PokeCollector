import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import CollectionList from "../pokemon/CollectionList";
import CollectionDetail from "../pokemon/CollectionDetail";
import CollectionDialog from "../pokemon/CollectionDialog";
import CardDetailDialog from "../pokemon/CardDetailDialog";
import { Collection, CollectionCard } from "@/types/pokemon";
import { Database, Heart, Search } from "lucide-react";

const defaultNavItems = [
  { icon: <Search size={18} />, label: "Buscar Cartas", id: "Search Cards" },
  { icon: <Database size={18} />, label: "Mi Colección", id: "My Collection" },
  { icon: <Heart size={18} />, label: "Lista de Deseos", id: "Wishlist" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

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
          name: "Mi Colección",
          description: "Mi colección de cartas Pokémon",
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
        description:
          "No se pudo crear la colección por defecto. Por favor, intenta de nuevo.",
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
          title: "Colección Actualizada",
          description: `${collectionData.name} ha sido actualizada.`,
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
          title: "Colección Creada",
          description: `${collectionData.name} ha sido creada.`,
        });
      }

      fetchCollections();
    } catch (error) {
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
    try {
      const { error: cardsError } = await supabase
        .from("collection_cards")
        .delete()
        .eq("collection_id", collectionId);

      if (cardsError) throw cardsError;

      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;

      toast({
        title: "Colección Eliminada",
        description: "La colección ha sido eliminada.",
      });

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
        .eq("card_id", cardId)
        .eq("collection_id", selectedCollection.id);

      if (error) throw error;

      toast({
        title: "Carta Eliminada",
        description: "La carta ha sido eliminada de tu colección.",
      });

      fetchCollections();
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

  const handleUpdateCard = async (
    cardId: string,
    updates: Partial<CollectionCard>
  ) => {
    if (!selectedCollection) return;

    try {
      const { error } = await supabase
        .from("collection_cards")
        .update(updates)
        .eq("card_id", cardId)
        .eq("collection_id", selectedCollection.id);

      if (error) throw error;

      toast({
        title: "Carta Actualizada",
        description: "La carta ha sido actualizada.",
      });

      fetchCollections();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <div className="flex pt-16">
        <Sidebar
          items={defaultNavItems}
          activeItem="My Collection"
          onItemClick={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Mi Colección de Pokémon
            </h1>
            <p className="text-gray-600">
              Gestiona tu colección de cartas Pokémon
            </p>
          </div>

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
        </main>
      </div>

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

      <Toaster />
    </div>
  );
};

export default Dashboard;

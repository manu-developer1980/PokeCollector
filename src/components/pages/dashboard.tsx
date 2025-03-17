import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import Sidebar from "../dashboard/layout/Sidebar";
import CollectionList from "../pokemon/CollectionList";
import CollectionDetail from "../pokemon/CollectionDetail";
import CollectionDialog from "../pokemon/CollectionDialog";
import CardDetail from "../pokemon/CardDetail";
import { Collection, CollectionCard } from "@/types/pokemon";
import { Database, Heart, Search } from "lucide-react";
import MainHeader from "../layout/MainHeader";

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

  const handleSaveCollection = async (collectionData: {
    id?: string;
    name: string;
    description?: string;
    isDefault: boolean;
  }) => {
    try {
      const { id, name, description, isDefault } = collectionData;

      // Si la nueva colección será predeterminada, primero quitamos el estado predeterminado de otras colecciones
      if (isDefault) {
        const { error: updateError } = await supabase
          .from("collections")
          .update({ is_default: false })
          .eq("user_id", user?.id)
          .eq("is_default", true);

        if (updateError) throw updateError;
      }

      if (id) {
        // Actualizar colección existente
        const { data, error } = await supabase
          .from("collections")
          .update({
            name,
            description,
            is_default: isDefault,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select();

        if (error) throw error;

        setCollections(
          collections.map((c) => (c.id === id ? { ...c, ...data[0] } : c))
        );
      } else {
        // Crear nueva colección
        const { data, error } = await supabase
          .from("collections")
          .insert({
            name,
            description,
            user_id: user?.id,
            is_default: isDefault,
          })
          .select();

        if (error) throw error;

        setCollections([...collections, { ...data[0], cards: [] }]);
      }

      toast({
        title: id ? "Colección actualizada" : "Colección creada",
        description: `La colección "${name}" ha sido ${
          id ? "actualizada" : "creada"
        } exitosamente.`,
      });

      setIsCollectionDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving collection:", error);

      // Mensaje de error específico para violación de restricción única
      if (error.code === "23P01") {
        toast({
          title: "Error",
          description:
            "Ya existe una colección predeterminada. Por favor, desmarca la colección predeterminada actual antes de establecer otra.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description:
            "No se pudo guardar la colección. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
      }
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
        .eq("id", cardId) // Cambiado de card_id a id
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
    <div className="min-h-screen bg-background">
      <MainHeader />

      <div className="flex min-h-screen">
        <Sidebar
          items={defaultNavItems}
          activeItem="My Collection"
          onItemClick={() => {}}
        />

        <main className="flex-1 w-full p-6 pt-16 bg-background">
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

      <CardDetail
        card={selectedCollectionCard}
        isOpen={isCardDetailDialogOpen}
        onClose={() => setIsCardDetailDialogOpen(false)}
        onUpdate={handleUpdateCard}
        onRemove={handleRemoveCard}
        mode="collection"
      />

      <Toaster />
    </div>
  );
};

export default Dashboard;

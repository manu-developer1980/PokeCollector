-- PARTE 1: ELIMINAR TODO LO EXISTENTE
-- Eliminar políticas
DO $$ 
BEGIN
    -- Collections
    DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
    DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
    DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
    DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;

    -- Collection cards
    DROP POLICY IF EXISTS "Users can view their own collection cards" ON collection_cards;
    DROP POLICY IF EXISTS "Users can insert cards into their own collections" ON collection_cards;
    DROP POLICY IF EXISTS "Users can update cards in their own collections" ON collection_cards;
    DROP POLICY IF EXISTS "Users can delete cards from their own collections" ON collection_cards;

    -- Wishlists
    DROP POLICY IF EXISTS "Users can view their own wishlists" ON wishlists;
    DROP POLICY IF EXISTS "Users can insert their own wishlists" ON wishlists;
    DROP POLICY IF EXISTS "Users can update their own wishlists" ON wishlists;
    DROP POLICY IF EXISTS "Users can delete their own wishlists" ON wishlists;

    -- Wishlist cards
    DROP POLICY IF EXISTS "Users can view their own wishlist cards" ON wishlist_cards;
    DROP POLICY IF EXISTS "Users can insert their own wishlist cards" ON wishlist_cards;
    DROP POLICY IF EXISTS "Users can update their own wishlist cards" ON wishlist_cards;
    DROP POLICY IF EXISTS "Users can delete their own wishlist cards" ON wishlist_cards;
END $$;

-- Eliminar triggers y funciones
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
DROP TRIGGER IF EXISTS update_wishlists_updated_at ON wishlists;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar índices existentes
DROP INDEX IF EXISTS idx_wishlist_cards_user_id;
DROP INDEX IF EXISTS idx_collection_cards_card_id;
DROP INDEX IF EXISTS idx_collection_cards_collection_id;

-- Eliminar restricciones
ALTER TABLE wishlist_cards DROP CONSTRAINT IF EXISTS unique_user_card;

-- PARTE 2: CREAR TODO DE NUEVO
-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE
);

-- Create collection_cards table
CREATE TABLE IF NOT EXISTS collection_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  condition TEXT,
  notes TEXT,
  is_foil BOOLEAN DEFAULT FALSE,
  is_first_edition BOOLEAN DEFAULT FALSE
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create wishlist_cards table
CREATE TABLE IF NOT EXISTS wishlist_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
BEFORE UPDATE ON wishlists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable row level security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Users can view their own collections"
ON collections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
ON collections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
ON collections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
ON collections
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for collection_cards
CREATE POLICY "Users can view their own collection cards"
ON collection_cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_cards.collection_id
    AND collections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert cards into their own collections"
ON collection_cards
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_cards.collection_id
    AND collections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update cards in their own collections"
ON collection_cards
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_cards.collection_id
    AND collections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete cards from their own collections"
ON collection_cards
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_cards.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlists"
ON wishlists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlists"
ON wishlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlists"
ON wishlists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists"
ON wishlists
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for wishlist_cards
CREATE POLICY "Users can view their own wishlist cards"
ON wishlist_cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist cards"
ON wishlist_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist cards"
ON wishlist_cards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist cards"
ON wishlist_cards FOR DELETE
USING (auth.uid() = user_id);

-- Añadir restricción única para evitar duplicados
ALTER TABLE wishlist_cards
ADD CONSTRAINT unique_user_card UNIQUE (user_id, card_id);

-- Añadir índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id ON wishlist_cards(user_id);

-- Add realtime support
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'collections'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE collections;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'collection_cards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE collection_cards;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'wishlists'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE wishlists;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'wishlist_cards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_cards;
    END IF;
END
$$;

-- Modify collection_cards table if needed
ALTER TABLE collection_cards
ADD COLUMN IF NOT EXISTS card_id TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS is_foil BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_first_edition BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON collection_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON collection_cards(collection_id);

-- Habilitar replicación en tiempo real para collection_cards
ALTER TABLE collection_cards REPLICA IDENTITY FULL;

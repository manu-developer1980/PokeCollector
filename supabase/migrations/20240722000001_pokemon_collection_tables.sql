BEGIN;  -- Start transaction

-- Eliminar tablas en orden correcto (primero las dependientes)
-- El CASCADE eliminará automáticamente las políticas, triggers y otros objetos dependientes
DROP TABLE IF EXISTS collection_cards CASCADE;
DROP TABLE IF EXISTS wishlist_cards CASCADE;
DROP TABLE IF EXISTS collections CASCADE;

-- Eliminar funciones (por si acaso quedó alguna)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- PARTE 2: CREAR TODO DE NUEVO
-- Create collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE
);

-- Create collection_cards table
CREATE TABLE collection_cards (
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

-- Create wishlist_cards table
CREATE TABLE wishlist_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    priority SMALLINT DEFAULT 1
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

-- Enable row level security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for collection_cards
CREATE POLICY "Users can view their own collection cards"
    ON collection_cards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert cards into their own collections"
    ON collection_cards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can update cards in their own collections"
    ON collection_cards FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete cards from their own collections"
    ON collection_cards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

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

-- Add constraints and indexes
ALTER TABLE wishlist_cards
    ADD CONSTRAINT unique_user_card UNIQUE (user_id, card_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id 
    ON wishlist_cards(user_id);

CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id 
    ON collection_cards(collection_id);

-- Set REPLICA IDENTITY for realtime
ALTER TABLE wishlist_cards REPLICA IDENTITY FULL;
ALTER TABLE collection_cards REPLICA IDENTITY FULL;
ALTER TABLE collections REPLICA IDENTITY FULL;

-- Enable realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE collections;
    ALTER PUBLICATION supabase_realtime ADD TABLE collection_cards;
    ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_cards;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

COMMIT;  -- End transaction

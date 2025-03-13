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
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
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
ON wishlist_cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_cards.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert cards into their own wishlists"
ON wishlist_cards
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_cards.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update cards in their own wishlists"
ON wishlist_cards
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_cards.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete cards from their own wishlists"
ON wishlist_cards
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_cards.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

-- Add realtime support
alter publication supabase_realtime add table collections;
alter publication supabase_realtime add table collection_cards;
alter publication supabase_realtime add table wishlists;
alter publication supabase_realtime add table wishlist_cards;

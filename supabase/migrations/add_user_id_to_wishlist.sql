-- Eliminar las políticas existentes primero
DROP POLICY IF EXISTS "Users can view their own wishlist cards" ON wishlist_cards;
DROP POLICY IF EXISTS "Users can insert cards into their own wishlists" ON wishlist_cards;
DROP POLICY IF EXISTS "Users can update cards in their own wishlists" ON wishlist_cards;
DROP POLICY IF EXISTS "Users can delete cards from their own wishlists" ON wishlist_cards;

-- Ahora sí podemos modificar la tabla
ALTER TABLE wishlist_cards 
DROP CONSTRAINT IF EXISTS wishlist_cards_wishlist_id_fkey,
DROP COLUMN IF EXISTS wishlist_id,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Añadir índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id ON wishlist_cards(user_id);

-- Añadir restricción única para evitar duplicados
ALTER TABLE wishlist_cards
ADD CONSTRAINT unique_user_card UNIQUE (user_id, card_id);

-- Configurar RLS (Row Level Security)
ALTER TABLE wishlist_cards ENABLE ROW LEVEL SECURITY;

-- Crear las nuevas políticas
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

-- Política para INSERT
CREATE POLICY "Users can insert their own collection cards" ON collection_cards
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Política para SELECT
CREATE POLICY "Users can view their own collection cards" ON collection_cards
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM collections c
    WHERE c.id = collection_cards.collection_id
    AND c.user_id = auth.uid()
  )
);

-- Política para UPDATE
CREATE POLICY "Users can update their own collection cards" ON collection_cards
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Política para DELETE
CREATE POLICY "Users can delete their own collection cards" ON collection_cards
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Habilitar RLS en la tabla
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;

-- Asegurarse de que los índices estén creados para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON collection_cards(card_id);

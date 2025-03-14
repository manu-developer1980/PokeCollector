-- Añadir campo de prioridad a wishlist_cards
ALTER TABLE wishlist_cards 
ADD COLUMN IF NOT EXISTS priority SMALLINT DEFAULT 1;

-- Asegurarnos que la tabla tiene REPLICA IDENTITY FULL para realtime
ALTER TABLE wishlist_cards REPLICA IDENTITY FULL;
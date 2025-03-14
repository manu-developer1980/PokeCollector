-- Eliminar la columna priority de wishlist_cards
ALTER TABLE wishlist_cards 
DROP COLUMN IF EXISTS priority;

-- Asegurarnos que la tabla tiene REPLICA IDENTITY FULL para realtime
ALTER TABLE wishlist_cards REPLICA IDENTITY FULL;
-- Función para obtener estadísticas de colección
CREATE OR REPLACE FUNCTION get_user_collection_stats(user_id UUID)
RETURNS TABLE (
  cards_count BIGINT,
  collections_count BIGINT,
  wishlist_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM collection_cards WHERE user_id = $1),
    (SELECT COUNT(*) FROM collections WHERE user_id = $1),
    (SELECT COUNT(*) FROM wishlist_cards WHERE user_id = $1);
END;
$$ LANGUAGE plpgsql;

-- Función para recortar cartas de colección
CREATE OR REPLACE FUNCTION trim_collection_cards(p_user_id UUID, p_limit INTEGER)
RETURNS void AS $$
BEGIN
  DELETE FROM collection_cards
  WHERE user_id = p_user_id
  AND id NOT IN (
    SELECT id FROM collection_cards
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit
  );
END;
$$ LANGUAGE plpgsql;

-- Funciones similares para collections y wishlist...
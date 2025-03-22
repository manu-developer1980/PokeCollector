-- Función para recortar cartas de la colección
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para recortar colecciones
CREATE OR REPLACE FUNCTION trim_collections(p_user_id UUID, p_limit INTEGER)
RETURNS void AS $$
BEGIN
    DELETE FROM collections
    WHERE user_id = p_user_id
    AND id NOT IN (
        SELECT id FROM collections
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT p_limit
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para recortar wishlist
CREATE OR REPLACE FUNCTION trim_wishlist(p_user_id UUID, p_limit INTEGER)
RETURNS void AS $$
BEGIN
    DELETE FROM wishlist
    WHERE user_id = p_user_id
    AND id NOT IN (
        SELECT id FROM wishlist
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT p_limit
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
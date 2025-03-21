-- Primero eliminamos la función si existe
DROP FUNCTION IF EXISTS delete_user_data(UUID);

CREATE OR REPLACE FUNCTION delete_user_data(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_param) THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;

    -- Eliminar wishlist_cards
    DELETE FROM public.wishlist_cards 
    WHERE user_id = user_id_param;

    -- Eliminar collection_cards
    DELETE FROM public.collection_cards 
    WHERE collection_id IN (
        SELECT id FROM public.collections WHERE user_id = user_id_param
    );

    -- Eliminar collections
    DELETE FROM public.collections 
    WHERE user_id = user_id_param;
    
    -- Eliminar subscriptions
    DELETE FROM public.subscriptions 
    WHERE user_id = user_id_param;
    
    -- Eliminar usuario de public.users
    DELETE FROM public.users 
    WHERE id = user_id_param;
END;
$$;

-- Asegurar que la función tiene los permisos necesarios
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;




CREATE OR REPLACE FUNCTION delete_user_data(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario que llama tiene permiso para eliminar estos datos
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = user_id_param 
        AND id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    -- Eliminar wishlist_cards
    DELETE FROM public.wishlist_cards 
    WHERE user_id = user_id_param;

    -- Eliminar collection_cards
    DELETE FROM public.collection_cards 
    WHERE collection_id IN (
        SELECT id FROM public.collections WHERE user_id = user_id_param
    );

    -- Eliminar colecciones
    DELETE FROM public.collections 
    WHERE user_id = user_id_param;
    
    -- Eliminar suscripción
    DELETE FROM public.subscriptions 
    WHERE user_id = user_id_param;
    
    -- Eliminar usuario de public.users
    DELETE FROM public.users 
    WHERE id = user_id_param;

    -- Eliminar el usuario de auth.users
    DELETE FROM auth.users 
    WHERE id = user_id_param;
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

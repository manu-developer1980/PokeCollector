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

    -- Eliminar las colecciones del usuario
    DELETE FROM public.collections 
    WHERE user_id = user_id_param;
    
    -- Eliminar el usuario de la tabla users
    DELETE FROM public.users 
    WHERE id = user_id_param;
    
    -- No eliminamos de auth.users aquí ya que el usuario ya cerró sesión
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO public;
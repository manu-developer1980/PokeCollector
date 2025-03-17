-- Eliminar políticas existentes para subscriptions si existen
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;

-- Crear política para permitir inserción durante el registro
CREATE POLICY "Enable subscription creation during signup"
    ON subscriptions
    FOR INSERT
    WITH CHECK (
        -- Permitir al rol de servicio insertar cualquier subscription
        auth.role() = 'service_role'
        OR
        -- Permitir a usuarios autenticados insertar sus propias subscriptions
        (auth.role() = 'authenticated' AND auth.uid() = user_id)
        OR
        -- Permitir inserción durante el registro (rol anónimo)
        auth.role() = 'anon'
    );

-- Política para ver subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.role() = 'service_role'
    );

-- Política para actualizar subscriptions
CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id
        OR auth.role() = 'service_role'
    );

-- Asegurar que los permisos básicos estén configurados
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT INSERT ON subscriptions TO anon;

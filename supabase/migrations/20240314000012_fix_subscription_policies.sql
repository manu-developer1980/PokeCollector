BEGIN;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "System can manage subscriptions" ON subscriptions;

-- Crear nuevas políticas
CREATE POLICY "Enable read access for users" ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users" ON subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users" ON subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

COMMIT;
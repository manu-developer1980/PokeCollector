BEGIN;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON subscriptions;
DROP POLICY IF EXISTS "Enable full access for service role" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subscriptions;

-- Asegurarse de que RLS está habilitado
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política simple que permite a los usuarios autenticados leer cualquier suscripción
CREATE POLICY "Allow authenticated users to read subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

-- Política para operaciones de escritura basadas en user_id
CREATE POLICY "Allow users to manage their own subscriptions"
ON subscriptions
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Asegurarse de que los permisos están correctamente configurados
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;

COMMIT;
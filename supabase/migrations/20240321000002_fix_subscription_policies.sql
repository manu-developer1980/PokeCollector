BEGIN;

-- Primero, eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can read their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can read their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable read access for users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for users" ON subscriptions;

-- Asegurarse de que RLS está habilitado
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política básica de lectura para usuarios autenticados
CREATE POLICY "Enable read access for all users"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

-- Política para que el service_role pueda hacer todo
CREATE POLICY "Enable full access for service role"
ON subscriptions
TO service_role
USING (true)
WITH CHECK (true);

-- Política para inserción de usuarios autenticados
CREATE POLICY "Enable insert for authenticated users"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para actualización de usuarios autenticados
CREATE POLICY "Enable update for authenticated users"
ON subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Otorgar permisos necesarios
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;

COMMIT;

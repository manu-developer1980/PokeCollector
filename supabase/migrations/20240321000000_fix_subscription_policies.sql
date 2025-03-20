-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can read their own subscription" ON subscriptions;

-- Habilitar RLS si no está habilitado
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura para usuarios autenticados
CREATE POLICY "Users can read their own subscription"
ON subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Crear política para permitir inserciones desde funciones de edge
CREATE POLICY "Service role can manage all subscriptions"
ON subscriptions
TO service_role
USING (true)
WITH CHECK (true);
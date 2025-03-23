-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for users" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;

-- Asegurarnos que RLS está activado
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Crear nueva política más específica con casting explícito
CREATE POLICY "Users can read own subscription"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  (auth.uid())::text = (user_id)::text
);

-- Agregar un índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Verificar que la política se creó correctamente
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'subscriptions';

-- Asegúrate de que esta política existe y está correctamente configurada
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR auth.role() = 'service_role'
        OR auth.role() = 'authenticated'
    );

-- Habilitar RLS para la tabla collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Política para INSERT
CREATE POLICY "Users can create their own collections"
ON collections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para SELECT
CREATE POLICY "Users can view their own collections"
ON collections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update their own collections"
ON collections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete their own collections"
ON collections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

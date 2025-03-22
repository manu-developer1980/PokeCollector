-- Limpiar usuarios duplicados y arreglar registros inconsistentes
BEGIN;

-- Eliminar registros duplicados en public.users manteniendo solo el más reciente
WITH DuplicateUsers AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
    FROM public.users
    WHERE deleted_at IS NOT NULL
)
DELETE FROM public.users
WHERE id IN (
    SELECT id 
    FROM DuplicateUsers 
    WHERE rn > 1
);

-- Actualizar usuarios soft-deleted que aún existen en auth.users
UPDATE public.users u
SET deleted_at = NULL,
    email = a.email,
    updated_at = NOW()
FROM auth.users a
WHERE u.id = a.id
AND u.deleted_at IS NOT NULL;

-- Eliminar usuarios en public.users que ya no existen en auth.users
DELETE FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM auth.users a 
    WHERE a.id = u.id
);

COMMIT;
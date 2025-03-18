-- Actualizar el tipo enum para los planes
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscription_plan_type_check;

ALTER TABLE subscriptions
ADD CONSTRAINT subscription_plan_type_check
CHECK (plan_type IN ('aprendiz', 'entrenador', 'maestro'));

-- Establecer el valor por defecto como 'aprendiz'
ALTER TABLE subscriptions
ALTER COLUMN plan_type SET DEFAULT 'aprendiz';
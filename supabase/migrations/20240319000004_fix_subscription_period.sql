BEGIN;

-- Primero, aseguramos que el campo tenga el valor por defecto correcto basado en created_at
ALTER TABLE subscriptions 
    ALTER COLUMN current_period_end SET DEFAULT (created_at + INTERVAL '1 month');

-- Actualizamos los registros existentes para que current_period_end sea un mes después de created_at
UPDATE subscriptions 
SET current_period_end = created_at + INTERVAL '1 month'
WHERE current_period_end IS NULL 
   OR current_period_end < created_at + INTERVAL '1 month';

-- Aseguramos que el campo sea NOT NULL
ALTER TABLE subscriptions 
    ALTER COLUMN current_period_end SET NOT NULL;

COMMIT;
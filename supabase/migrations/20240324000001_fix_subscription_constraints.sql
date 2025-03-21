-- Verificar y corregir el tipo enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_type') THEN
        CREATE TYPE subscription_plan_type AS ENUM ('aprendiz', 'entrenador', 'maestro');
    END IF;
END $$;

-- Asegurar que las columnas tengan los tipos correctos
ALTER TABLE subscriptions
    ALTER COLUMN plan_type TYPE subscription_plan_type USING plan_type::subscription_plan_type,
    ALTER COLUMN stripe_subscription_id TYPE text,
    ALTER COLUMN stripe_customer_id TYPE text,
    ALTER COLUMN stripe_price_id TYPE text,
    ALTER COLUMN status TYPE text,
    ALTER COLUMN current_period_end TYPE timestamptz,
    ALTER COLUMN cancel_at_period_end TYPE boolean,
    ALTER COLUMN is_active TYPE boolean;

-- Asegurar que las columnas requeridas no sean null
ALTER TABLE subscriptions
    ALTER COLUMN plan_type SET NOT NULL,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN current_period_end SET NOT NULL,
    ALTER COLUMN cancel_at_period_end SET NOT NULL DEFAULT false,
    ALTER COLUMN is_active SET NOT NULL DEFAULT true;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
    ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
    ON subscriptions(stripe_customer_id);

-- Asegurar que stripe_subscription_id sea único
ALTER TABLE subscriptions
    DROP CONSTRAINT IF EXISTS unique_stripe_subscription_id;
ALTER TABLE subscriptions
    ADD CONSTRAINT unique_stripe_subscription_id UNIQUE (stripe_subscription_id);
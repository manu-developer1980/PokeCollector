BEGIN;

-- Primero, guardamos los datos existentes en una tabla temporal
CREATE TEMP TABLE temp_subscriptions AS 
SELECT 
    id,
    user_id,
    plan_type::text as plan_type,
    status,
    created_at,
    updated_at,
    polar_subscription_id, -- Mantenemos el nombre original
    current_period_end,
    cancel_at_period_end
FROM subscriptions;

-- Eliminamos la tabla y el tipo enum existentes
DROP TABLE IF EXISTS subscriptions;
DROP TYPE IF EXISTS subscription_plan_type CASCADE;

-- Recreamos el tipo enum
CREATE TYPE subscription_plan_type AS ENUM ('aprendiz', 'entrenador', 'maestro');

-- Creamos la nueva tabla con la estructura de Stripe
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type subscription_plan_type NOT NULL DEFAULT 'aprendiz',
    status TEXT NOT NULL DEFAULT 'active',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Migramos los datos, convirtiendo polar_subscription_id a stripe_subscription_id
INSERT INTO subscriptions (
    id, 
    user_id, 
    plan_type,
    status,
    stripe_subscription_id, -- Nuevo campo de Stripe
    current_period_end,
    cancel_at_period_end,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id,
    user_id,
    CASE 
        WHEN LOWER(plan_type) = 'aprendiz' THEN 'aprendiz'::subscription_plan_type
        WHEN LOWER(plan_type) = 'entrenador' THEN 'entrenador'::subscription_plan_type
        WHEN LOWER(plan_type) = 'maestro' THEN 'maestro'::subscription_plan_type
        ELSE 'aprendiz'::subscription_plan_type
    END as plan_type,
    status,
    polar_subscription_id, -- Convertimos el ID de Polar a Stripe
    current_period_end,
    cancel_at_period_end,
    true, -- Asumimos que las suscripciones existentes están activas
    created_at,
    updated_at
FROM temp_subscriptions;

-- Creamos los índices para mejor rendimiento
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Configuramos RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Creamos las políticas de seguridad
CREATE POLICY "Enable read access for users" ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users" ON subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users" ON subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Creamos el trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;



-- Función para actualizar las suscripciones sin price_id
CREATE OR REPLACE FUNCTION fix_subscription_price_ids()
RETURNS void AS $$
BEGIN
  -- Actualizar price_id basado en el plan_type
  UPDATE subscriptions
  SET stripe_price_id = 
    CASE 
      WHEN plan_type = 'aprendiz' THEN 'price_1R4KH1EoOyqILXNqxnOSjJHZ'
      WHEN plan_type = 'entrenador' THEN 'price_1R4KGgEoOyqILXNqf6Z2vjqQ'
      WHEN plan_type = 'maestro' THEN 'price_1R4KHlEoOyqILXNqqX7gkWWJ'
    END
  WHERE stripe_price_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función
SELECT fix_subscription_price_ids();

-- Asegurarse de que stripe_price_id no sea NULL en el futuro
ALTER TABLE subscriptions
ALTER COLUMN stripe_price_id SET NOT NULL;
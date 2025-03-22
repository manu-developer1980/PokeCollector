-- Tabla para rastrear cambios de suscripción
CREATE TABLE subscription_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    previous_plan TEXT NOT NULL,
    new_plan TEXT NOT NULL,
    invoice_id TEXT,
    status TEXT DEFAULT 'pending',
    paid_amount INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Función para registrar cambios de suscripción
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.plan_type != NEW.plan_type THEN
        INSERT INTO subscription_changes (
            user_id,
            subscription_id,
            previous_plan,
            new_plan,
            status
        ) VALUES (
            NEW.user_id,
            NEW.id,
            OLD.plan_type,
            NEW.plan_type,
            'pending'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios
CREATE TRIGGER subscription_change_logger
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_change();

-- Función para obtener historial de cambios
CREATE OR REPLACE FUNCTION get_subscription_changes(p_user_id UUID)
RETURNS TABLE (
    change_date TIMESTAMP WITH TIME ZONE,
    previous_plan TEXT,
    new_plan TEXT,
    amount_paid INTEGER,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        created_at,
        previous_plan,
        new_plan,
        paid_amount,
        status
    FROM subscription_changes
    WHERE user_id = p_user_id
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;
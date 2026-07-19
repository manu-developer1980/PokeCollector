-- Price alerts: permite a usuarios Maestro pedir que se les avise por email
-- cuando el precio de mercado (Cardmarket) de una carta baja de un umbral.
-- La comprobación la hace la edge function check-price-alerts, disparada por
-- un cron externo (GitHub Actions) una vez al día.

BEGIN;

CREATE TABLE public.price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    card_image_url TEXT,
    target_price NUMERIC(10,2) NOT NULL CHECK (target_price > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_checked_at TIMESTAMPTZ,
    last_notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- La edge function solo necesita las alertas activas, agrupadas para el cron.
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_user ON public.price_alerts(user_id);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own price alerts"
  ON public.price_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

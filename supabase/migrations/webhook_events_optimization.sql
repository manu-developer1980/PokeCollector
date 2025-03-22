-- Añadir índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS webhook_events_event_type_idx ON public.webhook_events (event_type);
CREATE INDEX IF NOT EXISTS webhook_events_processed_at_idx ON public.webhook_events (processed_at);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON public.webhook_events (created_at);

-- Añadir una columna para idempotencia
ALTER TABLE public.webhook_events ADD COLUMN IF NOT EXISTS stripe_event_id text;
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_stripe_event_id_idx ON public.webhook_events (stripe_event_id) WHERE stripe_event_id IS NOT NULL;

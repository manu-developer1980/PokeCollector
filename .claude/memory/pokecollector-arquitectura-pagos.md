---
name: pokecollector-arquitectura-pagos
description: Arquitectura de pagos reconstruida (jul 2026) y estado pendiente de restauración de Supabase
metadata: 
  node_type: memory
  type: project
  originSessionId: 5a49106e-0b1d-47d3-8c0a-d39d1afa851c
---

Reconstrucción de la capa de pagos completada el 2026-07-16. Reglas:

- Dos repos independientes: `PokeCollector/` (frontend + edge functions, deploy Netlify) y `PokeCollect-backend/` (Express en Render, SIN Stripe — solo proxy Pokemon TCG API y email). El usuario no quiere un repo git en la carpeta raíz.
- Toda la lógica de Stripe vive en `PokeCollector/supabase/functions/`: `stripe-webhook` (única fuente de verdad de la tabla `subscriptions`), `create-stripe-checkout` (solo primera suscripción; 409 si ya hay activa), `change-subscription` (upgrade/downgrade in situ), `cancel-subscription`, `create-portal-session`. Mapeo precio↔plan en `_shared/plans.ts` y helpers de auth en `_shared/auth.ts`.
- Frontend: acciones centralizadas en `src/lib/subscriptionActions.ts`; los componentes no llaman a Stripe directamente.
- Planes: aprendiz (gratis) / entrenador (5€) / maestro (10€), enum en minúsculas en BD.

Pendiente (estado 2026-07-16):
- Proyecto Supabase `kiphglgoanmibjztwhmj` PAUSADO; guía completa en `PokeCollector/RESTORE.md` (restaurar en dashboard + `supabase login` + db push + deploy functions + recrear webhook de Stripe).
- [[pokecollector-claves-expuestas]] — el usuario mantiene los .env committeados a propósito (riesgo aceptado).
- 2 errores TS preexistentes en admin/SubscriptionManagement.tsx por tipos generados desfasados; se arreglan con `supabase gen types` tras restaurar.
- Reconstrucción committeada y pusheada en ambos repos (frontend 21ccebd, backend 6c3bdf6).

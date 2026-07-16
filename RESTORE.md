# Guía de restauración — PokeCollector

El proyecto de Supabase (`kiphglgoanmibjztwhmj`) está **pausado**. Esta guía
cubre la restauración completa y el redespliegue de la capa de pagos
reconstruida (julio 2026).

## 0. ⚠️ Rotar claves (ANTES de nada)

Los `.env` estuvieron **committeados en GitHub** en ambos repos, así que estas
claves están expuestas en el historial y hay que rotarlas:

| Clave | Dónde rotarla |
|---|---|
| Service role key de Supabase | Dashboard → Settings → API → "Reset" (tras restaurar) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Roll |
| `BREVO_API_KEY` | app.brevo.com → Settings → API keys |
| `STRIPE_WEBHOOK_SECRET` | Se genera nuevo al recrear el endpoint (paso 5) |

Los `.env` ya están fuera del tracking de git (`git rm --cached`); commitea ese
cambio para que la eliminación sea efectiva. Para purgar el historial antiguo
en GitHub, valora `git filter-repo` o al menos da los repos por comprometidos
y rota todo.

## 1. Restaurar el proyecto de Supabase

1. Entra en https://supabase.com/dashboard/project/kiphglgoanmibjztwhmj
2. Pulsa **Restore project** y espera a que termine (minutos).
   - Si llevaba >90 días pausado y no deja restaurar, crea un proyecto nuevo y
     apunta las URLs/keys nuevas en los `.env` y en Netlify.

## 2. Autenticar el CLI y enlazar

```bash
supabase login              # abre el navegador
cd PokeCollector
supabase link --project-ref kiphglgoanmibjztwhmj
```

## 3. Base de datos

Las migraciones de `supabase/migrations/` son la fuente de verdad del esquema:

```bash
supabase db push
# Verifica el estado:
supabase migration list
```

Después regenera los tipos (los actuales están desfasados y causan 2 errores
de TypeScript en `src/components/features/admin/SubscriptionManagement.tsx`):

```bash
supabase gen types typescript --linked > src/types/supabase.ts
```

## 4. Secrets y despliegue de las edge functions

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_...  \
  SITE_URL=https://poke-collector.netlify.app

# Los price IDs están hardcodeados en supabase/functions/_shared/plans.ts
# con la opción de sobreescribirlos por env:
# supabase secrets set STRIPE_PRICE_APRENDIZ=... STRIPE_PRICE_ENTRENADOR=... STRIPE_PRICE_MAESTRO=...

supabase functions deploy stripe-webhook
supabase functions deploy create-stripe-checkout
supabase functions deploy create-portal-session
supabase functions deploy change-subscription
supabase functions deploy cancel-subscription
supabase functions deploy initialize-user
supabase functions deploy send-email
supabase functions deploy delete-user
supabase functions deploy stripe-admin
supabase functions deploy stripe-subscriptions
supabase functions deploy sync-subscription
```

> ⚠️ **Nunca** despliegues nada desde el repo del backend a Supabase: el
> antiguo `PokeCollect-backend/supabase/functions/stripe-webhook` (ya
> eliminado) machacaba el webhook bueno con una versión que no escribía en la
> base de datos — esa era la causa principal de que los upgrades/downgrades
> no se reflejaran.

## 5. Webhook de Stripe

En Stripe Dashboard → Developers → Webhooks:

1. Elimina los endpoints antiguos (especialmente cualquiera apuntando al
   backend de Render `/api/stripe/webhook`, que nunca funcionó).
2. Crea UN único endpoint:
   - URL: `https://kiphglgoanmibjztwhmj.supabase.co/functions/v1/stripe-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.payment_failed`
3. Copia el nuevo `whsec_...` y ponlo en los secrets (paso 4).

## 6. Billing Portal de Stripe (una vez)

Stripe Dashboard → Settings → Billing → **Customer portal**:
- Activa el portal y guarda la configuración por defecto (facturas, método de
  pago). El botón "Gestionar facturación" del dashboard de la app lo usa.

## 7. Netlify / Render

- Netlify (frontend): revisa que `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  y `VITE_BACKEND_URL` estén configuradas. **Elimina**
  `VITE_SUPABASE_SERVICE_KEY` si existe: la service key jamás va al frontend.
- Render (backend): ya no necesita ninguna variable de Stripe. Solo
  `POKEMON_TCG_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (rotada) y
  `BREVO_API_KEY` (rotada).

## Arquitectura de pagos tras la reconstrucción

```
Frontend (React) ── supabase.functions.invoke ──▶ Edge Functions
                                                    │
  create-stripe-checkout  ← primera suscripción (redirige a Stripe Checkout)
  change-subscription     ← upgrade/downgrade IN SITU (nunca 2º checkout)
  cancel-subscription     ← cancelar a fin de período
  create-portal-session   ← facturas / método de pago
                                                    │
Stripe ── webhook firmado ──▶ stripe-webhook ──▶ tabla `subscriptions`
                              (única fuente de verdad de la BD)
```

Reglas:
- Solo `stripe-webhook` y las 3 funciones de arriba escriben en `subscriptions`.
- El mapeo precio↔plan vive en `supabase/functions/_shared/plans.ts` (backend)
  y `src/lib/stripe.ts` (frontend). Si cambias un price en Stripe, actualiza
  ambos.
- El backend Express (Render) ya no sabe nada de Stripe.

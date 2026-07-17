# PokeCollector — contexto para Claude Code

App de colección de cartas Pokémon: React/Vite (este repo, deploy en Netlify)
+ edge functions de Supabase en `supabase/functions/` + un backend Express
aparte (repo `PokeCollect-backend`, deploy en Render) que solo hace de proxy
de la Pokemon TCG API y de servicio de email.

## Memoria de sesiones anteriores

Lee `.claude/memory/MEMORY.md` (y los archivos que enlaza) al empezar: ahí
está el estado del proyecto, decisiones tomadas y preferencias del usuario.
Si trabajas en una máquina nueva, copia esos archivos al directorio de
memoria persistente para no perder el hilo entre sesiones.

## Estado actual (2026-07-17)

- Capa de pagos de Stripe **reconstruida** (ver `RESTORE.md` para la
  arquitectura y el porqué). Regla de oro: los cambios de plan se hacen IN
  SITU con `change-subscription`; `create-stripe-checkout` solo sirve para la
  primera suscripción; `stripe-webhook` es la única fuente de verdad de la
  tabla `subscriptions`.
- **Migrado a un proyecto nuevo de Supabase**: `jocdulzmpkayrnddapco`
  ("PokeCollector-v2", eu-central-1, Postgres 17). El antiguo
  `kiphglgoanmibjztwhmj` es irrecuperable. Datos restaurados desde el volcado
  `db_cluster-09-09-2025@03-15-11.backup.gz` (en la carpeta padre del
  workspace): 4 usuarios auth con identidades y contraseñas, colecciones,
  cartas, wishlist, 2 suscripciones (una `entrenador` con sub real de Stripe)
  y logs. Las 5 migraciones del repo están aplicadas (`db push` hecho,
  historial limpio) y los datos re-insertados adaptados al esquema nuevo.
  `.env` de ambos repos actualizados con URL/keys nuevas; tipos regenerados.
  La contraseña de la BD la guarda Manuel (no está en el repo). Acceso a BD
  solo por el session pooler `aws-0-eu-central-1.pooler.supabase.com:5432`,
  usuario `postgres.jocdulzmpkayrnddapco` (el host directo es solo IPv6).
- **Pendiente** (pasos 4-7 de `RESTORE.md`, adaptados al ref nuevo):
  1. `supabase secrets set` — valores de Stripe/Brevo en los `.env`;
     `RECAPTCHA_SECRET_KEY`, `RESEND_API_KEY` y `SEND_EMAIL_HOOK_SECRET` son
     irrecuperables: sacarlos de sus dashboards o regenerarlos.
  2. Deploy de las 11 edge functions (`supabase functions deploy ...`).
  3. Recrear el webhook de Stripe apuntando a
     `https://jocdulzmpkayrnddapco.supabase.co/functions/v1/stripe-webhook`
     y actualizar `STRIPE_WEBHOOK_SECRET` (el committeado está obsoleto).
  4. Actualizar variables en Netlify (frontend) y Render (backend).
- **Deuda conocida**: 8 errores de TS en 3 ficheros de admin
  (PricingManagement, InitialAdminSetup, useAdmin) — el código usa embeds
  `users→subscriptions` que requieren FKs hacia `public.users`, pero las
  migraciones las apuntan a `auth.users`; además consulta una columna
  `customer_id` inexistente. Decidir entre migración nueva de FKs o adaptar
  el código.

## Comandos

- `npm run dev` — desarrollo (Vite, puerto 5173)
- `./node_modules/.bin/tsc --noEmit` — typecheck
- `npm run build` — build de producción
- Edge functions: `deno check supabase/functions/<nombre>/index.ts`
  (con `DENO_TLS_CA_STORE=system,mozilla` si hay errores de certificado)

## Preferencias del usuario

- Comunicación en español.
- Los `.env` van committeados a propósito (proyecto personal, riesgo
  aceptado); no destrackearlos ni insistir en rotar claves. Excepción: nunca
  claves con prefijo `VITE_` que acaben en el bundle del navegador.
- Cada carpeta (`PokeCollector`, `PokeCollect-backend`) es su propio repo git;
  no crear un repo en la carpeta padre.

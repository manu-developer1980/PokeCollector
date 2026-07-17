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
- **Hecho 2026-07-17 (tarde)**: secrets fijados (`STRIPE_SECRET_KEY`,
  `SITE_URL`) y las 11 edge functions desplegadas en el proyecto nuevo.
  Descubrimiento: `send-email` es un stub (solo hace log, no llama a Brevo),
  así que `RECAPTCHA_SECRET_KEY`, `RESEND_API_KEY` y `SEND_EMAIL_HOOK_SECRET`
  no los usa ninguna function — eran config del dashboard de Auth del
  proyecto viejo; solo harán falta si se reactivan el email hook / captcha.
- **Hecho 2026-07-17 (tarde, 2)**: webhook de Stripe recreado por API
  (`we_1TuA8KEoOyqILXNq5wDnui2E`, 5 eventos, apunta a la edge function del
  proyecto nuevo); `STRIPE_WEBHOOK_SECRET` nuevo fijado en Supabase y
  actualizado en el `.env` del frontend. Endpoint viejo
  (`kiphglgoanmibjztwhmj`) borrado — el de MedTracker en la misma cuenta de
  Stripe NO se toca. Bloque Stripe muerto eliminado del `.env` del backend.
- **Pendiente**: actualizar variables en los dashboards de Netlify (frontend:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; borrar
  `VITE_SUPABASE_SERVICE_KEY` si existe) y Render (backend: `SUPABASE_URL`,
  `SUPABASE_SERVICE_KEY`; quitar variables de Stripe) con los valores de los
  `.env`. Después: smoke test de la app desplegada y configurar el Billing
  Portal de Stripe si no lo está (paso 6 de RESTORE.md).
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

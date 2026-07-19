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
- **Hecho 2026-07-17 (tarde, 3) — RESTAURACIÓN COMPLETA**: variables de
  Netlify actualizadas por API; el servicio de Render no existía y se recreó
  por API como `srv-d9d1m7r7uimc73fbro9g` con URL nueva
  `https://pokecollect-backend-t5ia.onrender.com` (el nombre pelado ya no
  estaba libre — Netlify y CSP actualizados en consecuencia). Los 8 errores
  de TS de admin arreglados adaptando el código al esquema real
  (`users.is_admin` en vez de `users.subscription`; `stripe_customer_id` en
  vez de `customer_id`) — sin migración. `NODE_VERSION` de Netlify subido a
  22 (Vite 7 exige >=20). Deploy verde verificado: el bundle servido solo
  referencia el proyecto nuevo y el backend responde 200.
- **Emails de auth restaurados (2026-07-17)**: SMTP de Brevo configurado
  directamente en Auth vía `supabase config push` (`[auth.email.smtp]` y
  plantillas es en `supabase/templates/` — confirmación, recovery y magic
  link). Sin edge function ni Auth Hook: el `send-email` del repo es un stub
  histórico y el sistema hook+Resend original se abandonó. La clave SMTP
  (`xsmtpsib-...`, distinta de la API key) se pasa como `BREVO_SMTP_KEY` al
  hacer el push; Manuel la tiene en el dashboard de Brevo. Tradeoff aceptado:
  emails solo en español (las plantillas nativas son mono-idioma; las
  versiones en/es siguen en `src/emails/`).
- **Smoke test de billing por API hecho (2026-07-18)**: webhook→BD verificado
  en vivo (update en Stripe reflejado en `subscriptions` en 2 s; BD y Stripe
  coinciden campo a campo en la sub `entrenador`); Billing Portal con config
  activa por defecto (paso 6 de RESTORE.md ✓); los 3 precios activos; las 5
  edge functions de pagos responden; el trigger de signup crea `public.users`
  + sub gratis (con cascade al borrar); `create-stripe-checkout` devuelve URL
  de Checkout válida con un JWT real. Stripe en modo test clásico (no Sandbox).
- **Pendiente (requiere navegador)**: click-through final — pagar un checkout
  con tarjeta de test (4242…), upgrade/downgrade in situ desde la UI y abrir
  el Billing Portal desde "Mi Cuenta".
- **Ojo Render**: el servicio recreado (`pokecollect-backend-t5ia`) NO
  auto-despliega al pushear a main — el deploy de `985a39b` (2026-07-18) hubo
  que lanzarlo a mano desde el dashboard. Revisar Settings → Build & Deploy →
  Auto-Deploy si se quiere recuperar. Tampoco hay API key de Render en local.
- La antigua "deuda conocida" de 8 errores de TS en admin ya no existe: se
  arregló el 2026-07-17 adaptando el código al esquema real (`tsc --noEmit`
  limpio verificado el 2026-07-18).

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

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

## Estado actual (2026-07-16)

- Capa de pagos de Stripe **reconstruida** (ver `RESTORE.md` para la
  arquitectura y el porqué). Regla de oro: los cambios de plan se hacen IN
  SITU con `change-subscription`; `create-stripe-checkout` solo sirve para la
  primera suscripción; `stripe-webhook` es la única fuente de verdad de la
  tabla `subscriptions`.
- El proyecto de Supabase (`kiphglgoanmibjztwhmj`) está **pausado**. Los pasos
  de restauración y redespliegue están en `RESTORE.md`.
- Pendiente tras restaurar: `supabase db push`, deploy de las funciones,
  secrets, y `supabase gen types typescript --linked > src/types/supabase.ts`
  (elimina los 2 errores de TS en admin/SubscriptionManagement.tsx).

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

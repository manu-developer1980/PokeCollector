---
name: supabase-migracion-proyecto-nuevo
description: Migración completada al proyecto Supabase jocdulzmpkayrnddapco (2026-07-17); qué queda pendiente y cómo conectar
metadata:
  type: project
---

El 2026-07-17 se migró PokeCollector al proyecto de Supabase **`jocdulzmpkayrnddapco`** ("PokeCollector-v2", eu-central-1, Postgres 17); el antiguo `kiphglgoanmibjztwhmj` quedó irrecuperable. Datos restaurados desde `db_cluster-09-09-2025@03-15-11.backup.gz` (carpeta padre del workspace): 4 usuarios auth con identidades/contraseñas, 2 perfiles, 3 colecciones, 1 carta, 2 wishlist, 2 suscripciones (`aprendiz` + `entrenador` con sub real de Stripe) y 24 audit logs. Las 5 migraciones de `supabase/migrations/` aplicadas como fuente de verdad (historial remoto limpio: 5=5) y datos re-insertados adaptados. `.env` de ambos repos y `src/types/supabase.ts` actualizados.

**Why:** los proyectos free pausados >90 días no se pueden reactivar; era el plan B documentado en RESTORE.md.

**How to apply:**
- CLI linkado en esta carpeta; en máquina nueva: `supabase login` + `supabase link --project-ref jocdulzmpkayrnddapco`.
- BD solo accesible por session pooler: `aws-0-eu-central-1.pooler.supabase.com:5432`, usuario `postgres.jocdulzmpkayrnddapco` (host directo solo IPv6; el pooler aws-1 no conoce el tenant). La contraseña la tiene Manuel (no está en el repo).
- `config.toml` lleva `[db] port=55432 shadow_port=55433 major_version=17` porque el 54320 por defecto cae en un rango de puertos excluido por Hyper-V (al menos en el laptop original).
- Hecho 2026-07-17 tarde: secrets (`STRIPE_SECRET_KEY`, `SITE_URL`) + deploy de las 11 functions. `send-email` es un stub (no llama a Brevo), así que los 3 secrets "irrecuperables" (RECAPTCHA/RESEND/SEND_EMAIL_HOOK) no hacen falta salvo que se reactive el email hook/captcha en Auth.
- Hecho 2026-07-17 tarde (2): webhook de Stripe recreado por API (`we_1TuA8KEoOyqILXNq5wDnui2E`) con secret nuevo fijado en Supabase y en el `.env` del frontend; endpoint viejo borrado (el de MedTracker de la misma cuenta Stripe no se toca). Verificado que la function responde (400 sin firma).
- Pendiente: variables en dashboards de Netlify y Render (sin CLIs en esta máquina), smoke test de la app y Billing Portal de Stripe — detalle en "Estado actual" de CLAUDE.md.
- Deuda conocida: 8 errores de TS en admin por desajuste código↔esquema (embeds requieren FKs a `public.users`; las migraciones apuntan a `auth.users`). Ver [[pokecollector-arquitectura-pagos]].

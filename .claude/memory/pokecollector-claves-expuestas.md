---
name: pokecollector-claves-expuestas
description: El usuario mantiene los .env committeados a propósito; claves en historial de GitHub asumidas como riesgo aceptado
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5a49106e-0b1d-47d3-8c0a-d39d1afa851c
---

El usuario autorizó explícitamente (2026-07-16) mantener los `.env` con claves committeados y pusheados en ambos repos (manu-developer1980/PokeCollector y /PokeCollect-backend): "sé que no es la mejor práctica pero no es un proyecto comercial ahora mismo, no hay riesgo".

**Why:** proyecto personal sin producción activa; prioriza comodidad sobre higiene de secretos.

**How to apply:** no volver a destrackear los .env ni insistir en rotación en cada sesión. Excepción que sigue vigente: nada de claves con prefijo `VITE_` que acaben en el bundle del navegador (la VITE_SUPABASE_SERVICE_KEY se eliminó por eso). Si el proyecto pasa a comercial/producción, recordar entonces la rotación (claves expuestas: service role de Supabase, STRIPE_SECRET_KEY, BREVO_API_KEY, STRIPE_WEBHOOK_SECRET). Ver [[pokecollector-arquitectura-pagos]].

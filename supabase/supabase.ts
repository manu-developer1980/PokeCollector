import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      flowType: 'pkce', // Enhanced security and token refresh optimization
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
      // Configuración mejorada para manejar desconexiones durante navegación
      heartbeatIntervalMs: 30000,
      reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
      timeout: 10000,
    },
    global: {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=minimal",
      },
    },
  }
);

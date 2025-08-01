# Configuración de Content Security Policy (CSP)

## Problema Resuelto

En producción, las requests al backend estaban siendo bloqueadas con el error `(blocked:csp)`. Esto se debía a que la política de seguridad de contenido (CSP) en Netlify no incluía la URL del backend de producción.

## Solución Implementada

### 1. Actualización del archivo `netlify.toml`

Se modificó la directiva `connect-src` en la política CSP para incluir el backend de producción:

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kiphglgoanmibjztwhmj.supabase.co https://*.supabase.co wss://kiphglgoanmibjztwhmj.supabase.co wss://*.supabase.co https://pokecollect-backend.onrender.com;"
```

### 2. Explicación de las directivas CSP

- `default-src 'self'`: Permite recursos solo del mismo origen
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Permite scripts del mismo origen, inline y eval
- `style-src 'self' 'unsafe-inline'`: Permite estilos del mismo origen e inline
- `img-src 'self' data: https:`: Permite imágenes del mismo origen, data URLs y HTTPS
- `font-src 'self' data:`: Permite fuentes del mismo origen y data URLs
- `connect-src`: **CLAVE** - Define qué URLs pueden ser contactadas vía fetch, XHR, WebSocket, etc.

### 3. URLs permitidas en `connect-src`

- `'self'`: El mismo dominio (poke-collector.netlify.app)
- `https://kiphglgoanmibjztwhmj.supabase.co`: Base de datos Supabase para HTTP/HTTPS
- `https://*.supabase.co`: Cualquier subdominio de Supabase (HTTP/HTTPS)
- `wss://kiphglgoanmibjztwhmj.supabase.co`: Base de datos Supabase para WebSockets
- `wss://*.supabase.co`: Cualquier subdominio de Supabase (WebSockets)
- `https://pokecollect-backend.onrender.com`: **Backend de producción** (añadido para resolver el problema)
- `https://www.google-analytics.com`: Google Analytics para envío de datos
- `https://*.google-analytics.com`: Subdominios de Google Analytics
- `https://analytics.google.com`: Servicio principal de Google Analytics

**Nota importante**: Las conexiones WebSocket (wss://) son necesarias para Supabase Realtime, que permite actualizaciones en tiempo real de la base de datos.

## Cómo Diagnosticar Problemas CSP

### 1. Síntomas
- Requests marcadas como `(blocked:csp)` en DevTools
- Errores de CORS que no se resuelven con configuración del servidor
- APIs que funcionan en desarrollo pero fallan en producción

### 2. Verificación
1. Abrir DevTools → Network
2. Buscar requests con estado `(blocked:csp)`
3. Revisar la consola para errores CSP específicos

### 3. Solución
1. Identificar la URL que está siendo bloqueada
2. Añadirla a la directiva apropiada en `netlify.toml`:
   - `connect-src`: Para APIs y WebSockets
   - `script-src`: Para scripts externos (incluye Google Tag Manager)
   - `style-src`: Para hojas de estilo externas
   - `img-src`: Para imágenes externas

## Variables de Entorno en Producción

Asegúrate de que en Netlify estén configuradas:

```
VITE_API_BASE=https://pokecollect-backend.onrender.com/api
VITE_SUPABASE_URL=https://kiphglgoanmibjztwhmj.supabase.co
VITE_SUPABASE_ANON_KEY=[tu_clave]
```

## Notas Importantes

1. **Desarrollo vs Producción**: En desarrollo local no hay CSP, por eso funciona todo
2. **Netlify Deploy**: Los cambios en `netlify.toml` requieren un nuevo deploy
3. **Seguridad**: CSP es una medida de seguridad importante, no la desactives completamente
4. **Testing**: Siempre prueba en producción después de cambios CSP

## Comandos Útiles

```bash
# Hacer commit y push de cambios CSP
git add netlify.toml
git commit -m "Update CSP policy"
git push

# Verificar deploy en Netlify
# El deploy automático se activará tras el push
```
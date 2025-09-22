# Solución de Problemas CORS

## Problema Identificado

Las peticiones a la API del backend estaban siendo canceladas en producción debido a una configuración demasiado restrictiva de la política de referencia (Referrer-Policy).

## Síntomas
- Peticiones canceladas en el navegador
- Errores de CORS a pesar de tener la configuración correcta en el backend
- Funcionamiento correcto en desarrollo pero fallos en producción

## Causa Raíz

La política de referencia estaba configurada como `strict-origin-when-cross-origin` en el archivo `netlify.toml`, lo cual era demasiado restrictivo para las peticiones cross-origin al backend.

## Solución Implementada

### 1. Cambio en netlify.toml

Se modificó la línea 24 del archivo `netlify.toml`:

```toml
# Antes (demasiado restrictivo)
Referrer-Policy = "strict-origin-when-cross-origin"

# Después (menos restrictivo, permite CORS)
Referrer-Policy = "origin-when-cross-origin"
```

### 2. Configuración CORS del Backend

El backend ya tenía la configuración correcta en `/src/index.ts`:

```javascript
const allowedOrigins = [
  "http://localhost:5173", // Desarrollo
  "http://localhost:5174", // Desarrollo alternativo
  "http://localhost:5174", // Desarrollo alternativo
  "https://poke-collector.netlify.app", // Producción
  "https://pokecollector.netlify.app", // Producción alternativo
];
```

## Diferencias entre Políticas de Referencia

### strict-origin-when-cross-origin
- Envía el origen completo para peticiones same-origin
- Envía solo el origen para peticiones cross-origin HTTPS→HTTPS
- No envía referrer para peticiones HTTPS→HTTP
- **Puede causar problemas con CORS**

### origin-when-cross-origin
- Envía el origen completo para peticiones same-origin
- Envía solo el origen para peticiones cross-origin
- **Más compatible con CORS**

## Verificación

Para verificar que la solución funciona:

1. Esperar a que Netlify despliegue los cambios
2. Abrir DevTools → Network
3. Verificar que las peticiones al backend ya no se cancelan
4. Confirmar que las respuestas de la API se reciben correctamente

## Prevención

Para evitar problemas similares en el futuro:

1. Probar siempre en producción después de cambios de configuración
2. Revisar las políticas de seguridad cuando se implementen nuevas APIs
3. Usar `origin-when-cross-origin` como política por defecto para aplicaciones con APIs externas

## Referencias

- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
- [CORS y Referrer Policy](https://web.dev/referrer-best-practices/)
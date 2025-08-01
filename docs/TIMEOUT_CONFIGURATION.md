# Configuración de Timeouts para Backend Lento

## Problema
El backend alojado en Render puede experimentar "cold starts" (arranques en frío) que causan timeouts en las solicitudes HTTP del frontend.

## Síntomas
- Las búsquedas fallan con errores de timeout
- Las solicitudes tardan más de 15 segundos en responder
- El backend funciona pero es muy lento en responder

## Solución Implementada

### 1. Aumento del Timeout Principal
```javascript
// En src/lib/api.ts
const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // Aumentado de 15s a 60s
  // ...
});
```

### 2. Mejora del Sistema de Reintentos
```javascript
// Configuración de reintentos mejorada
const baseDelay = config.retryDelay || 2000; // Aumentado de 1s a 2s
const jitter = Math.random() * 2000; // Aumentado para mejor distribución
const delay = Math.min(exponentialDelay + jitter, 60000); // Cap aumentado a 60s
```

### 3. Configuración por Defecto Ajustada
```javascript
const defaultConfig: any = {
  retry: 3,
  retryDelay: 2000, // Aumentado de 1s a 2s
};
```

## Beneficios

1. **Tolerancia a Cold Starts**: El timeout de 60 segundos permite que el backend despierte de su estado de hibernación
2. **Reintentos Inteligentes**: Los delays aumentados evitan sobrecargar un backend ya lento
3. **Mejor Experiencia de Usuario**: Menos errores de timeout, más solicitudes exitosas

## Consideraciones

- Estos timeouts son específicos para backends alojados en servicios gratuitos como Render
- En producción con un backend dedicado, estos valores podrían reducirse
- El usuario verá un loading más largo, pero menos errores

## Monitoreo

Para verificar si los cambios funcionan:
1. Abrir las DevTools del navegador
2. Ir a la pestaña Network
3. Realizar una búsqueda
4. Verificar que las solicitudes se completen exitosamente (aunque tarden más)

## Próximos Pasos

Si los timeouts siguen siendo un problema:
1. Considerar implementar un indicador de "backend despertando"
2. Añadir un sistema de pre-calentamiento del backend
3. Evaluar migrar a un plan de hosting con menos cold starts
# 🔧 Solución de Errores y Problemas de Rendimiento

## 📊 **Análisis de Problemas Identificados**

### **🔴 Problema Principal: Error 404 en API de Pokémon TCG**

**Error observado en logs:**
```
❌ Error en intento 1/3: {
  message: 'Request failed with status code 404',
  status: 404,
  url: 'https://api.pokemontcg.io/v2/cards?q=types%3A%22fire%22&page=1&pageSize=20&orderBy=name'
}
```

**Causa:** La API de Pokémon TCG ha cambiado su sintaxis o hay un problema con el encoding de la query string.

### **⚡ Problemas de Rendimiento**

1. **Cold Starts del Backend:** 40-50 segundos de respuesta
2. **Múltiples Reintentos:** 3 intentos por petición fallida
3. **Cache Miss Frecuentes:** Cache no optimizado
4. **Warning de Deprecación:** Módulo `punycode` obsoleto

---

## 🛠️ **SOLUCIONES IMPLEMENTABLES**

### **1. Solución Inmediata para Error 404**

#### **Opción A: Verificar Sintaxis de Query (Recomendado)**

Según la documentación oficial de Pokémon TCG API, prueba estos formatos alternativos:

```typescript
// En lugar de: types:"fire"
// Probar:
types:fire          // Sin comillas
type:fire           // Singular
types:Fire          // Con mayúscula
```

**Archivo a modificar:** `src/components/features/pokemon/SearchFilters.tsx` línea 86

```typescript
// ANTES (línea 86):
queryParts.push(`types:"${type}"`);

// DESPUÉS (probar una de estas opciones):
queryParts.push(`types:${type}`);        // Opción 1: Sin comillas
queryParts.push(`type:${type}`);         // Opción 2: Singular
queryParts.push(`types:${type.toLowerCase()}`); // Opción 3: Minúsculas
```

#### **Opción B: Implementar Fallback para Queries Problemáticas**

```typescript
// En src/lib/api.ts, función searchCards
const buildQuery = (params: PokemonCardSearchParams) => {
  if (params.q?.includes('types:"fire"')) {
    // Fallback para tipos problemáticos
    return params.q.replace('types:"fire"', 'types:fire');
  }
  return params.q;
};
```

### **2. Optimización de Rendimiento**

#### **A. Reducir Reintentos para Errores 404**

**Archivo:** `src/lib/api.ts`

```typescript
// Modificar la configuración de reintentos
const retryConfig = {
  retries: (retryCount: number, error: any) => {
    // No reintentar errores 404 (Not Found)
    if (error.response?.status === 404) {
      return false;
    }
    // Solo 1 reintento para otros errores
    return retryCount < 1;
  },
  retryDelay: 1000, // Reducir delay
};
```

#### **B. Mejorar Configuración de Cache**

**Archivo:** `src/lib/cache.ts`

```typescript
// Aumentar tiempo de cache para datos estáticos
export class PokemonCache {
  // Para tipos, sets, rarities (datos que cambian poco)
  static setStaticData(key: string, data: any) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      staleTime: 24 * 60 * 60 * 1000, // 24 horas
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  }
  
  // Para búsquedas (datos dinámicos)
  static setSearchData(key: string, data: any) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      staleTime: 5 * 60 * 1000, // 5 minutos
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  }
}
```

#### **C. Implementar Indicador de Cold Start**

**Archivo:** `src/components/common/shared/ConnectionStatus.tsx`

```typescript
// Añadir estado para cold start
const [isColdStart, setIsColdStart] = useState(false);

// Detectar cold start por tiempo de respuesta
useEffect(() => {
  const startTime = Date.now();
  
  // Si la primera petición tarda más de 10 segundos
  const coldStartTimer = setTimeout(() => {
    setIsColdStart(true);
  }, 10000);
  
  return () => clearTimeout(coldStartTimer);
}, []);

// Mostrar mensaje específico para cold start
if (isColdStart) {
  return (
    <div className="text-yellow-600">
      🔄 El servidor está despertando (cold start)... Esto puede tardar hasta 60 segundos.
    </div>
  );
}
```

### **3. Solución para Warning de Deprecación**

El warning `punycode` viene del backend. Si tienes acceso al código del backend:

```bash
# Actualizar dependencias en el backend
npm update
npm audit fix
```

### **4. Monitoreo y Debugging Mejorado**

#### **A. Logging Detallado**

**Archivo:** `src/lib/api.ts`

```typescript
// Añadir logging detallado para debugging
const logApiCall = (url: string, params: any, response: any, duration: number) => {
  console.group(`🔍 API Call: ${url}`);
  console.log('📤 Params:', params);
  console.log('📥 Response:', response);
  console.log(`⏱️ Duration: ${duration}ms`);
  console.groupEnd();
};
```

#### **B. Health Check Automático**

```typescript
// Verificar salud de la API periódicamente
const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API Health:', response.status);
    return true;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    return false;
  }
};

// Ejecutar cada 5 minutos
setInterval(checkApiHealth, 5 * 60 * 1000);
```

---

## 🚀 **Plan de Implementación Prioritario**

### **Fase 1: Solución Inmediata (30 minutos)**
1. ✅ Modificar formato de query en SearchFilters.tsx
2. ✅ Reducir reintentos para errores 404
3. ✅ Añadir logging detallado

### **Fase 2: Optimización (1 hora)**
1. ✅ Mejorar configuración de cache
2. ✅ Implementar indicador de cold start
3. ✅ Añadir health check automático

### **Fase 3: Monitoreo (30 minutos)**
1. ✅ Configurar alertas para errores frecuentes
2. ✅ Implementar métricas de rendimiento
3. ✅ Documentar patrones de error

---

## 🧪 **Testing de las Soluciones**

### **Verificar Solución del Error 404:**
```bash
# Probar manualmente la API
curl "https://api.pokemontcg.io/v2/cards?q=types:fire&page=1&pageSize=5"
curl "https://api.pokemontcg.io/v2/cards?q=type:fire&page=1&pageSize=5"
```

### **Monitorear Rendimiento:**
```javascript
// En DevTools Console
performance.mark('api-start');
// ... hacer petición API ...
performance.mark('api-end');
performance.measure('api-duration', 'api-start', 'api-end');
console.log(performance.getEntriesByName('api-duration'));
```

---

## 📈 **Métricas de Éxito**

- ✅ **Error 404 resuelto:** 0 errores en búsquedas de tipos
- ✅ **Tiempo de respuesta:** < 5 segundos para peticiones normales
- ✅ **Cache Hit Rate:** > 80% para datos frecuentes
- ✅ **Reintentos reducidos:** < 10% de peticiones con reintentos

---

## 🔗 **Referencias Útiles**

- [Pokémon TCG API Documentation](https://docs.pokemontcg.io/)
- [Render Cold Start Documentation](https://render.com/docs/free#cold-starts)
- [React Query Caching Guide](https://tanstack.com/query/latest/docs/react/guides/caching)

---

**Última actualización:** 2 de agosto de 2025
**Estado:** Pendiente de implementación
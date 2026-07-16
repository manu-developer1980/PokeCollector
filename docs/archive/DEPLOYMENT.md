# Guía de Despliegue - PokeCollector

## Configuración para Netlify

### Variables de Entorno Requeridas

En el panel de Netlify (Site settings > Environment variables), configura las siguientes variables:

#### Frontend (Netlify)
```
VITE_API_BASE=https://tu-backend-url.com/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_SUPABASE_SERVICE_KEY=tu_clave_de_servicio_de_supabase
```

#### Backend (donde despliegues el backend)
```
PORT=3000
BREVO_API_KEY=tu_clave_brevo_api
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_clave_de_servicio_de_supabase
```

### Pasos para el Despliegue

1. **Frontend en Netlify:**
   - Conecta tu repositorio de GitHub
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Configura las variables de entorno mencionadas arriba

2. **Backend:**
   - Despliega el backend en un servicio como Railway, Render, o Heroku
   - Asegúrate de configurar las variables de entorno del backend
   - Actualiza `VITE_API_BASE` en Netlify con la URL del backend desplegado

3. **CORS:**
   - El backend ya está configurado para aceptar requests desde `https://poke-collector.netlify.app`
   - Si tu dominio de Netlify es diferente, actualiza la configuración de CORS en `/backend/src/index.ts`

### Problemas Comunes

- **Error de CORS:** Verifica que la URL del frontend esté en la lista de orígenes permitidos del backend
- **API no encontrada:** Asegúrate de que `VITE_API_BASE` apunte a la URL correcta del backend en producción
- **Variables de entorno:** Recuerda que solo las variables que empiecen con `VITE_` estarán disponibles en el frontend

### Verificación

Después del despliegue, verifica:
- [ ] El formulario de contacto funciona correctamente
- [ ] Los emails se envían sin errores
- [ ] No hay errores de CORS en la consola del navegador
- [ ] Todas las funcionalidades del frontend funcionan correctamente
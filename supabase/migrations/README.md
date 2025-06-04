# Migraciones de PokéCollector

Este directorio contiene las migraciones de la base de datos para PokéCollector.

## Archivos de Migración

### ✅ Migración Consolidada Única

- **`20250120000020_consolidated_complete_schema.sql`** - Esquema completo consolidado que incluye:
  - **Tablas Principales**: users, collections, collection_cards, wishlist_cards, subscriptions
  - **Funcionalidades de Administración**: audit_logs, user_statistics, subscription_overrides
  - **Tablas de Soporte**: webhook_events, subscription_changes
  - **Funciones Optimizadas**: handle_new_user, delete_user_data, admin functions, statistics functions
  - **Seguridad Completa**: Políticas RLS no recursivas y eficientes para todas las tablas
  - **Rendimiento**: Índices estratégicos y triggers automáticos optimizados
  - **Configuración Completa**: Permisos, realtime, y documentación integrada

### 🗂️ Archivos de Soporte

- `validate_migrations.sql` - Script de validación para verificar la integridad de la migración
- `CONSOLIDATION_GUIDE.md` - Guía completa de uso y migración
- `OPTIMIZATION_REPORT.md` - Reporte detallado de optimizaciones aplicadas

## Características y Optimizaciones

### ✨ Funcionalidades Principales:

1. **Gestión de Usuarios**: Registro automático, perfiles, roles de administrador
2. **Sistema de Colecciones**: Creación manual de colecciones (no automática)
3. **Gestión de Cartas**: Colecciones y listas de deseos con metadatos completos
4. **Suscripciones**: Integración con Stripe y gestión de planes
5. **Panel de Administración**: Auditoría, estadísticas, y gestión de usuarios
6. **Seguridad**: RLS completo con políticas optimizadas y no recursivas

### 🚀 Optimizaciones Aplicadas:

- **Rendimiento**: Índices estratégicos para todas las consultas comunes
- **Seguridad**: Funciones con `SECURITY DEFINER` para operaciones privilegiadas
- **Mantenibilidad**: Código consolidado sin duplicaciones
- **Escalabilidad**: Triggers automáticos para estadísticas en tiempo real
- **Monitoreo**: Sistema de auditoría completo para acciones administrativas

### 📋 Instrucciones de Uso:

1. **Aplicar la Migración**:

   ```bash
   supabase db reset
   ```

2. **Validar la Instalación**:

   ```bash
   psql -f supabase/migrations/validate_migrations.sql
   ```

3. **Configurar Variables de Entorno**:
   ```env
   STRIPE_DEFAULT_PRICE_ID=your_stripe_price_id
   ```

### 🔧 Mantenimiento:

- Revisar periódicamente los índices de rendimiento
- Monitorear el crecimiento de la tabla audit_logs
- Actualizar el price_id de Stripe según sea necesario
- Ejecutar el script de validación después de cambios importantes

## Importante: No Creación Automática de Colecciones

Esta migración está diseñada específicamente para **NO crear colecciones automáticamente** cuando un usuario se registra. Las colecciones deben ser creadas manualmente por el usuario a través de la interfaz de la aplicación.

## Cómo Aplicar la Migración

Para aplicar esta migración, sigue estos pasos:

1. Resetea la base de datos de Supabase desde el panel de control:

   - Ve a la sección "Database" en el panel de Supabase
   - Busca la opción "Reset Database" y confirma la acción
   - Esto eliminará todos los datos existentes

2. Aplica la migración:

   ```bash
   supabase db reset
   ```

3. Verifica que la migración se haya aplicado correctamente:
   - Comprueba que las tablas se hayan creado
   - Verifica que las políticas de RLS estén configuradas
   - Asegúrate de que no se creen colecciones automáticamente al registrar un usuario

## Solución de Problemas

### Errores comunes al aplicar la migración

#### Error 1: Parámetro de función

Si encuentras un error como este al aplicar la migración:

```
ERROR:  42P13: cannot change name of input parameter "user_id_param"
HINT:  Use DROP FUNCTION delete_user_data(uuid) first.
```

Este error ocurre porque la función ya existe con un nombre de parámetro diferente. La migración ya incluye el código necesario para eliminar la función antes de recrearla, pero si aún así encuentras este error, puedes:

1. Conectarte directamente a la base de datos y ejecutar: `DROP FUNCTION IF EXISTS public.delete_user_data(UUID);`
2. Luego aplicar la migración nuevamente

#### Error 2: Relación no existe

Si encuentras un error como este:

```
ERROR: relation "public.users" does not exist (SQLSTATE 42P01)
At statement 2:
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users
```

Este error ocurre cuando intentamos eliminar un trigger de una tabla que aún no existe. La migración ha sido actualizada para evitar este problema, asegurándose de eliminar primero las funciones y luego las tablas (lo que también eliminará los triggers asociados).

### Creación automática de colecciones

Si sigues experimentando la creación automática de colecciones después de aplicar esta migración:

1. Verifica si hay Edge Functions que puedan estar creando colecciones
2. Comprueba si hay webhooks configurados que puedan estar creando colecciones
3. Revisa el código del frontend para asegurarte de que no haya llamadas automáticas a la API para crear colecciones
4. Revisa las funciones `initialize-user` en Supabase Edge Functions

Si el problema persiste, considera revisar los logs de la base de datos para identificar qué está creando las colecciones.

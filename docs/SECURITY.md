# 🔒 Guía de Seguridad - PokeCollector

Este documento describe las medidas de seguridad implementadas en PokeCollector para proteger los datos de los usuarios y mantener la integridad de la aplicación.

## 🛡️ Características de Seguridad Implementadas

### 1. Protección contra Contraseñas Comprometidas

**Estado**: ✅ **HABILITADO**

- **Tecnología**: Integración con HaveIBeenPwned.org
- **Función**: Previene que los usuarios utilicen contraseñas que han sido comprometidas en filtraciones de datos conocidas
- **Configuración**: Habilitado en `supabase/config.toml`

```toml
[auth.password]
enable_hibp_check = true
```

**Beneficios**:

- Protección proactiva contra ataques de credenciales comprometidas
- Mejora la seguridad general de las cuentas de usuario
- Cumplimiento con mejores prácticas de seguridad

### 2. Row Level Security (RLS) Optimizado

**Estado**: ✅ **IMPLEMENTADO**

- **Políticas consolidadas**: Eliminación de políticas duplicadas para mejor rendimiento
- **Optimización de consultas**: Uso de `(select auth.uid())` para evitar re-evaluaciones
- **Cobertura completa**: RLS habilitado en todas las tablas sensibles

**Tablas protegidas**:

- `users` - Datos de usuario
- `collections` - Colecciones de cartas
- `collection_cards` - Cartas en colecciones
- `subscriptions` - Información de suscripciones
- `user_statistics` - Estadísticas de usuario
- `audit_logs` - Registros de auditoría

### 3. Autenticación Robusta

**Características implementadas**:

- ✅ Verificación de email obligatoria
- ✅ Confirmación doble para cambios de email
- ✅ Rotación automática de tokens de actualización
- ✅ Expiración de sesiones configurada (1 hora)
- ✅ Protección PKCE para flujos OAuth

### 4. Configuración de Seguridad de Email

```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
secure_password_change = false
max_frequency = "1m0s"
otp_length = 6
otp_expiry = 86400
```

## 🔧 Configuración y Mantenimiento

### Verificar Estado de Seguridad

Para verificar que todas las características de seguridad están funcionando:

1. **Protección de contraseñas**: Intentar registrarse con una contraseña común (ej: "password123")
2. **RLS**: Verificar que los usuarios solo pueden acceder a sus propios datos
3. **Autenticación**: Probar flujos de registro, login y recuperación de contraseña

### Monitoreo de Seguridad

- **Logs de auditoría**: Revisar regularmente la tabla `audit_logs`
- **Intentos de acceso**: Monitorear patrones de autenticación inusuales
- **Políticas RLS**: Ejecutar asesores de rendimiento de Supabase periódicamente

## 📋 Lista de Verificación de Seguridad

- [x] Protección contra contraseñas comprometidas habilitada
- [x] Row Level Security configurado en todas las tablas
- [x] Políticas RLS optimizadas para rendimiento
- [x] Verificación de email obligatoria
- [x] Rotación de tokens habilitada
- [x] Configuración PKCE para OAuth
- [x] Límites de frecuencia para emails
- [x] Expiración de OTP configurada

## 🚨 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** la reportes públicamente
2. Contacta al equipo de desarrollo directamente
3. Proporciona detalles específicos sobre la vulnerabilidad
4. Incluye pasos para reproducir el problema si es posible

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [Row Level Security en PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Mejores Prácticas de Seguridad Web](https://owasp.org/www-project-top-ten/)

---

**Última actualización**: Enero 2025  
**Versión del documento**: 1.0

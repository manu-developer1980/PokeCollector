# Plan de Reorganización de la Estructura del Proyecto PokeCollector

## Problemas Identificados

### 1. Duplicación de Funcionalidades
- **lib/** y **utils/** contienen funcionalidades similares
- **components/shared/** y **components/ui/** tienen overlap
- Algunos componentes están mal categorizados

### 2. Estructura de Componentes Confusa
- **components/pages/** contiene componentes que no son páginas reales
- Mezcla de componentes de UI, páginas y funcionalidades específicas
- **LanguageSwitcher.tsx** está suelto en el directorio raíz de components

### 3. Organización Inconsistente
- Algunos directorios tienen pocos archivos
- Falta de separación clara entre features y componentes reutilizables

## Propuesta de Nueva Estructura

```
src/
├── components/
│   ├── ui/                     # Componentes base de UI (shadcn/ui)
│   ├── layout/                 # Componentes de layout y navegación
│   ├── common/                 # Componentes reutilizables comunes
│   └── features/               # Componentes específicos por feature
│       ├── auth/
│       ├── pokemon/
│       ├── subscription/
│       ├── admin/
│       ├── dashboard/
│       ├── account/
│       ├── pricing/
│       ├── checkout/
│       ├── settings/
│       ├── onboarding/
│       └── legal/              # Páginas legales y políticas
├── pages/                      # Componentes de página principales
├── hooks/                      # Custom hooks
├── lib/                        # Utilidades, servicios y configuraciones
├── types/                      # Definiciones de tipos TypeScript
├── contexts/                   # React contexts
├── i18n/                       # Internacionalización
└── assets/                     # Recursos estáticos (si los hay)
```

## Cambios Específicos a Realizar

### 1. Reorganizar components/
- Mover **components/pages/** → **pages/**
- Crear **components/features/** y mover:
  - auth/ → features/auth/
  - pokemon/ → features/pokemon/
  - subscription/ → features/subscription/
  - admin/ → features/admin/
  - dashboard/ → features/dashboard/
  - account/ → features/account/
  - pricing/ → features/pricing/
  - checkout/ → features/checkout/
  - settings/ → features/settings/
  - onboarding/ → features/onboarding/
- Crear **components/common/** y mover:
  - shared/ → common/
  - debug/ → common/debug/
  - cookies/ → common/cookies/
- Mover **LanguageSwitcher.tsx** → **components/common/**

### 2. Consolidar lib/ y utils/
- Mover todo de **utils/** → **lib/**
- Reorganizar lib/ en subcarpetas:
  - api/
  - services/
  - utils/
  - config/

### 3. Crear directorio pages/
- Mover componentes de página desde components/pages/
- Organizar por funcionalidad

### 4. Limpiar components/ui/
- Mantener solo componentes base de shadcn/ui
- Mover componentes específicos a common/ o features/

## Beneficios de la Nueva Estructura

1. **Separación clara de responsabilidades**
2. **Mejor escalabilidad** - fácil agregar nuevas features
3. **Imports más claros** y predecibles
4. **Mantenimiento simplificado**
5. **Onboarding más fácil** para nuevos desarrolladores
6. **Consistencia** en la organización

## Orden de Implementación

1. Crear nuevos directorios
2. Mover archivos manteniendo imports
3. Actualizar imports en archivos afectados
4. Verificar que todo funcione correctamente
5. Eliminar directorios vacíos
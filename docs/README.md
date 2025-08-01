# PokeCollector - Aplicación de Colección de Cartas Pokémon

Una aplicación web moderna para coleccionar y gestionar cartas Pokémon, construida con React, TypeScript, Vite y Supabase.

## 🔒 Características de Seguridad

### Protección de Contraseñas
- **Verificación de contraseñas comprometidas**: Integración con HaveIBeenPwned.org para prevenir el uso de contraseñas que han sido comprometidas en filtraciones de datos
- **Políticas RLS optimizadas**: Row Level Security configurado para máximo rendimiento y seguridad
- **Autenticación robusta**: Sistema de autenticación completo con verificación de email y recuperación de contraseña

### Configuración de Seguridad
La protección contra contraseñas comprometidas está habilitada en `supabase/config.toml`:
```toml
[auth.password]
enable_hibp_check = true
```

## 🚀 Tecnologías

Esta aplicación utiliza tecnologías modernas para ofrecer la mejor experiencia:

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

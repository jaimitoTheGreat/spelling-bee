# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# Spelling Bee 2026 - Sprint I

Aplicación web para la gestión de jueces y evaluación de participantes.

## Stack Tecnológico
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend / DB:** Supabase (PostgreSQL + Auth + RPC)
- **Estado del servidor:** React Query (@tanstack/react-query)
- **Formularios:** React Hook Form + Zod
- **Rutas:** React Router v7

## Requisitos previos
- Node.js v22.12+
- Una cuenta en Supabase

## Variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto frontend con:
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_publishable_key_aqui

# Spelling Bee Nova 2026 - Sprint II

Sistema integral de gestión de concurso de deletreo (organizador y jueces).

## Stack Tecnológico
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend / DB:** Supabase (PostgreSQL + Auth + RPC)
- **Estado del servidor:** React Query
- **Formularios:** React Hook Form + Zod
- **Rutas:** React Router v7
- **Testing:** Vitest + React Testing Library

## Configuración Local
1. Clona el repositorio e instala dependencias: `npm install`
2. Crea un archivo `.env.local` con:
   ```bash
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_publishable_key
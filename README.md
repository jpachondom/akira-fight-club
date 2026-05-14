# Akira Fight Club — Sistema de gestión

Sistema completo para academia de artes marciales y box en Chile.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de datos**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Deploy**: Vercel

## Instalación

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Crear archivo .env basado en .env.example
cp .env.example .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta en orden:
   - `supabase/migrations/001_schema.sql`
   - `supabase/seed.sql`
3. En **Authentication > Settings**, configura:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URLs: `https://tu-dominio.vercel.app/**`
4. En **Storage**, crea el bucket `avatars` (público)
5. Copia las keys de **Project Settings > API** a tu `.env`

## Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GYM_WHATSAPP=56912345678
VITE_GYM_NAME=Akira Fight Club
```

## Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Agregar las mismas variables de entorno en el dashboard de Vercel.

## Crear el primer admin

1. En Supabase > Authentication > Users, crea un usuario
2. En SQL Editor:
   ```sql
   UPDATE profiles SET rol = 'admin' WHERE email = 'admin@akira.cl';
   ```

## Estructura

```
src/
├── app/
│   ├── admin/       # Portal administrador
│   └── alumno/      # Portal alumno
├── components/
│   ├── ui/          # Componentes reutilizables
│   └── admin/       # Layout admin
├── hooks/           # Custom hooks (datos)
├── lib/             # Supabase, WhatsApp, exports, utils
├── schemas/         # Validación Zod
├── stores/          # Estado global Zustand
└── types/           # TypeScript types
```

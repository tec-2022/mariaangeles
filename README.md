# Sitio de María Ángeles Quezada

Aplicación Vite + React para presentar el trabajo académico de María Ángeles Quezada. El proyecto usa datos locales simulados para que la experiencia funcione sin depender de servicios externos.

## Running the app

```bash
npm install
npm run dev
```

## Building the app

```bash
npm run build
```

## Base de datos (Supabase)

Se incluye un script SQL para crear todas las tablas usadas por el sitio y precargar los datos de ejemplo que hoy viven en el cliente local. Puedes ejecutarlo en el editor SQL de Supabase o con `psql`:

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
```

El esquema cubre entradas para blog, eventos, publicaciones, podcast, noticias, galería, contactos, suscriptores, analítica básica y configuración del sitio.
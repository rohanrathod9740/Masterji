# Frontend

This folder contains the Next.js frontend for the Masterji project.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Project Structure

- `src/app/` - App Router pages and API route handlers
- `src/components/` - Reusable UI and feature components
- `src/lib/` - Backend proxy helpers and shared utilities
- `src/services/` - Frontend API request helpers
- `src/types/` - Shared TypeScript types
- `public/` - Static assets

## Environment Variables

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Use these values:

- `BACKEND_API_BASE_URL` - Backend server URL used by the Next.js API routes
- `NEXT_PUBLIC_API_BASE_URL` - Optional public base URL for the frontend API gateway. Leave blank to use same-origin requests.

By default, the frontend expects the backend to run on `http://localhost:5000`, which matches the backend code committed in this repository.

## Run Locally

```bash
npm install
npm run dev
```

The app will start on `http://localhost:3000`.

## Production Check

```bash
npm run lint
npm run build
```

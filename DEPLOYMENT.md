# StudyMate hosting package

The project root is the deployable Next.js application. Upload or connect this
folder to the hosting provider; do not create a second nested web-app folder.

## Included in the web deployment

- `app/` — Next.js pages and API routes
- `components/` — shared UI and reader components
- `lib/` — AI, RAG, Supabase, preferences, and ingestion logic
- `types/` — TypeScript contracts
- `supabase/schema.sql` — database, vector search, storage, and RLS setup
- `package.json` and `package-lock.json` — reproducible install/build
- `next.config.*`, `tsconfig.json`, and `next-env.d.ts` — framework configuration
- `README.md`, `LICENSE`, and product documentation

## Excluded from hosting

- `.env.local` and all secret files
- `node_modules/` and `.next/`
- `.DS_Store` and TypeScript build info
- `WisprClone/` — separate native Swift prototype
- `docs/wispr/` — documentation for that separate prototype

These exclusions are enforced by `.gitignore` for local work and
`.vercelignore` for Vercel uploads. Configure secrets only in the hosting
provider's encrypted environment settings.

## Vercel settings

- Framework preset: Next.js
- Root directory: project root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave blank/default

Required production environment variables are listed in `.env.example` and
`README.md`. Never copy the values from `.env.local` into the repository.

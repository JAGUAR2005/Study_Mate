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
`.vercelignore` for Vercel uploads. Render deploys from the Git repository,
so the same `.gitignore` rules keep excluded files out of the repository.
Configure secrets only in the hosting provider's encrypted environment
settings.

## Render settings

- Service type: Web Service
- Runtime: Node
- Root directory: project root
- Region: Virginia (or the nearest available region)
- Instance: Free for demo/testing
- Build command: `npm install && npm run build`
- Start command: `npm run start -- --hostname 0.0.0.0`

Render supplies the `PORT` value automatically. Do not add a custom `PORT`
environment variable.

After the first successful deploy, set the Supabase Authentication Site URL
and Redirect URL to the live Render URL if your Supabase project requires URL
allowlisting. StudyMate currently uses anonymous sessions and does not collect
email or password credentials:

```text
https://YOUR-RENDER-SERVICE.onrender.com
```

Deployment URL: `PASTE_RENDER_DEPLOYMENT_URL_HERE`

Required production environment variables are listed in `.env.example` and
`README.md`. Never copy the values from `.env.local` into the repository.

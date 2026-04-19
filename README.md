# SkillBase

SkillBase is a private internal marketplace for reusable company skills and
workflows. It stores a common internal skill standard that teammates can reuse
in the AI tools they already work with.

The product is not a public marketplace and does not sell anything. It is a
company-scoped workspace for creating, organizing, approving, discovering,
sharing, and installing internal skills.

## Current Status

Milestone 1 foundation is in progress.

Built now:

- Next.js App Router app ready for Vercel
- Supabase SSR clients, session refresh proxy, and service-role admin client
- Local environment setup using `.env.local`
- Minimal public landing page with login only
- Internal username/password login route with no public signup
- Protected catalog browse and skill detail routes
- Protected skill sharing and publish route
- Admin-only company management for active users, pending invitations,
  registration link copying, deactivation, and permanent user deletion
- Supabase migration, bootstrap, check, and seed scripts
- Living project documentation

Not built yet:

- Persistent skill editing forms
- Install/export packaging for the common SkillBase standard
- Approval workflows, collections, favorites, and changelog UI

## Local Setup

Install dependencies:

```bash
npm install
```

Copy the local Supabase variables into `.env.local`. This repo keeps `.env` and
`.env.local` untracked.

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
SKILLBASE_WORKSPACE_NAME=
SKILLBASE_WORKSPACE_SLUG=
SKILLBASE_BOOTSTRAP_EMAIL=
SKILLBASE_BOOTSTRAP_PASSWORD=
SKILLBASE_BOOTSTRAP_USERNAME=
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Route model:

- `/` is a minimal public landing page.
- `/login` is the internal sign-in page.
- `/skills` is the signed-in company home and catalog.
- `/company` is the admin-only company management area.
- `/register` completes registration from an admin-created link.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

Browser verification uses Playwright CLI. Keep `npm run dev` running in one
terminal, then run:

```bash
npm run browser:open
npm run browser:snapshot
npm run browser:console
npm run browser:close
```

Use `browser:snapshot` for an accessibility snapshot and `browser:console` to
check browser warnings and errors.

Database setup uses the connected Supabase project:

```bash
npm run db:check
npm run db:migrate
npm run db:bootstrap
npm run db:seed
npm run db:check
```

`db:migrate` requires `SUPABASE_DB_URL`, the direct Supabase Postgres connection
string. API keys alone can read and write existing REST tables, but they cannot
create tables or apply SQL migrations.

## Project Docs

- [Agent operating guide](./AGENTS.md)
- [Claude project guide](./CLAUDE.md)
- [Product direction](./docs/product-direction.md)
- [Roadmap and status](./docs/roadmap.md)
- [Decisions](./docs/decisions.md)

## Implementation Notes

Supabase clients live under `src/lib/supabase`.

- `browser.ts` creates a cookie-aware browser client.
- `server.ts` creates a cookie-aware Server Component / Server Action client.
- `admin.ts` creates the service-role client for trusted server-only reads and
  local scripts.
- The service role key must never be imported into client components or exposed
  in rendered UI.

Skill seed data lives under `src/lib/skills`. The first Supabase migration lives
under `supabase/migrations` and should be reviewed before it is applied to a
remote project.

# AppShot Studio Boilerplate

Production-minded SaaS starter for a template-based App Store/mobile screenshot generator.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- Auth.js (`next-auth@5` beta) with credentials auth
- Zod validation
- Server actions + route handlers

## Project Structure

```text
src/
  app/
    (marketing)/
    (auth)/
    (app)/app/
    (admin)/admin/
    api/
  components/
    ui/
    admin/
    app/
    editor/
  features/
    auth/
    assets/
    templates/
    projects/
    exports/
    editor/
  lib/
    db/
    permissions/
    storage/
    utils/
    validations/
prisma/
  schema.prisma
  seed.ts
  migrations/
```

## App Areas

- `/(marketing)`: landing, showcase placeholder, pricing placeholder
- `/(auth)`: sign in / sign up
- `/app/*`: authenticated user area
- `/admin/*`: admin area

Both `/app/*` and `/admin/*` are protected by middleware and server-side guards (`requireUser`, `requireAdmin`).

## Auth and RBAC

- Credentials sign-up/sign-in with `bcryptjs` password hashing
- JWT-backed Auth.js session
- Role enum: `ADMIN`, `USER`
- Helpers:
  - `getCurrentUser`
  - `requireUser`
  - `requireAdmin`

Server-side authorization is enforced for admin/user actions and API routes.

## Data Model

Implemented models:

- `User`
- `Asset`
- `Template`
- `TemplateElement`
- `Project`
- `ProjectElementOverride`
- `Export`

Notes:

- Template element defaults and user overrides are stored separately.
- `TemplateElement.dataJson` and `ProjectElementOverride.overriddenPropsJson` store serialized JSON strings.
- Useful indexes are defined for user ownership, status, and list queries.

## Editor Foundation

- Admin template editor:
  - Add text/image elements
  - Drag/resize elements
  - Reorder layers
  - Lock/unlock
  - Toggle `editableByUser`
  - Save template elements
- User project editor:
  - Loads template + overrides merged state
  - Adds custom text overlays and graphic overlay layers
  - Deletes user-created custom layers
  - Switches device canvas presets (iPhone and Android phone sizes)
  - Supports multiple screens per project
  - Supports bulk export for all screens
  - Text controls: font family, text color, normal/bold/italic
  - Allows edits only for `editableByUser && !locked`
  - Text editing and image replacement upload
  - Persists full editor state (template overrides + custom elements + canvas size)
  - PNG export via `html-to-image` and server-side persisted `Export` record

## Upload and Storage

- Local storage abstraction: `src/lib/storage/local-storage.ts`
- Upload target folders:
  - `public/uploads`
  - `public/exports`
- API routes:
  - `POST /api/uploads`
  - `POST /api/projects/:projectId/export`

This keeps development self-contained and swappable to S3 later.

## Server vs Client Components

Server components by default:

- Route layouts/pages (marketing/auth/app/admin)
- Data-fetching and protected pages

Client components only where interactivity is required:

- Auth form state handling
- Asset upload form
- Editors (`react-rnd`, in-browser export trigger)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Run Prisma migrate:

```bash
npm run db:migrate
```

4. Seed database:

```bash
npm run db:seed
```

5. Start dev server:

```bash
npm run dev
```

## Seeded Credentials

- Admin:
  - email: `admin@appshots.local`
  - password: `Admin123!`
- User:
  - email: `user@appshots.local`
  - password: `User123!`

## Useful Commands

```bash
npm run lint
npm run build
npm run plesk:build
npm run db:studio
```

## Plesk Deployment Notes

Use Node 22 for this project. The repo includes `.node-version` and `package.json` engines for Node 22, but Plesk may still need the Node version selected in the domain's Node.js settings.

If Plesk shows `nodenv: node: command not found`, select Node 22 in Plesk or run:

```bash
cd /var/www/vhosts/appshotstudio.cc/httpdocs
nodenv local 22
nodenv rehash
node -v
npm -v
```

Recommended Plesk Node.js settings:

```text
Application root: /httpdocs
Document root: /httpdocs/public
Application startup file: server.js
Application mode: production
```

Before building on a fresh SQLite database, create the Prisma tables:

```bash
npm install
npm run db:push
npm run db:seed
npm run build
```

`npm run db:seed` is optional, but the public template pages will be empty without seeded demo templates. You can also use the combined Plesk build command:

```bash
npm run plesk:build
```

For production auth, use a separate Auth.js secret, not the Google OAuth secret:

```bash
openssl rand -base64 32
```

Example production env:

```env
AUTH_URL="https://appshotstudio.cc"
NEXTAUTH_URL="https://appshotstudio.cc"
AUTH_SECRET="generated-base64-secret"
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

Add this Authorized redirect URI to the Google OAuth client:

```text
https://appshotstudio.cc/api/auth/callback/google
```

## Architectural Decisions

- Domain-oriented structure in `features/*`
- Server-side permission enforcement as source of truth
- App Router route groups + nested layouts
- SQLite + local filesystem for zero-infra local development
- Template defaults and user overrides split for future multi-tenant/team use cases
- Foundations support future extension for billing, localization, and teams

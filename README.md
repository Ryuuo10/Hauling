# KadaGo

React + TypeScript + Vite + Tailwind frontend with a Node.js authentication backend and MongoDB account storage.

## Structure

```text
frontend/
  index.html
  vite.config.ts
  tsconfig.json
  src/
    App.tsx
    main.tsx
    index.css
    api/                   # Browser API clients
    assets/                # Existing branding and imported assets
    components/            # Shared splash and Google sign-in UI
    data/                  # Prototype dispatch data and types
    features/
      customer/
      operator/
      fleet/
      admin/
      hauling/             # Agreements, trips, evidence, payments, shared UI
backend/
  src/                     # Authentication API, environment loader, Node server
  scripts/                 # Database checks and admin provisioning
  tests/                   # Backend tests
  .env.example
  .env                     # Local credentials, ignored by version control
dist/                      # Generated frontend build
package.json               # Shared dependencies and root commands
vite.config.ts             # Forwards to frontend/vite.config.ts
tsconfig.json              # Extends frontend/tsconfig.json
```

## Commands

Run all commands from the project root. One dependency installation serves both folders; no separate install is required inside them.

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Frontend and authentication API at `http://localhost:8443` |
| `npm run typecheck` | Check frontend TypeScript |
| `npm run test:auth` | Run backend tests |
| `npm run check-db` | Check the configured MongoDB connection |
| `npm run create-admin` | Provision an administrator using backend environment settings |
| `npm run build` | Build the frontend into root `dist/` |
| `npm start` | Serve the built frontend and API with Node, default port 3001 |
| `npm run preview` | Preview the frontend build only; use `npm start` for authentication |

The existing development server already runs in Figma Make. Source edits reload automatically. Root configuration forwarding files and root `dist/` preserve the existing preview and deployment commands.

The `@/` import alias points to `frontend/src/`. Portal screens are grouped by role; shared hauling screens live in `features/hauling/`. Existing `Rider` component names and authentication role values are retained for compatibility with truck operator accounts.

## Backend configuration

Use `backend/.env.example` as the template for local credentials in `backend/.env`. Only Node reads that file. See [AUTH_SETUP.md](AUTH_SETUP.md) for Google sign-in, MongoDB, administrator setup, and deployment instructions.

Authentication uses the backend. Booking, dispatch, tracking, and payment screens currently use prototype business data; organizing the folders does not add persistence for those features.

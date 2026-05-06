# Jaza Venus — Warehouse Management System

Modern replacement for the legacy VB.NET + SQL Server warehouse application.

- **Backend**: .NET 10 LTS (ASP.NET Core + EF Core 10)
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Database**: PostgreSQL 17 (via EF Core + Npgsql; runs in Docker for dev)
- **Auth**: ASP.NET Core Identity + cookie sessions + CSRF + MFA (TOTP) for SuperAdmin
- **Hosting**: Linux VPS + Docker + Caddy auto-HTTPS, behind Cloudflare

## Repository layout

```
backend/
  src/
    Jaza.Domain/          # Entities, value objects, business rules (no dependencies)
    Jaza.Application/     # Use cases, DTOs, validators, interfaces
    Jaza.Infrastructure/  # EF Core, Identity, repositories, external services
    Jaza.Api/             # ASP.NET Core Web API + security middleware
    Jaza.Migration/       # One-off ETL console: legacy SQL Server -> new schema
  tests/
    Jaza.Application.Tests/
    Jaza.Api.IntegrationTests/
frontend/
  src/
    app/                  # routes
    features/             # items, suppliers, inbound, invoices, ...
    components/ui/        # shadcn/ui (you own this code)
    lib/                  # api client, auth, utils
docs/
  README.md               # index linking all documentation
  architecture.md         # layers, auth, hosting
  development.md          # local workflow, tests, SPA publish
  http-api.md             # route catalogue
  discovery-checklist.md  # what to capture from the legacy app (Phase 0)
  legacy-schema-extract.sql
  security.md             # OWASP Top-10 controls applied here
  runbook.md              # backup/restore, deploy, rollback
  schema-mapping.md       # legacy table -> new entity map
deploy/
  docker-compose.yml
  Caddyfile
.github/workflows/ci.yml
```

## Quick start (developer)

Prereqs: .NET 10 SDK, Node 22, Docker Desktop, Git.

```powershell
# 1. Start PostgreSQL in Docker
docker compose -f deploy/docker-compose.dev.yml up -d postgres

# 2. Backend
cd backend
dotnet restore
dotnet ef database update --project src/Jaza.Infrastructure --startup-project src/Jaza.Api
dotnet run --project src/Jaza.Api

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

API → https://localhost:5001  
Frontend → http://localhost:5173  
Default SuperAdmin email (dev only): `superadmin@jaza.local`. If no seed password is configured, the API generates
one on first boot and prints it in the startup log. Demo users are seeded only when `Seed:IncludeDemoUsers=true`.

## Documentation

Structured docs live under [`docs/`](docs/). Start from [`docs/README.md`](docs/README.md) for the index (architecture, HTTP API shape, development, security, runbook, migration).

## Production deployment

See [`docs/runbook.md`](docs/runbook.md).

## Security

See [`docs/security.md`](docs/security.md) — OWASP Top-10 mitigations and operational checklist.

## License

Proprietary © Jaza.

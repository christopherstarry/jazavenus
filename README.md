# Jaza Venus — Warehouse Management System

Modern replacement for the legacy VB.NET + SQL Server warehouse application.

- **Backend**: .NET 10 LTS (ASP.NET Core + EF Core 10)
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Database**: SQL Server (kept from legacy system; runs in Docker for dev)
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
# 1. Start SQL Server in Docker
docker compose -f deploy/docker-compose.dev.yml up -d sqlserver

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
Default super-admin (dev only): `superadmin@jaza.local` / `ChangeMe!2026` (you must rotate on first login)

## Production deployment

See [`docs/runbook.md`](docs/runbook.md).

## Security

See [`docs/security.md`](docs/security.md) — OWASP Top-10 mitigations and operational checklist.

## License

Proprietary © Jaza.

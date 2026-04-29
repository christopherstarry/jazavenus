# Setup — developer machine

## Prereqs

| Tool | Version | Install (Windows) |
|---|---|---|
| .NET SDK | 10.0.x LTS | `winget install Microsoft.DotNet.SDK.10` |
| Node.js | 22.x LTS | `winget install OpenJS.NodeJS.LTS` |
| Git | latest | `winget install Git.Git` |
| Docker Desktop | latest | `winget install Docker.DockerDesktop` |
| EF Core CLI | 10.0.x | `dotnet tool install --global dotnet-ef --version 10.0.0` |

## First-time setup

```powershell
# 1. Clone (or open) the repo
cd "Jaza Venus"

# 2. Trust the dev HTTPS cert
dotnet dev-certs https --trust

# 3. Bring up SQL Server (and Seq for log viewing) in Docker
docker compose -f deploy/docker-compose.dev.yml up -d

# 4. Apply migrations
cd backend
dotnet ef database update --project src/Jaza.Infrastructure --startup-project src/Jaza.Api

# 5. Run the API
dotnet run --project src/Jaza.Api
# -> https://localhost:5001  (Scalar API browser)
# Watch the log for: "Generated initial SuperAdmin password"

# 6. New terminal — run the SPA
cd frontend
npm install   # first time only
npm run dev
# -> http://localhost:5173
```

## Daily

```powershell
docker compose -f deploy/docker-compose.dev.yml up -d
dotnet run --project backend/src/Jaza.Api          # terminal 1
npm --prefix frontend run dev                       # terminal 2
```

Logs in **Seq**: <http://localhost:5341>.

## Test suites

```powershell
# Backend unit + integration
cd backend
dotnet test

# Frontend unit
cd ../frontend
npm test

# E2E (requires both API and SPA running)
npm run test:e2e
```

## Adding a new entity (the recipe)

1. Add the entity class under `backend/src/Jaza.Domain/<Area>/`.
2. Register a `DbSet` and any indexes/relationships in `AppDbContext`.
3. `dotnet ef migrations add <Name> --project backend/src/Jaza.Infrastructure --startup-project backend/src/Jaza.Api --output-dir Persistence/Migrations`.
4. Add DTOs + FluentValidation validator under `backend/src/Jaza.Application/<Area>/`.
5. Add a controller action (or extend an existing controller) under `backend/src/Jaza.Api/Controllers/`.
6. Add a feature folder under `frontend/src/features/<entity>/` and a route in `app/router.tsx`.
7. Add an xUnit test for the business rule and a Playwright smoke test for the page.

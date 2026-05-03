# Development guide — Jaza Venus

Prerequisites: **.NET 10 SDK**, **Node.js 22+**, **Docker Desktop** (for PostgreSQL locally), Git.

## Run PostgreSQL (dev)

From the repo root:

```powershell
docker compose -f deploy/docker-compose.dev.yml up -d postgres
```

## Run the API

```powershell
cd backend
dotnet restore
dotnet ef database update --project src/Jaza.Infrastructure --startup-project src/Jaza.Api
dotnet run --project src/Jaza.Api
```

- API (Kestrel): `https://localhost:5001` (see launch settings if your port differs).
- Health: `GET https://localhost:5001/health`

## Run the SPA (dev)

```powershell
cd frontend
npm install
npm run dev
```

- Vite: `http://localhost:5173`
- CORS in `appsettings.json` allows this origin with credentials.

The SPA defaults to **light** theme (no saved preferences). Users can switch to dark or follow the OS in **Settings**. Theme is stored in `localStorage` under `jaza.settings.v1`.

### Seeded SuperAdmin (development)

Default account is described in the root [README.md](../README.md). On first login you may need to satisfy MFA settings — see `Auth:RequireSuperAdminMfa` in `appsettings.Development.json`.

## Tests

**Backend**

```powershell
cd backend
dotnet test
```

**Frontend**

```powershell
cd frontend
npm test
npm run test:e2e    # Playwright (when configured)
```

## Building the SPA into the API `wwwroot`

Publishing the API can embed the React build:

1. Set **`JAZA_VITE_OUTDIR`** to the API `wwwroot` folder (the MSBuild target in `Jaza.Api.csproj` does this during `dotnet publish`).
2. Or build manually:

```powershell
cd frontend
$env:JAZA_VITE_OUTDIR = "..\backend\src\Jaza.Api\wwwroot"
npm run build
```

Then run or publish the API — `MapFallbackToFile("index.html")` serves the SPA for non-API routes.

To skip embedding (e.g. CI without Node):

```powershell
dotnet publish -p:SkipSpaPublish=true
```

## API exploration (Development)

With `dotnet run` in Development, use **Scalar** / **OpenAPI** (see [http-api.md](http-api.md)) to try endpoints. Remember cookies + antiforgery for mutating calls from tools like `curl`; the browser SPA handles this automatically.

## ETL migration tool

The **`Jaza.Migration`** console project loads its own configuration — see [migration-howto.md](migration-howto.md). It is not started by the web host.

## Code map

| Area | Location |
|------|-----------|
| Module navigation & routes | `frontend/src/app/modules.tsx`, `frontend/src/app/router.tsx` |
| API client / auth helpers | `frontend/src/lib/` |
| REST controllers | `backend/src/Jaza.Api/Controllers/` |
| EF Core & Identity | `backend/src/Jaza.Infrastructure/` |
| Business rules & DTOs | `backend/src/Jaza.Application/` |

For security-sensitive behaviour, cross-check [security.md](security.md).

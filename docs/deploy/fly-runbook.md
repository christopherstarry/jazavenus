# Deploying Jaza Venus to Fly.io

Plain-language guide for whoever runs the deploy. If something here doesn't match what you see, the source of truth is `deploy/fly.toml` and `.github/workflows/deploy-fly.yml`.

## What we run on Fly

| Piece            | Runs where           | Why                                                                                       |
| ---------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| Backend (.NET)   | Fly.io machine       | Auto-scales to zero when idle, comes back in seconds.                                     |
| PostgreSQL 17    | **Neon.tech** (NOT Fly) | Managed database with generous free tier; Singapore region (ap-southeast-1).           |
| Frontend (React) | GitHub Pages         | Static SPA; configured via `.github/workflows/deploy-frontend-github-pages.yml`.          |

## One-time setup

1. **Install `flyctl`** — see <https://fly.io/docs/hands-on/install-flyctl/>.
2. **Sign in:** `flyctl auth login`.
3. **Create the app:** `flyctl apps create jaza-venus` (region picked at deploy time from `deploy/fly.toml`).
4. **Set the secrets** (every value you would NOT want in git). Run from the repo root:

   ```bash
   flyctl secrets set --app jaza-venus \
     ConnectionStrings__Default="Host=ep-...neon.tech;Port=5432;Database=neondb;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true;Channel Binding=Disable" \
     Auth__Jwt__SigningKey="$(openssl rand -base64 64)" \
     Auth__Jwt__Issuer="jaza-venus" \
     Auth__Jwt__Audience="jaza-venus-app" \
     Auth__Jwt__AccessTokenMinutes="15" \
     Auth__Jwt__RefreshTokenHours="24" \
     Seed__SuperAdminEmail="owner@jaza.local" \
     Seed__SuperAdminPassword=""
   ```

   Leave `Seed__SuperAdminPassword` blank on first boot — the API generates a strong one and prints it to the log. Reset it after first login.

5. **Add a GitHub secret** named `FLY_API_TOKEN` (run `flyctl auth token` and paste). Optionally add a repo *variable* `FLY_APP` if you want to deploy something other than `jaza-venus`.

## Continuous deploys

Every push to `main` that touches `backend/**` or the Fly config triggers `.github/workflows/deploy-fly.yml`:

- builds the Docker image **on Fly's builders** (`--remote-only`) so we don't ship gigabytes from CI;
- rolls out one machine at a time (`--strategy rolling`) — no downtime;
- runs `GET /health` six times after the deploy and fails the workflow if it never returns 200.

You can also kick a deploy manually: GitHub → Actions → "Deploy to Fly.io" → Run workflow.

## Manual deploy from your laptop

```bash
flyctl deploy \
  --app jaza-venus \
  --config deploy/fly.toml \
  --dockerfile deploy/api.Dockerfile \
  --remote-only
```

## Database migrations

Migrations run **automatically on every boot** via `DbInitializer`. There is no separate migration job. If you add a new migration:

```bash
cd backend
dotnet ef migrations add YourMigrationName \
  --project src/Jaza.Infrastructure \
  --startup-project src/Jaza.Api \
  --output-dir Persistence/Migrations
```

Then push to `main`. The next deploy applies it.

## Rolling back

Fly keeps your previous machine images. Use:

```bash
flyctl releases --app jaza-venus       # pick the version you want
flyctl deploy --app jaza-venus --image registry.fly.io/jaza-venus:deployment-<version>
```

Or, faster:

```bash
flyctl scale count 0 --app jaza-venus  # take it offline
flyctl scale count 1 --app jaza-venus  # bring it back; latest image will be used
```

If the bad release is already in production *and* it migrated the database in a way you can't roll back, the safest path is to fix forward (push a corrective commit) — never run `flyctl machine destroy` against a Fly machine that's mid-migration.

## Logs and live debugging

```bash
flyctl logs --app jaza-venus              # tail
flyctl ssh console --app jaza-venus       # shell into the running machine
flyctl status --app jaza-venus            # health, machines, regions
```

Inside the SSH shell the API logs are at `/app/logs/jaza-api-YYYY-MM-DD.log` (Serilog rolling file).

## Cold start expectations

- Fly machines auto-stop after ~5 min idle and auto-start on the next request. Wake-up takes ~3-6 seconds.
- Neon also auto-suspends and warms up in ~1-2 seconds. The Npgsql connection has retry-on-failure configured so the very first request after suspension may take ~10s but will succeed.
- We keep `min_machines_running = 1` in `fly.toml` so the day-shift never sees a cold start. Drop it to `0` to save money during long holidays.

## Frontend pointing at production API

The SPA's Vite dev proxy points `/api` to `https://localhost:5001`. **GitHub Pages is static** — there is no same-origin `/api`, so the built SPA must call the Fly API explicitly.

1. Set **`VITE_API_BASE_URL`** at build time to your public API root, e.g. `https://<app>.fly.dev/api` (see [`frontend/.env.example`](../../frontend/.env.example)).
2. Add the SPA **origin** to `Cors:AllowedOrigins` for the API (e.g. `https://christopherstarry.github.io` for project sites under `/<repo>/`). The browser sends `Origin: https://<user>.github.io`, not a path-specific origin.

The [`deploy-frontend-github-pages`](../../.github/workflows/deploy-frontend-github-pages.yml) workflow sets `VITE_API_BASE_URL` from the repository variable `VITE_API_BASE_URL`, or defaults to `https://${FLY_APP}.fly.dev/api` (repository variable `FLY_APP`, default `jaza-venus`).

## Cost & limits today

- Fly: 1 shared-cpu-1x VM at 512 MB → free tier covers a single always-on instance.
- Neon: Free tier is 3 GB storage / 10 active hours / day. Upgrade to "Launch" tier ($19/mo) before going live with real users.
- GitHub Pages: free for public repos.

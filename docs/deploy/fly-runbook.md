# Deploying Jaza Venus to Fly.io

Plain-language guide for whoever runs the deploy. If something here doesn't match what you see, the source of truth is `fly.toml` (repo root) and `.github/workflows/deploy-fly.yml`.

## What we run on Fly

| Piece            | Runs where           | Why                                                                                       |
| ---------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| Backend (.NET)   | Fly.io machine       | Auto-scales to zero when idle, comes back in seconds.                                     |
| PostgreSQL 17    | **Neon.tech** (NOT Fly) | Managed database with generous free tier; Singapore region (ap-southeast-1).           |
| Frontend (React) | Vercel               | Static SPA. Vercel rewrites `/api/*` to the Fly API.                                      |

## One-time setup

1. **Install `flyctl`** — see <https://fly.io/docs/hands-on/install-flyctl/>.
2. **Sign in:** `flyctl auth login`.
3. **Create the app:** `flyctl apps create jaza-venus` (region picked at deploy time from `fly.toml`).
4. **Set the secrets** (every value you would NOT want in git). Run from the repo root:

   ```bash
   flyctl secrets set --app jaza-venus \
     ConnectionStrings__Default="Host=ep-...neon.tech;Port=5432;Database=neondb;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true;Channel Binding=Disable" \
     Jwt__SigningKey="$(openssl rand -base64 64)" \
     Jwt__Issuer="jaza-venus" \
     Jwt__Audience="jaza-venus-app" \
     Seed__SuperAdminEmail="owner@jaza.local" \
     Seed__SuperAdminPassword=""
   ```

   Leave `Seed__SuperAdminPassword` blank on first boot — the API generates a strong one and prints it to the log. Reset it after first login.

5. **Add a GitHub secret** named `FLY_API_TOKEN` (run `flyctl auth token` and paste). Optionally add a repo *variable* `FLY_APP` if you want to deploy something other than `jaza-venus`.

## Continuous deploys

Every push to `main` that touches `backend/**`, `deploy/api.Dockerfile`, or `fly.toml` triggers `.github/workflows/deploy-fly.yml`:

- builds the Docker image **on Fly's builders** (`--remote-only`) so we don't ship gigabytes from CI;
- rolls out one machine at a time (`--strategy rolling`) — no downtime;
- runs `GET /health` six times after the deploy and fails the workflow if it never returns 200.

You can also kick a deploy manually: GitHub → Actions → "Deploy to Fly.io" → Run workflow.

## Manual deploy from your laptop

```bash
flyctl deploy \
  --app jaza-venus \
  --config fly.toml \
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

## Vercel frontend pointing at the Fly API

The SPA calls same-origin `/api`. In production, Vercel rewrites those requests to Fly, so the browser does not need to call the Fly domain directly.

1. Keep [`frontend/vercel.json`](../../frontend/vercel.json) with the `/api/(.*)` rewrite to `https://jaza-venus.fly.dev/api/$1`.
2. Add the Vercel origin to `Cors:AllowedOrigins` for direct fallback/API tools: `https://jazavenus.vercel.app`.
3. Redeploy Vercel after config changes.

## Troubleshooting: SPA login says "check your connection"

- **Wrong API hostname:** The Fly app name in [`fly.toml`](../../fly.toml) (`app = "jaza-venus"`) becomes **`https://jaza-venus.fly.dev`**. There is no `https://jaza-venus-api.fly.dev` unless you create a separate Fly app with that exact name. `nslookup` should return addresses for your real hostname.
- **Vercel rewrite:** `/api/auth/login` should be proxied by Vercel to `https://jaza-venus.fly.dev/api/auth/login`. Remove `VITE_API_BASE_URL` from Vercel unless you intentionally want direct browser-to-Fly calls.
- **API never deployed:** In the Fly dashboard (or `flyctl status`), the app should show a deployed image and machines. Until the first successful `flyctl deploy`, DNS may exist but the service will not respond reliably.

## Cost & limits today

- Fly: 1 shared-cpu-1x VM at 512 MB → free tier covers a single always-on instance.
- Neon: Free tier is 3 GB storage / 10 active hours / day. Upgrade to "Launch" tier ($19/mo) before going live with real users.
- Vercel: static frontend hosting.

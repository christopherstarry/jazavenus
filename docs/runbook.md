# Operations Runbook — Jaza Venus

## Architecture (production)

```
Internet
   |
[Cloudflare]   <-- DDoS / WAF / cache / hides origin IP
   |
[Caddy]        <-- auto TLS via Let's Encrypt, reverse proxy
   |
[Jaza.Api]     <-- ASP.NET Core in Docker
   |
[PostgreSQL]   <-- in Docker, bound to 127.0.0.1 only, LUKS encrypted disk
```

## First-time deploy

Prereqs on the server: Ubuntu 22.04 / Debian 12, Docker Engine + Compose plugin, a domain pointing at the server (or via Cloudflare).

```bash
git clone <repo-url> /opt/jaza
cd /opt/jaza/deploy
cp .env.example .env
chmod 600 .env
nano .env                 # DOMAIN, ACME_EMAIL, DB_PASSWORD, SEED_SUPERADMIN_* — see `.env.example`
docker compose pull
docker compose up -d
docker compose logs -f api
```

First boot: the API auto-applies EF migrations and seeds the SuperAdmin user (credentials printed once to the log — save them, then they are forced to be rotated on first login).

## Daily operations

### Check health

```bash
curl -fsS https://<domain>/health
docker compose ps
docker compose logs --tail=200 api
```

### Backup (recommended automation)

Use a **systemd timer** or `cron` + `pg_dump`. The ASP.NET Core app in this repository does **not** register a nightly backup job; the baseline procedure is:

1. `docker compose exec postgres pg_dump -U jaza_app jaza_venus | gzip > /backups/jaza-$(date +%Y%m%d).sql.gz`.
2. Copy to second drive (`/mnt/backup2`).
3. Weekly: rsync to off-site target (`backup-offsite:/jaza/`).
4. Retention: 30 daily + 12 weekly + 24 monthly. Older files pruned.

### Restore (drill quarterly)

```bash
gunzip /backups/jaza-YYYYMMDD.sql.gz
docker compose exec -T postgres psql -U jaza_app jaza_venus < /backups/jaza-YYYYMMDD.sql
```

Verify by pointing a staging API at the restored database and running smoke tests.

### Deploy a new version

```bash
cd /opt/jaza
git pull
cd deploy
docker compose pull
docker compose up -d --no-deps api    # rolling restart
docker compose logs -f api | head -100
```

Rollback:

```bash
docker compose pull api:<previous-tag>
IMAGE_TAG=<previous-tag> docker compose up -d --no-deps api
```

EF migrations are forward-only; if a bad migration is shipped, restore the previous DB backup.

## Rotate secrets

```bash
nano /opt/jaza/deploy/.env       # SQL passwords / seed settings; ASP.NET cookie sessions rotate by redeploy unless you invalidate Data Protection keys
docker compose up -d --no-deps api
```

## User management (super-admin only, via UI)

- Create / disable users.
- Reset passwords (sends a single-use link via email).
- Force MFA enrolment.
- Assign / revoke roles.

## Incident response

See [`security.md` § Incident response](security.md#incident-response-one-pager).

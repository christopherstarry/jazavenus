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
[SQL Server]   <-- in Docker, bound to 127.0.0.1 only, BitLocker disk
```

## First-time deploy

Prereqs on the server: Ubuntu 22.04 / Debian 12, Docker Engine + Compose plugin, a domain pointing at the server (or via Cloudflare).

```bash
git clone <repo-url> /opt/jaza
cd /opt/jaza/deploy
cp .env.example .env
chmod 600 .env
nano .env                 # fill JWT_KEY, SQL_SA_PASSWORD, JAZA_DB_PASSWORD, DOMAIN, etc.
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

### Backup (automated nightly via Hangfire)

Hangfire job `NightlyBackup` runs at 02:00 server time:

1. `BACKUP DATABASE [JazaVenus] TO DISK = '/backups/jaza-YYYYMMDD.bak' WITH COMPRESSION, ENCRYPTION (...)`.
2. Copy to second drive (`/mnt/backup2`).
3. Weekly: rsync to off-site target (`backup-offsite:/jaza/`).
4. Retention: 30 daily + 12 weekly + 24 monthly. Older files pruned.

### Restore (drill quarterly)

```bash
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQL_SA_PASSWORD" \
  -Q "RESTORE DATABASE [JazaVenus_DR] FROM DISK = '/backups/jaza-YYYYMMDD.bak' WITH MOVE 'JazaVenus' TO '/var/opt/mssql/data/jaza_dr.mdf', MOVE 'JazaVenus_log' TO '/var/opt/mssql/data/jaza_dr.ldf', RECOVERY"
```

Verify by pointing a staging API at `JazaVenus_DR` and running smoke tests.

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
nano /opt/jaza/deploy/.env       # change JWT_KEY (forces all sessions out)
docker compose up -d --no-deps api
```

## User management (super-admin only, via UI)

- Create / disable users.
- Reset passwords (sends a single-use link via email).
- Force MFA enrolment.
- Assign / revoke roles.

## Incident response

See [`security.md` § Incident response](security.md#incident-response-one-pager).

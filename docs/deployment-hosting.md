# Deployment & Hosting Recommendations

This document compares hosting options for Jaza Venus in production. It is written for the client to review and discuss.

---

## What We Need to Host

| Component | Technology | Resource Demand |
|-----------|-----------|----------------|
| **Web App (Frontend)** | React SPA (static files) | Low — served by Caddy or CDN |
| **API Server (Backend)** | .NET 10 (ASP.NET Core) | Medium — handles all business logic |
| **Database** | PostgreSQL 17 | Medium-High — handles all queries |
| **Reverse Proxy** | Caddy | Low — auto HTTPS, routing |
| **CDN / Firewall** | Cloudflare | Free tier is sufficient |
| **Backup Storage** | Off-site location | 50-100 GB growing |

---

## Quick Recommendation

For a **Warehouse Management System with 30–50 users**:

| Tier | Provider | Monthly Cost | Best For |
|------|----------|-------------|----------|
| 🥇 **Budget VPS** | Hetzner | $25–35 | Startups, cost-sensitive |
| 🥈 **Managed VPS** | DigitalOcean | $48–96 | Small team, no DevOps |
| 🥉 **Cloud PaaS** | Azure | $150–300 | Enterprise, compliance needs |
| 🏅 **Bare Metal** | Hetzner | $55–80 | Maximum performance |

**Our recommendation**: Start with a **Hetzner VPS ($35/month)**. It gives dedicated CPU and RAM, runs Docker (which the project is already set up for), and outperforms similarly priced cloud options. Upgrade later if needed.

---

## Option 1: VPS (Virtual Private Server) — RECOMMENDED

You get a dedicated virtual machine. You install Docker, run `docker compose up`, and it's live. This is what the project's `deploy/docker-compose.yml` is designed for.

### Hetzner (Germany / US / Singapore)

Hetzner offers the best price-to-performance ratio for VPS and dedicated servers.

| Plan | vCPU | RAM | Storage | Price/Month |
|------|------|-----|---------|------------|
| CX32 | 4 | 8 GB | 80 GB NVMe | ~$14 |
| **CX42** ✅ | **8** | **16 GB** | **160 GB NVMe** | **~$28** |
| CX52 | 16 | 32 GB | 360 GB NVMe | ~$58 |
| **Dedicated AX42** | **6-core Xeon** | **64 GB** | **2×512 GB NVMe** | **~$55** |

**Recommended for Jaza Venus**: **CX42 ($28/month)**
- 8 vCPU, 16 GB RAM — plenty for PostgreSQL + .NET API + Caddy in Docker
- Add €5/month for automated backups (snapshot)
- Add €1/month for additional volume (backup storage)
- **Total: ~$35/month**

| Item | Cost |
|------|------|
| CX42 VPS | $28/month |
| Automated backups | $5/month |
| Additional storage volume (100 GB) | $2/month |
| Cloudflare | Free |
| Domain name (jaza-venus.com) | $12/year ($1/month) |
| **Total** | **$36/month** |

### DigitalOcean (Worldwide)

Easier UI than Hetzner, slightly more expensive.

| Plan | vCPU | RAM | Storage | Price/Month |
|------|------|-----|---------|------------|
| Basic (2 vCPU) | 2 | 4 GB | 80 GB | $24 |
| **Basic (4 vCPU)** ✅ | **4** | **8 GB** | **160 GB** | **$48** |
| Basic (8 vCPU) | 8 | 16 GB | 320 GB | $96 |
| CPU-Optimized (4 vCPU) | 4 | 8 GB | 100 GB | $84 |

**Recommended**: Basic 4 vCPU ($48/month) + $5/month backups = **$53/month**

### Vultr (Worldwide)

Similar to DigitalOcean, good Asia-Pacific presence (Singapore, Tokyo, Seoul).

| Plan | Price/Month |
|------|------------|
| 4 vCPU / 8 GB / 180 GB NVMe | $48 |
| 8 vCPU / 16 GB / 320 GB NVMe | $96 |

---

## Option 2: Cloud Platform (PaaS) — EASIER, MORE EXPENSIVE

The cloud provider manages the server, updates, and scaling for you. Less control, but less maintenance.

### Azure (Best for .NET + PostgreSQL)

Azure has native support for .NET and offers managed PostgreSQL.

| Service | Specification | Price/Month |
|---------|--------------|------------|
| **App Service** (API) | B2 (2 vCPU, 3.5 GB RAM) — Linux | ~$70 |
| **Azure Database for PostgreSQL** | Basic (2 vCPU, 100 GB) | ~$50 |
| **Static Web Apps** (Frontend) | Free tier | Free |
| **Blob Storage** (Backups) | 100 GB, cool tier | ~$2 |
| **Cloudflare** | Free | Free |
| **Total** | | **~$120/month** |

**Pros**: Fully managed PostgreSQL (no Docker, no DBA), auto-scaling, 99.95% SLA
**Cons**: More expensive, vendor lock-in, costs scale with usage

### AWS (Lightsail — simpler than full EC2)

| Service | Price/Month |
|---------|------------|
| Lightsail (4 vCPU / 16 GB / 320 GB) | $80 |
| RDS PostgreSQL (db.t3.medium) | $40 |
| S3 backups (100 GB) | ~$3 |
| **Total** | **~$125/month** |

### Google Cloud

| Service | Price/Month |
|---------|------------|
| Cloud Run (API, pay-per-use) | ~$40 |
| Cloud SQL (PostgreSQL) | ~$60 |
| Cloud Storage (Frontend + Backups) | ~$5 |
| **Total** | **~$105/month** |

---

## Option 3: Bare Metal Dedicated Server — MAX PERFORMANCE

For maximum performance with no noisy neighbors. Physical server, you control everything.

### Hetzner Dedicated

| Server | CPU | RAM | Storage | Price/Month |
|--------|-----|-----|---------|------------|
| AX42 | Intel Xeon E-2388G (8C/16T) | 64 GB | 2×512 GB NVMe | ~$55 |
| AX52 | AMD Ryzen 7 7700 (8C/16T) | 64 GB | 2×512 GB NVMe | ~$70 |
| AX102 | AMD Ryzen 9 7950X3D (16C/32T) | 128 GB | 2×3.2 TB NVMe | ~$120 |

**AX42 ($55/month)** is overkill for 30-50 users but guarantees maximum performance. PostgreSQL will fly on bare metal NVMe.

---

## Cost Comparison Summary

| Provider | Monthly | Annual | Setup Complexity | DB Support |
|----------|---------|--------|-----------------|-----------|
| **Hetzner CX42** | **$36** | **$432** | Medium (you run Docker) | PostgreSQL in Docker |
| DigitalOcean Basic | $53 | $636 | Medium | PostgreSQL in Docker |
| Hetzner AX42 (Bare Metal) | $60 | $720 | Medium-High | PostgreSQL in Docker |
| Azure Managed | $120 | $1,440 | Low (managed) | Azure PostgreSQL |
| AWS + RDS | $125 | $1,500 | Medium | Managed RDS PostgreSQL |

---

## What About the Frontend Only?

The frontend (React SPA) can be hosted separately for near-zero cost:

| Provider | Cost |
|----------|------|
| **Vercel** | Free (Hobby) or $20/month (Pro) |
| **Cloudflare Pages** | Free |
| **Netlify** | Free (Starter) |
| **GitHub Pages** | Free |

This is fine for the POC. For production, deploy the frontend with the backend on the same server via Docker (Caddy serves the built React files). One server, one deployment, simpler.

---

## Resource Sizing for Jaza Venus (30–50 Users)

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | 4 vCPU | 8 vCPU | PostgreSQL uses all cores efficiently |
| **RAM** | 8 GB | 16 GB | PostgreSQL buffer cache uses available RAM |
| **Storage** | 100 GB SSD | 200 GB NVMe | Database grows ~1-2 GB/month |
| **Backup Storage** | 100 GB | 200 GB | Keep 14 daily + 4 weekly backups |
| **Bandwidth** | 1 TB/month | Unlimited | Most VPS include enough |

### Resource distribution (16 GB RAM / 8 vCPU server)

PostgreSQL is efficient with resources:
- **4–6 GB RAM** for PostgreSQL shared buffers + work mem
- **3–4 GB RAM** for .NET API runtime
- Remaining RAM for OS, Caddy, and file system cache

When running PostgreSQL + .NET API + Caddy on the same machine:
- 16 GB RAM total: 6 GB for PostgreSQL, 4 GB for .NET, 2 GB for OS, 4 GB buffer
- 8 vCPU total: PostgreSQL uses all cores for parallel queries, .NET uses async I/O

---

## Deployment Checklist

```
Before going live, verify:

[ ] Domain purchased (jaza-venus.com or similar)
[ ] Cloudflare set up (DNS + CDN + WAF)
[ ] VPS provisioned with Docker installed
[ ] .env file created from deploy/.env.example
[ ] PostgreSQL initialized with schema (via EF Core migrations)
[ ] SSL certificate working (Caddy auto-handles)
[ ] Backups configured and tested
[ ] Monitoring set up (health check endpoint at /health)
[ ] Firewall: only ports 80/443 open to internet
[ ] SSH: key-only auth, no password login
[ ] All users created with correct roles
[ ] Load tested with 30 concurrent users
```

---

## One-Pager for Client Discussion

| Question | Answer |
|----------|--------|
| **How much does hosting cost?** | $36/month to start (Hetzner VPS). Can scale up as needed. |
| **What about Azure/cloud?** | $150/month, but fully managed. Better if you have no IT staff. |
| **Is our data safe?** | Yes: encrypted in transit (HTTPS), encrypted at rest (TDE), nightly encrypted backups stored off-server. |
| **What if the server goes down?** | Cloudflare shows a "temporarily unavailable" page. Restore from backup in 1-2 hours. For 99.9% uptime, add a second VPS in a different region (adds ~$36/month). |
| **Can we start on VPS and move to Azure later?** | Yes. Docker makes migration easy. The database can be backed up and restored anywhere. |
| **Do we need 24/7 uptime?** | For a WMS serving one warehouse, business-hours uptime (8 AM–6 PM) is sufficient. Nightly backups run outside business hours. |
| **Who manages updates?** | You or your developer. `docker compose pull && docker compose up -d` takes 30 seconds. |
| **How do we handle the legacy data?** | The ETL tool (Jaza.Migration) converts legacy SQL Server data to the new PostgreSQL schema. Test this thoroughly before cutover. |

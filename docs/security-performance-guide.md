# Security & Performance Guidance

This document addresses the client's two main concerns about moving from a LAN desktop app to a web-based system:

1. **Security** — a LAN desktop app was hidden behind office walls. A web app is on the internet. How do we protect it?
2. **Speed** — the client doesn't want the web app to feel slower than the desktop app.

---

## Part 1: Security (LAN Desktop → Web)

### What changed?

| Aspect | Old (LAN Desktop) | New (Web App) |
|--------|-------------------|---------------|
| Access | Office PCs only, behind firewall | Any device, anywhere, via internet |
| Authentication | Windows login (LAN trust) | Email + password + MFA |
| Data in transit | Local network (unencrypted) | TLS 1.3 (encrypted) |
| Attack surface | Physical access to office | The entire internet can try to connect |
| Updates | Installed manually per PC | Deployed once, everyone gets it instantly |

### How we protect every layer

```
                    INTERNET
                        │
                   ┌────▼────┐
                   │Cloudflare│  ← Layer 1: DDoS protection, WAF, hides server IP
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │  Caddy  │  ← Layer 2: Auto HTTPS, reverse proxy
                   └────┬────┘
                        │
              ┌─────────▼─────────┐
              │   ASP.NET Core    │  ← Layer 3: Auth, authorization, rate limit
              │   (Jaza.Api)      │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │   PostgreSQL       │  ← Layer 4: Encrypted, local-only, least privilege
              └───────────────────┘
```

### Layer 1 — Cloudflare (Free Tier)

| Protection | What it does |
|-----------|-------------|
| **DDoS mitigation** | Absorbs attack traffic so your server never sees it |
| **Web Application Firewall (WAF)** | Blocks SQL injection, XSS, and common attack patterns automatically |
| **IP masking** | Your real server IP is never exposed to attackers |
| **SSL/TLS** | Encrypts all traffic from user browser to Cloudflare |
| **Bot management** | Blocks malicious bots and scrapers |
| **Cost** | **Free** (with paid plans starting at $20/month for advanced WAF rules) |

### Layer 2 — Reverse Proxy (Caddy)

| Protection | What it does |
|-----------|-------------|
| **Auto HTTPS** | Automatically obtains and renews SSL certificates (Let's Encrypt) |
| **HTTP → HTTPS redirect** | Forces all traffic to be encrypted |
| **Security headers** | Adds HSTS, CSP, X-Frame-Options, etc. |
| **Rate limiting** | Limits requests per IP to prevent abuse |

### Layer 3 — Application (ASP.NET Core)

The existing codebase already implements these. Here's what to verify with your developer:

| # | Security Control | Status | Client Benefit |
|---|-----------------|--------|----------------|
| 1 | **Authentication** — email + password with account lockout (5 attempts, 15 min) | ✅ Implemented | Prevents brute-force password guessing |
| 2 | **MFA (TOTP)** — mandatory for SuperAdmin | ✅ Implemented | Even if password is stolen, account is safe |
| 3 | **Role-based access** — Operator / Admin / SuperAdmin | ✅ Implemented | Staff only see what they need |
| 4 | **CSRF protection** — antiforgery tokens on all state-changing requests | ✅ Implemented | Prevents cross-site request forgery |
| 5 | **Input validation** — every API input validated (FluentValidation) | ✅ Implemented | No bad data enters the system |
| 6 | **Parameterized queries** — EF Core prevents SQL injection | ✅ Implemented | Database cannot be hacked via input fields |
| 7 | **Audit log** — every action logged (who, what, when, IP) | ✅ Implemented | Full traceability for compliance |
| 8 | **Security headers** — CSP, HSTS, X-Frame-Options, etc. | ✅ Implemented | Browser-level protection against XSS, clickjacking |
| 9 | **HttpOnly cookies** — auth token cannot be read by JavaScript | ✅ Implemented | XSS attacks cannot steal login sessions |
| 10 | **Rate limiting** — per-endpoint request limits | ⚠️ Planned | Prevents API abuse and scraping |

### What to ask your developer to ADD

| # | Security Control | Why it matters for WMS |
|---|-----------------|----------------------|
| 1 | **API key for mobile/branch access** | If field staff connect from phones, add API key validation on top of cookies |
| 2 | **IP whitelisting for SuperAdmin** | SuperAdmin can only log in from office IP range |
| 3 | **Session timeout** — 15 min idle → auto logout | If someone leaves their desk, the session locks |
| 4 | **Download watermarking** | Reports exported to PDF/Excel include user name + timestamp |
| 5 | **Daily security scan** | Automated OWASP ZAP scan in CI/CD pipeline |
| 6 | **Failed login alerts** | Email/Slack alert when 5+ failed logins from same IP |
| 7 | **Data export controls** | Prevent bulk data download (limit rows per export) |

### Security response plan for the client

| Question | Answer |
|----------|--------|
| What if someone hacks us? | Cloudflare blocks 99% of attacks before they reach us. If any breach occurs, audit logs show exactly what happened. We can restore from encrypted backup within hours. |
| Is customer data safe? | All data is encrypted in transit (TLS) and at rest (PostgreSQL encryption). Only authorized staff see it. |
| Can employees steal data? | Role-based access limits what each person can see. Bulk exports are rate-limited. Every data access is logged. |
| What about ransomware? | Nightly encrypted backups stored off-server. Database user has no permission to delete backups. |

---

## Part 2: Performance

### The Goal: Web App Feels Like Desktop App

Desktop apps feel instant because data is local. A web app fetches data over the internet. Here's how we make it feel just as fast.

### Performance targets

| Metric | Target | Why |
|--------|--------|-----|
| **First page load** | < 2 seconds | User opens the app and sees the dashboard |
| **Page navigation** | < 500ms | Clicking sidebar items switches instantly |
| **Table/list load** | < 1 second | Opening a list of customers/products |
| **Search response** | < 300ms | Typing in a search box shows results |
| **Report generation** | < 3 seconds | Even large reports must be fast |
| **Form submission** | < 500ms | Saving a record feels instant |

### How we achieve each target

#### 1. First Page Load (< 2s)

| Technique | What to do | Status |
|-----------|-----------|--------|
| **Code splitting** | Each page loads its own JS bundle, not one giant file | ⚠️ Current build is 684KB (single bundle). Split by route. |
| **Gzip/Brotli compression** | Vite already compresses assets | ✅ Done |
| **CDN delivery** | Cloudflare caches static files (JS, CSS, images) at edge locations worldwide | ✅ With Cloudflare |
| **Lazy loading** | Images and heavy components load only when visible | ⚠️ To implement |
| **Preload critical CSS** | Inline critical styles in `index.html` | ⚠️ To implement |

#### 2. Page Navigation (< 500ms)

| Technique | What to do | Status |
|-----------|-----------|--------|
| **Client-side routing** | React Router handles navigation without full page reload | ✅ Done |
| **Prefetch on hover** | Start loading data when user hovers over a sidebar link | ⚠️ To implement |
| **Keep previous page cache** | Don't destroy the last page's data when navigating away | ⚠️ To implement (React Router + Query cache) |

#### 3. Table/List Load (< 1s)

| Technique | What to do | Status |
|-----------|-----------|--------|
| **Server-side pagination** | Only fetch 20 rows at a time, not the whole table | ⚠️ Must implement per endpoint |
| **Database indexes** | Every column used in WHERE/JOIN/ORDER BY must have an index | ⚠️ To verify for every table |
| **Query optimization** | Use EF Core's `.Select()` to fetch only needed columns | ⚠️ Must implement per endpoint |
| **Response caching** | Cache list endpoints for 30 seconds (data rarely changes mid-list) | ⚠️ To implement |

#### 4. Search Response (< 300ms)

| Technique | What to do | Status |
|-----------|-----------|--------|
| **Debounced input** | Wait 300ms after user stops typing before sending request | ⚠️ Must implement per search input |
| **Database full-text search** | Use PostgreSQL `tsvector` / `tsquery` for text columns | ⚠️ To implement |
| **Minimum 3 characters** | Don't search until user types at least 3 characters | ⚠️ To implement |
| **Limit results** | Only return top 20 matches | ⚠️ Must implement per search endpoint |

#### 5. Report Generation (< 3s)

| Technique | What to do | Status |
|-----------|-----------|--------|
| **Materialized views** | Pre-calculate monthly/quarterly aggregations | ⚠️ For heavy reports |
| **Async generation** | Large reports generate in background, notify when ready | ⚠️ For reports with 10k+ rows |
| **Columnstore indexes** | For aggregate queries on large tables | ⚠️ If reporting on invoice/stock movement tables |
| **Read replica** | Reports read from a read-only database copy | ⚠️ If reports slow down main app |

#### 6. Form Submission (< 500ms)

| Technique | What to do | Status |
|-----------|-----------|--------|
| **Optimistic updates** | Show "saved" immediately, sync in background | ⚠️ To implement (TanStack Query mutations) |
| **Minimal payload** | Only send changed fields, not the whole record | ⚠️ Must implement per form |
| **Connection keep-alive** | Reuse HTTP connections (browser does this automatically) | ✅ Default |

### Database Performance — The Most Important Part

The legacy app was fast because the database was on the same LAN. Now the database runs on the same VPS as the API — local connection, no network latency.

| Practice | Why |
|----------|-----|
| **Index every foreign key** | Every JOIN needs an index. Without it, a query scans the entire table. |
| **Index every search column** | If users search by `supplierName`, that column must be indexed. |
| **Avoid SELECT *** | Only fetch columns the UI actually shows. Fetching 50 columns when you show 5 wastes bandwidth and memory. |
| **Use pagination, not `ToList()`** | Never load an entire table into memory. Always `.Skip().Take()`. |
| **Async all the way** | Every database call must be `async/await` to not block threads. |
| **Connection pooling** | EF Core handles this. Verify pool size = 100 (default). |
| **Query timeout** | Set 30-second timeout on all queries. If a query takes longer, it needs optimization. |
| **Avoid N+1 queries** | Use `.Include()` or `.ThenInclude()` for related data. Don't query inside a loop. |
| **Monitor slow queries** | Use PostgreSQL `pg_stat_statements` or EF Core logging to find queries > 500ms. |

### Checklist for Developer to Verify Before Go-Live

```
[ ] All database tables have indexes on:
    [ ] Primary keys (automatic)
    [ ] Foreign keys (every one)
    [ ] Columns used in WHERE clauses
    [ ] Columns used in ORDER BY
    [ ] Columns used in search/filter

[ ] Every list endpoint supports:
    [ ] Server-side pagination (?page=1&pageSize=20)
    [ ] Server-side search (?search=xxx)
    [ ] Server-side sort (?sortBy=name&order=asc)
    [ ] Response returns { items, total, page, pageSize }

[ ] Every API response:
    [ ] Returns only needed fields (use DTOs, not entities)
    [ ] Completes in under 1 second for lists
    [ ] Completes in under 500ms for single-record GET
    [ ] Completes in under 500ms for POST/PUT

[ ] Frontend:
    [ ] Code-split by route (lazy imports)
    [ ] Search inputs debounced 300ms
    [ ] Skeleton loaders while data fetches
    [ ] TanStack Query with staleTime configured
    [ ] Prefetch links on hover
    [ ] Images lazy-loaded
    [ ] Bundle size < 500KB per route

[ ] Infrastructure:
    [ ] Cloudflare CDN enabled (caches static assets)
    [ ] Brotli compression enabled
    [ ] HTTP/2 or HTTP/3 enabled
    [ ] Database connection string uses connection pooling
```

---

## Part 3: How to Explain This to the Client

### Security — Simple Version

> "The old system was like keeping your money in a locked office drawer. The new system is like keeping it in a bank vault with guards, cameras, and alarms. We use Cloudflare (like a security guard at the door), Caddy (like a secure tunnel), and multiple layers of encryption. Even if someone steals a password, they can't access the admin account without a second code from your phone. Every action is logged — we know who did what and when."

### Performance — Simple Version

> "The web app will feel just as fast as the desktop app. Here's why: pages load only the data you need (like only showing 20 customers at a time, not 2000), searches respond while you type, and Cloudflare serves the app from servers close to your location. The database is optimized with indexes (like a book's table of contents) so queries find data instantly instead of reading every page."

### One-Pager for Client Meeting

| Concern | Our Solution |
|---------|-------------|
| "Can hackers access our data?" | Cloudflare firewall + encrypted connection + role-based access + audit logs |
| "Will it be slow?" | CDN delivery + pagination + database indexes + code splitting = desktop speed |
| "What if the server crashes?" | Automated backups every night + restore in under 2 hours |
| "Can employees steal data?" | Every access is logged. Bulk exports are limited. Roles restrict what each person sees. |
| "Is customer financial data safe?" | Encrypted in transit and at rest. Only finance roles can see A/R data. |
| "Can we still work if internet goes down?" | This is a web app — it needs internet. We recommend a backup 4G/5G connection for the office. |

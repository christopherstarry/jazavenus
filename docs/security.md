# Security — Jaza Venus

This document is the source of truth for security controls. Reviewed before every release.

## Threat model (informal)

- **Asset**: warehouse data (stock levels, costs, customer/supplier records, invoices).
- **Actors**: legitimate users (Operator/Admin/SuperAdmin) on warehouse PCs and phones; opportunistic external attackers (port scanners, credential stuffing); insider misuse (curious or disgruntled employee).
- **Worst-case losses**: data tampering (fake stock movements), data exfiltration (customer list, prices), ransomware on the database.

## OWASP Top-10 (2021) — applied controls

| OWASP risk                          | Control in this codebase                                                                                                                |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| A01 Broken access control           | `[Authorize]` on every controller; **default-deny** via `FallbackPolicy`; policies `RequireSuperAdmin`, `RequireAdmin`, `RequireOperator`. |
| A02 Cryptographic failures          | TLS 1.2+ only; HSTS preload; cookies `HttpOnly`+`Secure`+`SameSite=Strict`; passwords hashed with PBKDF2 (Identity v3, 600k iterations). |
| A03 Injection                       | EF Core parameterised queries; FluentValidation on every DTO; React JSX auto-encodes output.                                            |
| A04 Insecure design                 | Append-only AuditLog; SuperAdmin actions require MFA; double-entry stock movements (cannot edit, only reverse).                         |
| A05 Security misconfiguration       | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy headers; Swagger disabled in production.        |
| A06 Vulnerable components           | `dotnet list package --vulnerable` + `npm audit` in CI; Dependabot weekly PRs.                                                         |
| A07 Authentication failures         | Account lockout 5 attempts / 15 min; password ≥ 12 chars + breach-check (HIBP); MFA required for SuperAdmin.                            |
| A08 Software & data integrity       | Signed Docker images; CI builds reproducible; AuditLog immutable.                                                                       |
| A09 Logging & monitoring            | Serilog structured logs → Seq; security events emitted to a separate sink; failed-login alerts.                                         |
| A10 SSRF                            | No outbound HTTP except a small allow-list (HIBP, NTP); URLs validated.                                                                 |

## Headers (set by `SecurityHeadersMiddleware`)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy:   default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options:    nosniff
X-Frame-Options:           DENY
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        geolocation=(), microphone=(), camera=()
Cross-Origin-Opener-Policy:        same-origin
Cross-Origin-Resource-Policy:      same-origin
```

## Cookie / session strategy

- Identity issues an **HttpOnly + Secure + SameSite=Strict** auth cookie. JavaScript cannot read it → XSS cannot steal it.
- A separate **antiforgery (CSRF) token** is issued in a JS-readable cookie; the SPA echoes it back in the `X-XSRF-TOKEN` header on every state-changing request. The server's `[ValidateAntiForgeryToken]` rejects mismatches.
- Sliding expiration: 60 minutes inactivity → re-login. Hard cap: 12 hours.
- Logout invalidates the cookie server-side (Identity stamp).

## MFA

- TOTP (RFC 6238) compatible with Google Authenticator / Microsoft Authenticator / 1Password.
- **Mandatory** for `SuperAdmin` (cannot be disabled).
- Optional for `Admin`, but enforced via policy if the org enables it in settings.
- Backup codes (10 single-use codes) generated at enrolment.

## Secrets

- **Never** committed. `appsettings.json` contains only non-secret defaults.
- Local dev: `dotnet user-secrets`.
- Production: environment variables loaded from a `.env` file owned by `root` with mode `600`, or **Azure Key Vault** if cloud.
- Connection strings, JWT keys, SMTP credentials, HIBP API key all read from env.

## Database hardening

- Dedicated low-privilege SQL login `jaza_app` (no `db_owner`, no `sysadmin`).
- TDE enabled where available (SQL Server Standard+ / Azure SQL).
- Backups: nightly encrypted `.bak` to a second drive + weekly off-site (encrypted USB or OneDrive Personal Vault).
- SQL Server bound to `localhost` only in production (no port 1433 exposed).

## Network

- Behind **Cloudflare** (free tier): DDoS mitigation, WAF, hides origin IP.
- Origin firewall accepts traffic only from Cloudflare IP ranges on 80/443.
- SSH/RDP allowed only from a static admin IP or via VPN.
- TLS certificate via **Caddy** (ACME / Let's Encrypt, auto-renewing).

## Audit log

- `AuditLog` table is append-only (no UPDATE / DELETE granted to `jaza_app`).
- Captures: actor user id, IP, action, entity, before-JSON, after-JSON, timestamp.
- Sensitive actions always logged: login (success/fail), MFA changes, role changes, document voids, price changes, stock adjustments.
- Retention: 7 years (configurable).

## Dev process controls

- Branch protection on `main`: PR + CI required, no force-push.
- CI runs: build, unit tests, integration tests, `dotnet list package --vulnerable`, `npm audit`, ESLint, OWASP ZAP baseline.
- Pre-commit hook blocks committing secrets (gitleaks).

## Incident response (one-pager)

1. **Detect**: Seq alert / failed-login spike / unusual audit-log entry.
2. **Contain**: rotate JWT signing key, revoke all sessions (`UPDATE AspNetUsers SET SecurityStamp = NEWID()`), block source IPs at Cloudflare.
3. **Eradicate**: identify root cause from logs, patch, redeploy.
4. **Recover**: restore from latest clean backup if data was tampered with.
5. **Lessons**: write post-mortem to `docs/incidents/YYYY-MM-DD.md`.

# Security Review â€” Jaza Venus

**Date:** 2026-07-10  
**Scope:** Audit of [security.md](../security.md), [security-performance-guide.md](../security-performance-guide.md), and codebase configuration.  
**Audience:** Engineering, deployment, security stakeholders.

---

## Executive summary

The new app has **strong security foundations** compared to legacy (no hardcoded SQL creds in app code, PBKDF2 passwords, MFA, CSRF, rate limiting, security headers). However, **one critical finding** must be addressed before production: **database credentials committed to source control**.

**Overall rating:** Good architecture with **one critical blocker** and several medium-priority gaps.

---

## Critical findings

### CRIT-01: Database password in `appsettings.json`

**Location:** `backend/src/Jaza.Api/appsettings.json`  
**Issue:** Production Neon PostgreSQL connection string with password is committed to the repository.

```
ConnectionStrings:Default = Host=ep-purple-term-...;Password=npg_FoBvk6Q0IcRK;...
```

**Risk:** Anyone with repo access can connect to the database. If repo is public or leaked, full data breach.

**Remediation (required before production):**
1. Rotate Neon database password immediately.
2. Remove password from `appsettings.json`; use placeholder or empty string.
3. Load connection string from environment variable or secret manager only.
4. Add `appsettings.json` connection string to `.gitignore` pattern check in CI.
5. Scan git history for exposed secrets; consider BFG Repo-Cleaner if repo was shared.

**Note:** [security.md](../security.md) states "Never committed" but this contradicts current state. Update security.md after fix.

---

## High findings

### HIGH-01: Legacy hardcoded credentials eliminated âœ…

Legacy VB6 used `INSCommon/key2success` and `sa/spvsql` in multiple `.bas`/`.frm` files. New app uses parameterized EF queries and environment-based connection strings (when configured correctly).

**Status:** Resolved in new codebase design; verify ETL scripts do not embed legacy creds.

### HIGH-02: JWT config present but cookie auth used

`appsettings.json` contains JWT settings (`SigningKey: null`) while [architecture.md](../architecture.md) states cookie-based auth only. Unused JWT surface increases confusion and misconfiguration risk.

**Recommendation:** Remove unused JWT config or document why it exists. Ensure no JWT endpoints are exposed without equal hardening.

### HIGH-03: SuperAdmin MFA enforcement

`Auth:RequireSuperAdminMfa: true` in config â€” verify enforced in production deploy profile.

**Recommendation:** Add integration test; block SuperAdmin login without MFA enrolled in Production.

---

## Medium findings

### MED-01: Module/report authorization depth

Permissions gate sidebar and routes via `canAccessModule`. Verify **all API controllers** enforce equivalent policies, not just UI hiding.

| Controller | Policy | Verified |
|------------|--------|----------|
| MasterDataController | RequireOperator | âœ… |
| InboundController | RequireOperator | âœ… |
| OutboundController | RequireOperator | âœ… |
| InvoicingController | RequireOperator | âœ… |
| ReportsController | RequireOperator | âš ï¸ Report-type permission not checked server-side |
| ImportExportController | RequireAdmin | âœ… |

**Recommendation:** Add report-type permission check in `ReportsController` matching frontend `reportKey`.

### MED-02: Cost data masking

Operators cannot see stock cost (`StockController` masks cost). Verify no other endpoints leak cost (reports, PDF).

### MED-03: Audit log coverage

`AuditSaveChangesInterceptor` captures entity changes. Ensure these are always logged:
- Login success/failure âœ…
- MFA changes âœ…
- Document void âœ…
- Price changes âš ï¸ verify
- Stock adjustments âš ï¸ verify
- Permission changes âœ…

### MED-04: CORS configuration

Development allows `localhost:5173`. Production must restrict to actual frontend origin only.

---

## OWASP Top 10 (2021) checklist

| # | Risk | Status | Notes |
|---|------|--------|-------|
| A01 | Broken access control | âœ… Good | FallbackPolicy authenticated; role policies |
| A02 | Cryptographic failures | âš ï¸ | CRIT-01 password in repo |
| A03 | Injection | âœ… Good | EF parameterized; FluentValidation |
| A04 | Insecure design | âœ… Good | Append-only audit; MFA for SuperAdmin |
| A05 | Security misconfiguration | âš ï¸ | CRIT-01; Swagger disabled in prod âœ… |
| A06 | Vulnerable components | âœ… | CI npm audit / dotnet vulnerable |
| A07 | Auth failures | âœ… Good | Lockout, rate limit, MFA |
| A08 | Software integrity | âœ… | CI builds; audit immutable |
| A09 | Logging failures | âœ… | Serilog; security events |
| A10 | SSRF | âœ… | No outbound HTTP except allow-list |

---

## Legacy vs new security comparison

| Control | Legacy VB6 | New Jaza Venus |
|---------|-----------|----------------|
| Password storage | RC4 reversible | PBKDF2 600k iterations |
| DB credentials | Hardcoded in source | Env vars (when fixed) |
| SQL injection | String concat ADO | EF parameterized |
| Auth | Employee code + encrypted pwd | Identity + lockout + MFA |
| CSRF | N/A (desktop) | Antiforgery token |
| Audit | SistemLog (partial) | AuditLog interceptor |
| TLS | N/A | HTTPS + HSTS |
| Rate limiting | None | Global + login limits |

---

## Deployment security checklist

Before go-live:

- [ ] CRIT-01: Rotate Neon password; remove from repo
- [ ] All secrets in environment / Key Vault
- [ ] `Jwt:SigningKey` removed or secured if unused
- [ ] CORS restricted to production domain
- [ ] SuperAdmin MFA enforced and tested
- [ ] PostgreSQL role `jaza_app` least privilege (no SUPERUSER)
- [ ] Neon IP allowlist or private networking if available
- [ ] Cloudflare WAF enabled
- [ ] Backup encryption verified ([runbook.md](../runbook.md))
- [ ] Dependabot / CI vulnerability scan green
- [ ] Report API permission check added (MED-01)

---

## Related documents

- [security.md](../security.md) â€” source of truth for controls
- [security-performance-guide.md](../security-performance-guide.md)
- [modules/auth/flow/mfa-and-security.md](../modules/auth/flow/mfa-and-security.md)
- [runbook.md](../runbook.md)

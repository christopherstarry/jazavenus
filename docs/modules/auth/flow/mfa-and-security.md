# MFA and the Security Story

This is for the owner — the person who wants a one-page answer to "is this safe enough?".

## What MFA we use

We support **TOTP** — the same 6-digit codes that change every 30 seconds, used by Google Authenticator, Microsoft Authenticator, Authy, 1Password, and Bitwarden. No SMS codes; no email codes; no push notifications. TOTP is supported by every modern phone, doesn't depend on a phone number, works offline, and isn't vulnerable to SIM swap attacks.

## Who must use MFA

| Role        | MFA in production           | MFA in development        |
| ----------- | --------------------------- | ------------------------- |
| Sales       | Optional (recommended)      | Optional                  |
| Admin       | Optional (recommended)      | Optional                  |
| **SuperAdmin** | **Required.** A SuperAdmin who has not enrolled cannot sign in. | Optional (so we can demo). |
| Developer   | Strongly recommended        | Optional                  |

The "must enrol" rule for SuperAdmin in production is enforced by `Auth__RequireSuperAdminMfa = true` in Fly secrets. Switch it off only with a written reason.

## How a user enrols

1. Sign in normally.
2. Open **Settings → Security → Set up MFA** (UI in progress; the API is `POST /api/auth/mfa/init` and `/api/auth/mfa/confirm`).
3. The page shows a QR code and a typed shared key.
4. Open your authenticator app, tap "Add account", scan the QR code (or paste the key).
5. The app shows a 6-digit code that refreshes every 30 seconds. Type the current code on the page and click **Confirm**.
6. The system shows you **10 single-use backup codes**. Print them and put them in a safe. If you ever lose your phone, those are how you get back in.

From that point on, signing in requires the code on top of the password.

## Account lockout

After **5 wrong password attempts** in a short window, the account is locked for 30 minutes. The locked user sees a clear message and waits. There is no exponential back-off — it's a flat 30 minutes. If the lock is genuinely a mistake, a SuperAdmin can clear it manually via the user-management screen (UI pending; API available).

This is how we limit the impact of someone trying common passwords.

## Rate limits in front of /login and /refresh

| Endpoint         | Limit                                                  |
| ---------------- | ------------------------------------------------------ |
| `POST /api/auth/login`   | 10 requests per minute, partitioned by source IP.       |
| `POST /api/auth/refresh` | 30 requests per minute, partitioned by user (or IP).    |
| All other endpoints      | 240 requests per minute per IP, global guard.          |

Beyond those a request gets a **429 Too Many Requests**. Honest staff never hit them.

## Where the secrets live

- **Password hashes** — in PostgreSQL, hashed with PBKDF2 + per-user salt + 100k iterations. We never log them.
- **JWT signing key** — Fly secret `Auth__Jwt__SigningKey`. 64 random bytes (`openssl rand -base64 64`). Rotating this key effectively forces every user to sign in again. Plan for ~30 seconds of "signed-out" friction during rotation, since old tokens stay rejected.
- **Refresh token hashes** — in PostgreSQL. Only SHA-256 hashes; the raw value is shown to the client once and never stored.
- **TOTP shared secrets** — in PostgreSQL (Identity tables). They're per-user, generated on enrolment.
- **Database password** — in Fly secrets (`ConnectionStrings__Default`). Neon enforces TLS so the password never crosses the wire in plaintext.

## Audit log

Every important auth action is recorded. Today it captures:

- `Login.Success`, `Login.Failed`, `Login.Locked`
- `Logout`
- `Password.Changed` (by an admin)
- `Password.ChangedSelf` (self-service)
- `MFA.Enabled`

Each record has IP, user agent, timestamp, and the user's id/email. Retention follows the database backup window (Neon's PITR). For long-term audit you'd export periodically; the table doesn't get pruned automatically.

## What the API checks on every request

When a request arrives at any controller protected by `[Authorize]`:

1. Read the access token (Bearer header) **or** the session cookie.
2. Verify the JWT signature OR validate the cookie.
3. Look up the `SecurityVersion` claim against the database. Mismatch → 401.
4. Look up `IsActive` on the user. Deactivated → 401.
5. Run the policy check (e.g. is this the right role? does the user have the module permission?). Fails → 403.

So a stolen token stops working as soon as the password is changed, even if the 15-minute clock hasn't run out.

## What we are NOT doing today (and might do later)

- **WebAuthn / passkeys** — proper phishing-resistant MFA. The work is roughly two days; not in this PRD.
- **IP allow-listing** — restrict sign-in to office or VPN IPs. Easy to add via the rate limiter.
- **Geo / device anomaly detection** — sign-in from a new country triggers MFA again. Too heavy for the current user count.
- **Password breach checks** — verify new passwords against haveibeenpwned. A few lines of code; ask if you want it.

## Common security questions, short answers

**Can someone bypass the lockout by hammering with different IPs?** No, the lockout is per *user*, not per IP. The IP rate limit handles the parallel-attack case.

**What if the JWT signing key leaks?** Anyone who has it can forge access tokens for any user. The fix is rotating the secret on Fly (`flyctl secrets set Auth__Jwt__SigningKey=...`). Old tokens immediately stop working. Refresh tokens still work since they live in the database, not in the JWT, so users get re-issued new access tokens silently — they may not even notice.

**Is the database backed up?** Neon does point-in-time recovery for the past 24 hours on the free tier, longer on paid tiers. Configure backups to suit your RTO/RPO.

**Can a Developer impersonate another user?** Yes — by resetting their password. The audit log records who did it. We do not have a "log in as" feature; if you suspect misuse, look at `Password.Changed` events with `by=` on accounts the actor doesn't own.
